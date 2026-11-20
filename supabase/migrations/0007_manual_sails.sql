-- Sails without a GPX track: distance and duration entered by hand (used only when there is no track).
-- Safe to run more than once (e.g. pasted into the Supabase SQL editor). Run after 0006.

alter table public.sails add column if not exists manual_distance_nm numeric(7, 1);
alter table public.sails add column if not exists manual_duration_min int;

do $$ begin
  alter table public.sails add constraint sails_manual_distance_check check (manual_distance_nm >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.sails add constraint sails_manual_duration_check check (manual_duration_min >= 0);
exception when duplicate_object then null; end $$;

-- Restore now also brings back the hand-entered distance and duration.
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
       passage_type, departure, arrival, skipper, night_hours, tidal, observed_bft, sea_state, visibility, engine_minutes,
       manual_distance_nm, manual_duration_min)
    = (select x.title, x.date, x.location, x.summary, x.boat_id, x.role, x.crew, x.rating, x.sails_used, x.reef, x.tags,
              x.how_it_went, x.what_i_practised, x.learnings, x.notes,
              x.passage_type, x.departure, x.arrival, x.skipper, x.night_hours, x.tidal, x.observed_bft, x.sea_state,
              x.visibility, x.engine_minutes, x.manual_distance_nm, x.manual_duration_min
       from jsonb_populate_record(cur, r.snapshot) x)
  where s.id = cur.id;
end;
$$;
revoke all on function public.restore_sail_revision(uuid) from public, anon;
grant execute on function public.restore_sail_revision(uuid) to authenticated;

notify pgrst, 'reload schema';
