-- Sail Tracker app (Android): event log, idempotent uploads and photo positions.
-- Safe to run more than once (e.g. pasted into the Supabase SQL editor).

-- Sails: which device record a sail came from, so a retried upload updates instead of duplicating.
alter table public.sails add column if not exists client_id uuid;
alter table public.sails add column if not exists source text not null default 'web';
do $$ begin
  alter table public.sails add constraint sails_client_id_key unique (client_id);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_source_check check (source in ('web', 'app'));
exception when duplicate_object then null; end $$;

-- Media: where a photo was taken, and an id from the phone so re-uploads are ignored.
alter table public.sail_media add column if not exists lat double precision;
alter table public.sail_media add column if not exists lon double precision;
alter table public.sail_media add column if not exists client_id uuid;
do $$ begin
  alter table public.sail_media add constraint sail_media_client_id_key unique (client_id);
exception when duplicate_table or duplicate_object then null; end $$;

-- Event log: engine on/off, sails up/down, reef, tack, MOB, anchor, notes, weather...
create table if not exists public.sail_events (
  id         uuid primary key default gen_random_uuid(),
  sail_id    uuid not null references public.sails (id) on delete cascade,
  at         timestamptz not null,
  kind       text not null check (kind ~ '^[a-z_]+$'),
  lat        double precision,
  lon        double precision,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sail_events_sail on public.sail_events (sail_id, at);

alter table public.sail_events enable row level security;
drop policy if exists sail_events_read on public.sail_events;
create policy sail_events_read on public.sail_events for select using (
  public.is_admin() or exists (select 1 from public.sails s where s.id = sail_id and s.status = 'published')
);
drop policy if exists sail_events_admin_write on public.sail_events;
create policy sail_events_admin_write on public.sail_events for all using (public.is_admin()) with check (public.is_admin());

-- One call from the app: create (or update) the draft sail by client_id and replace its event log.
-- A new sail gets id = client_id, so the app can upload the GPX to gpx/<client_id>/track.gpx first.
-- Fields the admin may already have edited on the site are only filled in when the sail is new.
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

  if p ? 'events' then
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
