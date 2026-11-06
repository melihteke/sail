import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import courses from "../../src/academy/games/race/courses.json";
import { botRace } from "../../src/academy/games/race/bot";
import { initialState, simulate, step, type CourseData, type HelmEvent } from "../../src/academy/games/race/sim";

// The server must reach exactly the same result as the browser for every helm log.

const dir = join(import.meta.dirname, "..");
let db: PGlite;
let admin = "";

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(join(dir, "tests", "supabase-stub.sql"), "utf8"));
  for (const file of readdirSync(join(dir, "migrations")).sort()) {
    await db.exec(readFileSync(join(dir, "migrations", file), "utf8"));
  }
  admin = (await db.query<{ id: string }>(`insert into auth.users (email) values ('melihteke@gmail.com') returning id`)).rows[0]!.id;
}, 120_000);

afterAll(async () => {
  await db?.close();
});

async function serverSim(c: CourseData, events: HelmEvent[]) {
  const r = await db.query<{ r: { status: string; time: number | null; tacks: number; gybes: number; distance: number } }>(
    `select public.race_simulate($1::jsonb, $2::jsonb) as r`,
    [JSON.stringify(c), JSON.stringify(events)],
  );
  const { status, time, tacks, gybes, distance } = r.rows[0]!.r;
  return { status, time: time === null ? null : Number(time), tacks, gybes, distance };
}

