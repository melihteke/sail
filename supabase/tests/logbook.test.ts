import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// 0006: private notes, revision history, structured log fields and admin-edited event logs.

const dir = join(import.meta.dirname, "..");
let db: PGlite;
const users: Record<string, string> = {};

async function as<T>(who: string | null, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${who ? "authenticated" : "anon"}`);
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [who ? users[who]! : ""]);
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

async function newSail(status = "published") {
  return (
    await db.query<{ id: string }>(
      `insert into public.sails (slug, status, title, date, how_it_went) values ('s-' || substr(md5(random()::text), 1, 8), $1, 'First title', '2026-11-08', 'Calm') returning id`,
      [status],
    )
  ).rows[0]!.id;
}

const revisions = (sailId: string) =>
  db.query<{ id: string; snapshot: { title: string; how_it_went: string } }>(`select id, snapshot from public.sail_revisions where sail_id = $1 order by changed_at desc`, [sailId]).then((r) => r.rows);

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(join(dir, "tests", "supabase-stub.sql"), "utf8"));
  for (const file of readdirSync(join(dir, "migrations")).sort()) {
    await db.exec(readFileSync(join(dir, "migrations", file), "utf8"));
  }
  await db.exec(readFileSync(join(dir, "migrations", "0006_logbook_pro.sql"), "utf8"));
  for (const [k, email] of [["melih", "melihteke@gmail.com"], ["stranger", "stranger@gmail.com"]]) {
    users[k!] = (await db.query<{ id: string }>(`insert into auth.users (email) values ($1) returning id`, [email])).rows[0]!.id;
  }
}, 60_000);

afterAll(async () => {
  await db?.close();
});

beforeEach(async () => {
  await db.exec(`delete from public.sail_events; delete from public.sail_revisions; delete from public.sail_private; delete from public.sails;`);
});

describe("private notes", () => {
  it("are hidden from visitors and other users even when the sail is published", async () => {
    const id = await newSail();
    await as("melih", () => db.query(`insert into public.sail_private (sail_id, notes) values ($1, 'Crew was seasick')`, [id]));
    expect(await as(null, () => db.query(`select * from public.sail_private`)).then((r) => r.rows)).toHaveLength(0);
    expect(await as("stranger", () => db.query(`select * from public.sail_private`)).then((r) => r.rows)).toHaveLength(0);
    expect(await as("stranger", () => attempt(() => db.query(`insert into public.sail_private (sail_id, notes) values ($1, 'x')`, [id])))).toMatch(/row-level security|duplicate/);
    expect(await as("melih", () => db.query<{ notes: string }>(`select notes from public.sail_private`)).then((r) => r.rows[0]!.notes)).toBe("Crew was seasick");
  });
});

describe("structured log fields", () => {
  it("rejects values outside the lists", async () => {
    const id = await newSail();
    expect(await attempt(() => db.query(`update public.sails set sea_state = 'wild' where id = $1`, [id]))).toMatch(/sails_sea_state_check/);
    expect(await attempt(() => db.query(`update public.sails set observed_bft = 13 where id = $1`, [id]))).toMatch(/sails_observed_bft_check/);
    expect(await attempt(() => db.query(`update public.sails set passage_type = 'passage', tidal = true, night_hours = 2.5 where id = $1`, [id]))).toBe("ok");
  });
});

describe("revisions", () => {
  it("stores the previous version once per editing session and skips track-only updates", async () => {
    const id = await newSail();
    await db.query(`update public.sails set stats = '{"x":1}' where id = $1`, [id]);
    expect(await revisions(id)).toHaveLength(0);
    await db.query(`update public.sails set title = 'Second' where id = $1`, [id]);
    await db.query(`update public.sails set title = 'Third' where id = $1`, [id]);
    const revs = await revisions(id);
    expect(revs).toHaveLength(1);
    expect(revs[0]!.snapshot.title).toBe("First title");
    expect(revs[0]!.snapshot).not.toHaveProperty("track");
  });

  it("are admin-only and restoring keeps the current version", async () => {
    const id = await newSail();
    await db.query(`update public.sails set title = 'Second', how_it_went = 'Gusty' where id = $1`, [id]);
    const [rev] = await revisions(id);
    expect(await as(null, () => db.query(`select * from public.sail_revisions`)).then((r) => r.rows)).toHaveLength(0);
    expect(await as("stranger", () => attempt(() => db.query(`select public.restore_sail_revision($1)`, [rev!.id])))).toMatch(/not allowed/);

    await as("melih", () => db.query(`select public.restore_sail_revision($1)`, [rev!.id]));
    const row = (await db.query<{ title: string; how_it_went: string }>(`select title, how_it_went from public.sails where id = $1`, [id])).rows[0]!;
    expect(row).toEqual({ title: "First title", how_it_went: "Calm" });
    expect((await revisions(id))[0]!.snapshot.title).toBe("Second");
  });
});

describe("app uploads after editing the event log", () => {
  const CID = "11111111-2222-4333-8444-666666666666";
  const save = (events: object[]) =>
    db.query(`select public.app_save_sail($1::jsonb)`, [JSON.stringify({ client_id: CID, slug: "app-sail", title: "App", date: "2026-11-08", events })]);

  it("keeps the admin's log once an event was edited", async () => {
    await as("melih", () => save([{ at: "2026-11-08T15:00:00Z", kind: "cast_off" }]));
    await db.query(`update public.sail_events set kind = 'docked', edited = true where sail_id = $1`, [CID]);
    await as("melih", () => save([{ at: "2026-11-08T15:00:00Z", kind: "cast_off" }, { at: "2026-11-08T16:00:00Z", kind: "note" }]));
    expect((await db.query<{ kind: string }>(`select kind from public.sail_events where sail_id = $1`, [CID])).rows.map((r) => r.kind)).toEqual(["docked"]);
  });

  it("still replaces an untouched log", async () => {
    await as("melih", () => save([{ at: "2026-11-08T15:00:00Z", kind: "cast_off" }]));
    await as("melih", () => save([{ at: "2026-11-08T16:00:00Z", kind: "note" }]));
    expect((await db.query<{ kind: string }>(`select kind from public.sail_events where sail_id = $1`, [CID])).rows.map((r) => r.kind)).toEqual(["note"]);
  });
});
