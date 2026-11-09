import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// The Android app's upload path: app_save_sail (idempotent by client_id), sail_events RLS and media client ids.

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

const save = (p: object) => db.query<{ r: { id: string; slug: string; status: string } }>(`select public.app_save_sail($1::jsonb) as r`, [JSON.stringify(p)]).then((r) => r.rows[0]!.r);

const CID = "11111111-2222-4333-8444-555555555555";
const payload = (extra: object = {}) => ({
  client_id: CID,
  slug: "2026-11-08-evening-on-the-poel",
  title: "Evening on the Poel",
  date: "2026-11-08",
  location: "De Poel",
  role: "skipper",
  crew: ["Ayse", "Tom"],
  sails_used: "main + jib",
  reef: true,
  rating: 4,
  notes: "Gusty",
  events: [
    { at: "2026-11-08T15:00:00Z", kind: "cast_off", lat: 52.3, lon: 4.84, data: {} },
    { at: "2026-11-08T15:02:00Z", kind: "engine_off", lat: 52.301, lon: 4.841, data: {} },
    { at: "2026-11-08T15:03:00Z", kind: "sail_up", lat: 52.302, lon: 4.842, data: { sail: "main" } },
  ],
  ...extra,
});

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(join(dir, "tests", "supabase-stub.sql"), "utf8"));
  for (const file of readdirSync(join(dir, "migrations")).sort()) {
    await db.exec(readFileSync(join(dir, "migrations", file), "utf8"));
  }
  // The migration is meant to be pasted again later: it must be re-runnable.
  await db.exec(readFileSync(join(dir, "migrations", "0005_sail_log.sql"), "utf8"));
  for (const [k, email] of [["melih", "melihteke@gmail.com"], ["stranger", "stranger@gmail.com"]]) {
    users[k!] = (await db.query<{ id: string }>(`insert into auth.users (email) values ($1) returning id`, [email])).rows[0]!.id;
  }
}, 60_000);

afterAll(async () => {
  await db?.close();
});

beforeEach(async () => {
  await db.exec(`delete from public.sail_events; delete from public.sail_media; delete from public.sails;`);
});

describe("app_save_sail", () => {
  it("creates a draft from the app with crew, events and source", async () => {
    const r = await as("melih", () => save(payload({ gpx_path: `${CID}/track.gpx` })));
    expect(r.id).toBe(CID);
    expect(r.slug).toBe("2026-11-08-evening-on-the-poel");
    expect(r.status).toBe("draft");
    expect((await db.query<{ gpx_path: string }>(`select gpx_path from public.sails where id = $1`, [r.id])).rows[0]!.gpx_path).toBe(`${CID}/track.gpx`);
    const row = (await db.query<{ source: string; crew: string[]; reef: boolean; role: string; rating: number }>(`select source, crew, reef, role, rating from public.sails where id = $1`, [r.id])).rows[0]!;
    expect(row).toEqual({ source: "app", crew: ["Ayse", "Tom"], reef: true, role: "skipper", rating: 4 });
    const ev = await db.query<{ kind: string; data: { sail?: string } }>(`select kind, data from public.sail_events where sail_id = $1 order by at`, [r.id]);
    expect(ev.rows.map((e) => e.kind)).toEqual(["cast_off", "engine_off", "sail_up"]);
    expect(ev.rows[2]!.data.sail).toBe("main");
  });

  it("is idempotent: a retry keeps one sail and replaces the events", async () => {
    const a = await as("melih", () => save(payload()));
    const b = await as("melih", () => save(payload({ events: [{ at: "2026-11-08T16:00:00Z", kind: "docked", lat: 52.3, lon: 4.84 }] })));
    expect(b.id).toBe(a.id);
    expect((await db.query(`select 1 from public.sails`)).rows).toHaveLength(1);
    expect((await db.query<{ kind: string }>(`select kind from public.sail_events`)).rows.map((r) => r.kind)).toEqual(["docked"]);
  });

  it("does not overwrite fields edited on the site after the first upload", async () => {
    const a = await as("melih", () => save(payload()));
    await db.query(`update public.sails set title = 'Edited on the site' where id = $1`, [a.id]);
    await as("melih", () => save(payload({ title: "From the phone again" })));
    expect((await db.query<{ title: string }>(`select title from public.sails where id = $1`, [a.id])).rows[0]!.title).toBe("Edited on the site");
  });

  it("finds a free slug when the same title is used twice on a day", async () => {
    await as("melih", () => save(payload()));
    const b = await as("melih", () => save(payload({ client_id: "99999999-2222-4333-8444-555555555555" })));
    expect(b.slug).toBe("2026-11-08-evening-on-the-poel-2");
  });

  it("refuses anonymous and non-admin callers", async () => {
    expect(await as(null, () => attempt(() => save(payload())))).toMatch(/permission denied|not allowed/);
    expect(await as("stranger", () => attempt(() => save(payload())))).toMatch(/not allowed/);
    expect((await db.query(`select 1 from public.sails`)).rows).toHaveLength(0);
  });

  it("rejects a malformed slug", async () => {
    expect(await as("melih", () => attempt(() => save(payload({ slug: "Bad Slug!" }))))).toMatch(/invalid slug/);
  });
});

describe("sail_events and media visibility", () => {
  it("shows events of published sails only to visitors", async () => {
    const r = await as("melih", () => save(payload()));
    const count = () => as(null, () => db.query(`select 1 from public.sail_events`)).then((x) => x.rows.length);
    expect(await count()).toBe(0);
    await db.query(`update public.sails set status = 'published' where id = $1`, [r.id]);
    expect(await count()).toBe(3);
    expect(await as("stranger", () => attempt(() => db.query(`insert into public.sail_events (sail_id, at, kind) values ($1, now(), 'note')`, [r.id])))).toMatch(/row-level security/);
  });

  it("ignores a photo uploaded twice (same client_id)", async () => {
    const r = await as("melih", () => save(payload()));
    const ins = () =>
      as("melih", () =>
        db.query(
          `insert into public.sail_media (sail_id, kind, storage_path, lat, lon, client_id) values ($1, 'photo', 'sails/x/p.jpg', 52.3, 4.84, 'aaaaaaaa-2222-4333-8444-555555555555') on conflict (client_id) do nothing`,
          [r.id],
        ),
      );
    await ins();
    await ins();
    expect((await db.query(`select lat, lon from public.sail_media`)).rows).toEqual([{ lat: 52.3, lon: 4.84 }]);
  });
});
