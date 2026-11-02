import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

// Runs the real migrations in an in-process Postgres (PGlite) with a stubbed Supabase auth/storage
// schema, then checks the row level security as the roles Supabase uses.

const dir = join(import.meta.dirname, "..");
let db: PGlite;
const users: Record<string, string> = {};

async function addUser(key: string, email: string) {
  const res = await db.query<{ id: string }>(`insert into auth.users (email) values ($1) returning id`, [email]);
  users[key] = res.rows[0]!.id;
}

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

beforeAll(async () => {
  db = new PGlite();
  await db.exec(readFileSync(join(dir, "tests", "supabase-stub.sql"), "utf8"));
  for (const file of readdirSync(join(dir, "migrations")).sort()) {
    await db.exec(readFileSync(join(dir, "migrations", file), "utf8"));
  }
  await addUser("melih", "MelihTeke@gmail.com");
  await addUser("stranger", "stranger@gmail.com");
}, 60_000);

afterAll(async () => {
  await db?.close();
});

beforeEach(async () => {
  await db.exec(`delete from public.sail_media; delete from public.sails; delete from public.boats; delete from storage.objects;`);
  await db.exec(`
    insert into public.boats (id, slug, name, is_default) values ('00000000-0000-0000-0000-0000000000b1', 'polyvalk', 'Polyvalk', true);
    insert into public.sails (id, slug, title, date, status) values
      ('00000000-0000-0000-0000-00000000000a', 'published-sail', 'Published', '2026-10-17', 'published'),
      ('00000000-0000-0000-0000-00000000000b', 'draft-sail', 'Draft', '2026-10-18', 'draft');
    insert into public.sail_media (sail_id, kind, url) values
      ('00000000-0000-0000-0000-00000000000a', 'youtube', 'https://youtu.be/aaaaaaaaaaa'),
      ('00000000-0000-0000-0000-00000000000b', 'youtube', 'https://youtu.be/bbbbbbbbbbb');
  `);
});

describe("is_admin", () => {
  it("is true only for an admin email, case-insensitively", async () => {
    expect((await as("melih", () => db.query<{ a: boolean }>(`select public.is_admin() as a`))).rows[0]!.a).toBe(true);
    expect((await as("stranger", () => db.query<{ a: boolean }>(`select public.is_admin() as a`))).rows[0]!.a).toBe(false);
    expect((await as(null, () => db.query<{ a: boolean }>(`select public.is_admin() as a`))).rows[0]!.a).toBe(false);
  });
});

describe("visitors", () => {
  for (const who of [null, "stranger"] as const) {
    const label = who ?? "anon";

    it(`${label} sees only published sails and their media`, async () => {
      const sails = await as(who, () => db.query<{ slug: string }>(`select slug from public.sails order by slug`));
      expect(sails.rows.map((r) => r.slug)).toEqual(["published-sail"]);
      const media = await as(who, () => db.query<{ url: string }>(`select url from public.sail_media`));
      expect(media.rows.map((r) => r.url)).toEqual(["https://youtu.be/aaaaaaaaaaa"]);
    });

    it(`${label} can read boats`, async () => {
      const boats = await as(who, () => db.query(`select * from public.boats`));
      expect(boats.rows).toHaveLength(1);
    });

    it(`${label} cannot write anything`, async () => {
      expect(await attempt(() => as(who, () => db.query(`insert into public.sails (slug, title, date) values ('x', 'X', '2026-01-01')`)))).toMatch(/row-level security/);
      expect(await attempt(() => as(who, () => db.query(`insert into public.boats (slug, name) values ('x', 'X')`)))).toMatch(/row-level security/);
      expect(await attempt(() => as(who, () => db.query(`insert into storage.objects (bucket_id, name) values ('media', 'x.jpg')`)))).toMatch(/row-level security/);
      const updated = await as(who, () => db.query(`update public.sails set title = 'hacked' returning id`));
      expect(updated.rows).toHaveLength(0);
      const deleted = await as(who, () => db.query(`delete from public.boats returning id`));
      expect(deleted.rows).toHaveLength(0);
    });

    it(`${label} cannot list admins`, async () => {
      const admins = await as(who, () => db.query(`select * from public.admins`));
      expect(admins.rows).toHaveLength(0);
    });
  }
});

describe("admin", () => {
  it("sees drafts and can create, edit and delete", async () => {
    const all = await as("melih", () => db.query(`select slug from public.sails`));
    expect(all.rows).toHaveLength(2);
    expect(await attempt(() => as("melih", () => db.query(`insert into public.sails (slug, title, date) values ('new-sail', 'New', '2026-11-01')`)))).toBe("ok");
    const upd = await as("melih", () => db.query(`update public.sails set title = 'Edited' where slug = 'draft-sail' returning id`));
    expect(upd.rows).toHaveLength(1);
    expect(await attempt(() => as("melih", () => db.query(`insert into storage.objects (bucket_id, name) values ('media', 'sails/x/1.jpg')`)))).toBe("ok");
    const del = await as("melih", () => db.query(`delete from public.boats returning id`));
    expect(del.rows).toHaveLength(1);
  });

  it("sets published_at when a sail is published", async () => {
    await as("melih", () => db.query(`update public.sails set status = 'published' where slug = 'draft-sail'`));
    const row = await db.query<{ published_at: string | null }>(`select published_at from public.sails where slug = 'draft-sail'`);
    expect(row.rows[0]!.published_at).not.toBeNull();
  });

  it("allows only one default boat", async () => {
    expect(await attempt(() => as("melih", () => db.query(`insert into public.boats (slug, name, is_default) values ('second', 'Second', true)`)))).toMatch(/duplicate key/);
  });

  it("rejects invalid slugs and media without a source", async () => {
    expect(await attempt(() => as("melih", () => db.query(`insert into public.sails (slug, title, date) values ('Bad Slug', 'X', '2026-01-01')`)))).toMatch(/check constraint/);
    expect(
      await attempt(() => as("melih", () => db.query(`insert into public.sail_media (sail_id, kind) values ('00000000-0000-0000-0000-00000000000a', 'photo')`))),
    ).toMatch(/check constraint/);
  });

  it("removes media when the sail is deleted", async () => {
    await as("melih", () => db.query(`delete from public.sails where slug = 'published-sail'`));
    const media = await db.query(`select * from public.sail_media where sail_id = '00000000-0000-0000-0000-00000000000a'`);
    expect(media.rows).toHaveLength(0);
  });
});