/** Small deterministic random generator for fuzzing helm logs. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const list = courses as unknown as { meta: { id: string }; course: CourseData }[];

describe("race simulation: browser and server agree", () => {
  for (const { meta, course } of list) {
    it(`${meta.id}: autopilot races finish with identical results`, async () => {
      for (const opts of [{}, { upwindTwa: 42, downwindTwa: 140 }, { upwindTwa: 50, downwindTwa: 160 }]) {
        const { events, final } = botRace(course, step, initialState(course), opts);
        const js = simulate(course, events);
        expect(js.time).toBe(final.finishTime);
        const sql = await serverSim(course, events);
        expect(sql).toEqual(js);
      }
    }, 60_000);

    it(`${meta.id}: random helming (crashes, recalls, time-outs) matches`, async () => {
      const rand = rng(meta.id.length * 7919);
      for (let n = 0; n < 4; n++) {
        const events: HelmEvent[] = [];
        let t = -60;
        while (t < 1500) {
          events.push([t, Math.floor(rand() * 360)]);
          t += 5 + Math.floor(rand() * 120);
        }
        const js = simulate(course, events);
        expect(await serverSim(course, events)).toEqual(js);
      }
    }, 60_000);
  }
});

async function as<T>(who: "anon" | "admin", fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${who === "admin" ? "authenticated" : "anon"}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [who === "admin" ? admin : ""]);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

async function attempt(fn: () => Promise<unknown>) {
  try {
    await fn();
    return "ok";
  } catch (error) {
    return (error as Error).message;
  }
}

const poel = list[0]!;
const finishing = botRace(poel.course, step, initialState(poel.course)).events;

async function start(name: string) {
  return (await as("anon", () => db.query<{ id: string }>(`select public.race_start($1, $2) as id`, [poel.meta.id, name]))).rows[0]!.id;
}

async function submit(session: string, events: HelmEvent[], ageSeconds = 600) {
  await db.query(`update public.race_sessions set started_at = now() - make_interval(secs => $2) where id = $1`, [session, ageSeconds]);
  return (await as("anon", () => db.query<{ r: Record<string, unknown> }>(`select public.race_submit($1, $2::jsonb) as r`, [session, JSON.stringify(events)]))).rows[0]!.r;
}

describe("race API", () => {
  beforeEach(async () => {
    await db.exec(`delete from public.race_results; delete from public.race_sessions;`);
  });

  it("rejects bad names and unknown courses", async () => {
    expect(await attempt(() => start("x"))).toContain("invalid name");
    expect(await attempt(() => start("<script>"))).toContain("invalid name");
    expect(await attempt(() => as("anon", () => db.query(`select public.race_start('nope', 'Melih')`)))).toContain("course not available");
  });

  it("re-sails the race and puts a finish on the scoreboard", async () => {
    const r = await submit(await start("Melih"), finishing);
    const js = simulate(poel.course, finishing);
    expect(r).toMatchObject({ status: "finished", accepted: true, rank: 1, on_board: true, personal_best: true });
    expect(Number(r.time)).toBe(js.time);
    const board = await as("anon", () => db.query<{ name: string; time_s: string }>(`select name, time_s from public.race_results`));
    expect(board.rows).toEqual([{ name: "Melih", time_s: String(js.time) }]);
  });

  it("does not accept a result sooner than it could be sailed, nor a reused session", async () => {
    const session = await start("Speedy");
    const r = await submit(session, finishing, 5);
    expect(r).toMatchObject({ accepted: false, reason: "too-fast" });
    expect(await attempt(() => submit(session, finishing))).toContain("unknown or used session");
    expect((await db.query(`select 1 from public.race_results`)).rows).toHaveLength(0);
  });

  it("rejects malformed helm logs", async () => {
    for (const bad of [[[0, 400]], [[10, 5], [5, 5]], [[0.5, 10]], [["a", 1]], [[1, 2, 3]]]) {
      const session = await start("Tester");
      expect(await attempt(() => submit(session, bad as HelmEvent[]))).toContain("invalid helm log");
    }
  });

  it("keeps one best entry per name", async () => {
    await submit(await start("Melih"), finishing);
    const slower = botRace(poel.course, step, initialState(poel.course), { upwindTwa: 48, downwindTwa: 155 }).events;
    expect(simulate(poel.course, slower).status).toBe("finished");
    const r = await submit(await start("melih"), slower);
    const rows = (await db.query<{ n: number }>(`select count(*)::int as n from public.race_results`)).rows[0]!.n;
    expect(rows).toBe(1);
    expect(r.personal_best).toBe(simulate(poel.course, slower).time! < simulate(poel.course, finishing).time!);
  });

  it("keeps the best 30 per course", async () => {
    await db.exec(`insert into public.race_results (course_id, name, time_s, source)
      select '${poel.meta.id}', 'Fake ' || g, 900 + g, 'admin' from generate_series(1, 35) g`);
    const rows = (await db.query<{ n: number; worst: string }>(`select count(*)::int as n, max(time_s)::text as worst from public.race_results`)).rows[0]!;
    expect(rows).toEqual({ n: 30, worst: "930.0" });
  });

  it("lets only the admin add, delete or change the current course", async () => {
    const insert = `insert into public.race_results (course_id, name, time_s, source) values ('${poel.meta.id}', 'Ghost', 999, 'admin')`;
    expect(await attempt(() => as("anon", () => db.exec(insert)))).not.toBe("ok");
    expect(await as("admin", async () => attempt(() => db.exec(insert)))).toBe("ok");
    await as("anon", () => db.exec(`delete from public.race_results`));
    expect((await db.query(`select 1 from public.race_results`)).rows).toHaveLength(1);
    await as("admin", () => db.exec(`delete from public.race_results`));
    expect((await db.query(`select 1 from public.race_results`)).rows).toHaveLength(0);

    expect(await attempt(() => as("anon", () => db.query(`select public.race_set_current('garda')`)))).not.toBe("ok");
    await as("admin", () => db.query(`select public.race_set_current('garda')`));
    const current = (await db.query<{ id: string }>(`select id from public.race_courses where is_current`)).rows;
    expect(current).toEqual([{ id: "garda" }]);
    await as("admin", () => db.query(`select public.race_set_current('${poel.meta.id}')`));
  });

  it("hides sessions and the simulator from visitors", async () => {
    await start("Melih");
    expect((await as("anon", () => db.query(`select * from public.race_sessions`))).rows).toHaveLength(0);
    expect(await attempt(() => as("anon", () => db.query(`select public.race_simulate('{}'::jsonb, '[]'::jsonb)`)))).toContain("permission denied");
  });

  it("limits how many races one network can start per hour", async () => {
    for (let i = 0; i < 40; i++) await start("Spammer");
    expect(await attempt(() => start("Spammer"))).toContain("too many races");
  });
});
