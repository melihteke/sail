-- Professional logbook: structured log fields, admin-only private notes, revision history and editable events.
-- Safe to run more than once (e.g. pasted into the Supabase SQL editor).

-- Structured log fields (public, shown on the sail page) -----------------------------------------
alter table public.sails add column if not exists passage_type   text;
alter table public.sails add column if not exists departure      text;
alter table public.sails add column if not exists arrival        text;
alter table public.sails add column if not exists skipper        text;
alter table public.sails add column if not exists night_hours    numeric(5, 1);
alter table public.sails add column if not exists tidal          boolean not null default false;
alter table public.sails add column if not exists observed_bft   int;
alter table public.sails add column if not exists sea_state      text;
alter table public.sails add column if not exists visibility     text;
alter table public.sails add column if not exists engine_minutes int;

do $$ begin
  alter table public.sails add constraint sails_passage_type_check
    check (passage_type in ('day_sail', 'passage', 'training', 'race', 'delivery', 'cruise'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_sea_state_check
    check (sea_state in ('calm', 'smooth', 'slight', 'moderate', 'rough', 'very_rough'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_visibility_check
    check (visibility in ('good', 'moderate', 'poor', 'fog'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_observed_bft_check check (observed_bft between 0 and 12);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_night_hours_check check (night_hours >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_engine_minutes_check check (engine_minutes >= 0);
exception when duplicate_object then null; end $$;

-- Private notes: never readable with the anon key, never part of the public build -----------------
-- (A published row of public.sails is readable by anyone, so private text can't live there.)
create table if not exists public.sail_private (
  sail_id     uuid primary key references public.sails (id) on delete cascade,
  notes       text not null default '',
  maintenance text not null default '',
  updated_at  timestamptz not null default now()
);
drop trigger if exists sail_private_touch on public.sail_private;
create trigger sail_private_touch before update on public.sail_private for each row execute function public.touch_updated_at();

alter table public.sail_private enable row level security;
drop policy if exists sail_private_admin on public.sail_private;
create policy sail_private_admin on public.sail_private for all using (public.is_admin()) with check (public.is_admin());

-- Revision history ------------------------------------------------------------------------------
-- After an edit, the previous version of the editable fields is stored. Autosave edits within 10 minutes
-- are folded into one revision (the state before that editing session). The last 50 per sail are kept.
create table if not exists public.sail_revisions (
  id         uuid primary key default gen_random_uuid(),
  sail_id    uuid not null references public.sails (id) on delete cascade,
  changed_at timestamptz not null default now(),
  snapshot   jsonb not null
);
create index if not exists sail_revisions_sail on public.sail_revisions (sail_id, changed_at desc);

alter table public.sail_revisions enable row level security;
drop policy if exists sail_revisions_admin on public.sail_revisions;
create policy sail_revisions_admin on public.sail_revisions for all using (public.is_admin()) with check (public.is_admin());

-- Fields that are not part of a revision: computed track data, bookkeeping and publish state.
create or replace function public.sail_revision_fields(r public.sails)
returns jsonb
language sql
immutable
as $$
  select to_jsonb(r) - array[
    'id', 'status', 'slug', 'gpx_path', 'stats', 'track', 'wind', 'analysis', 'cover_media_id',
    'created_at', 'updated_at', 'published_at', 'client_id', 'source'
  ];
$$;

create or replace function public.sails_record_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  prev jsonb := public.sail_revision_fields(old);
begin
  if prev is not distinct from public.sail_revision_fields(new) then
    return null;
  end if;
  if exists (
    select 1 from public.sail_revisions
    where sail_id = old.id and changed_at > now() - interval '10 minutes'
  ) then
    return null;
  end if;
  insert into public.sail_revisions (sail_id, snapshot) values (old.id, prev);
  delete from public.sail_revisions
  where sail_id = old.id
    and id not in (select id from public.sail_revisions where sail_id = old.id order by changed_at desc limit 50);
  return null;
end;
$$;
drop trigger if exists sails_revision on public.sails;
create trigger sails_revision after update on public.sails for each row execute function public.sails_record_revision();

-- Restores a revision. The current version is saved first, so a restore can always be undone.
create or replace function public.restore_sail_revision(rev uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  r   public.sail_revisions;
  cur public.sails;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select * into r from public.sail_revisions where id = rev;
  if r.id is null then
    raise exception 'revision not found';
  end if;
  select * into cur from public.sails where id = r.sail_id;
  insert into public.sail_revisions (sail_id, snapshot) values (cur.id, public.sail_revision_fields(cur));
  update public.sails s
  set (title, date, location, summary, boat_id, role, crew, rating, sails_used, reef, tags,
       how_it_went, what_i_practised, learnings, notes,
       passage_type, departure, arrival, skipper, night_hours, tidal, observed_bft, sea_state, visibility, engine_minutes)
    = (select x.title, x.date, x.location, x.summary, x.boat_id, x.role, x.crew, x.rating, x.sails_used, x.reef, x.tags,
              x.how_it_went, x.what_i_practised, x.learnings, x.notes,
              x.passage_type, x.departure, x.arrival, x.skipper, x.night_hours, x.tidal, x.observed_bft, x.sea_state,
              x.visibility, x.engine_minutes
       from jsonb_populate_record(cur, r.snapshot) x)
  where s.id = cur.id;
end;
$$;
revoke all on function public.restore_sail_revision(uuid) from public, anon;
grant execute on function public.restore_sail_revision(uuid) to authenticated;

-- Editable event log ----------------------------------------------------------------------------
-- Events added or changed in the admin are marked edited; the app then no longer replaces the log.
alter table public.sail_events add column if not exists edited boolean not null default false;

create or replace function public.app_save_sail(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  cid   uuid := (p->>'client_id')::uuid;
  sid   uuid;
  base  text;
  cand  text;
  n     int := 1;
  s     public.sails;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if cid is null then
    raise exception 'client_id is required';
  end if;

  select id into sid from public.sails where client_id = cid or id = cid;

  if sid is null then
    base := coalesce(nullif(p->>'slug', ''), 'sail');
    if base !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
      raise exception 'invalid slug %', base;
    end if;
    cand := base;
    while exists (select 1 from public.sails where slug = cand) loop
      n := n + 1;
      cand := base || '-' || n;
    end loop;
    insert into public.sails (
      id, gpx_path, slug, status, title, date, location, summary, boat_id, role, crew, rating, sails_used, reef, tags,
      how_it_went, what_i_practised, learnings, notes, client_id, source
    ) values (
      cid, nullif(p->>'gpx_path', ''), cand, 'draft',
      coalesce(nullif(p->>'title', ''), 'Sail'),
      (p->>'date')::date,
      coalesce(p->>'location', ''),
      coalesce(p->>'summary', ''),
      nullif(p->>'boat_id', '')::uuid,
      coalesce(nullif(p->>'role', ''), 'helm'),
      coalesce((select array_agg(x) from jsonb_array_elements_text(p->'crew') x), '{}'),
      coalesce((p->>'rating')::int, 3),
      nullif(p->>'sails_used', ''),
      coalesce((p->>'reef')::boolean, false),
      coalesce((select array_agg(x) from jsonb_array_elements_text(p->'tags') x), '{}'),
      coalesce(p->>'how_it_went', ''),
      coalesce(p->>'what_i_practised', ''),
      coalesce(p->>'learnings', ''),
      coalesce(p->>'notes', ''),
      cid, 'app'
    )
    returning id into sid;
  elsif nullif(p->>'gpx_path', '') is not null then
    update public.sails set gpx_path = p->>'gpx_path' where id = sid and gpx_path is distinct from p->>'gpx_path';
  end if;

  if p ? 'events' and not exists (select 1 from public.sail_events where sail_id = sid and edited) then
    delete from public.sail_events where sail_id = sid;
    insert into public.sail_events (sail_id, at, kind, lat, lon, data)
    select sid, (e->>'at')::timestamptz, e->>'kind', (e->>'lat')::double precision, (e->>'lon')::double precision, coalesce(e->'data', '{}'::jsonb)
    from jsonb_array_elements(p->'events') e;
  end if;

  select * into s from public.sails where id = sid;
  return jsonb_build_object('id', s.id, 'slug', s.slug, 'status', s.status);
end;
$$;
revoke all on function public.app_save_sail(jsonb) from public, anon;
grant execute on function public.app_save_sail(jsonb) to authenticated;

notify pgrst, 'reload schema';
