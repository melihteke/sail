-- Sail Academy race: courses, anonymous race sessions and per-course scoreboards.
-- Players do not send a time: they send their helm commands, and `race_submit` re-sails the race with
-- the same deterministic model as the browser (src/academy/games/race/sim.ts) to get the result.
-- Safe to run more than once.

create table if not exists public.race_courses (
  id         text primary key check (id ~ '^[a-z0-9-]+$'),
  sort       int not null default 0,
  name       text not null,
  area       text not null default '',
  data       jsonb not null,
  active     boolean not null default true,
  is_current boolean not null default false,
  updated_at timestamptz not null default now()
);
create unique index if not exists race_courses_one_current on public.race_courses (is_current) where is_current;
drop trigger if exists race_courses_touch on public.race_courses;
create trigger race_courses_touch before update on public.race_courses for each row execute function public.touch_updated_at();

create table if not exists public.race_results (
  id         uuid primary key default gen_random_uuid(),
  course_id  text not null references public.race_courses (id) on delete cascade,
  name       text not null check (char_length(name) between 2 and 24),
  time_s     numeric(7, 1) not null check (time_s > 0),
  tacks      int not null default 0 check (tacks >= 0),
  gybes      int not null default 0 check (gybes >= 0),
  distance_m int not null default 0 check (distance_m >= 0),
  source     text not null default 'race' check (source in ('race', 'admin')),
  created_at timestamptz not null default now()
);
create index if not exists race_results_board on public.race_results (course_id, time_s, created_at);

create table if not exists public.race_sessions (
  id           uuid primary key default gen_random_uuid(),
  course_id    text not null references public.race_courses (id) on delete cascade,
  name         text not null,
  ip_hash      text not null,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index if not exists race_sessions_ip on public.race_sessions (ip_hash, started_at);

alter table public.race_courses enable row level security;
alter table public.race_results enable row level security;
alter table public.race_sessions enable row level security;

drop policy if exists race_courses_read on public.race_courses;
create policy race_courses_read on public.race_courses for select using (true);
drop policy if exists race_courses_admin on public.race_courses;
create policy race_courses_admin on public.race_courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists race_results_read on public.race_results;
create policy race_results_read on public.race_results for select using (true);
drop policy if exists race_results_admin on public.race_results;
create policy race_results_admin on public.race_results for all using (public.is_admin()) with check (public.is_admin());
-- race_sessions: no policies, only the security definer functions below touch it.

-- Keep at most 30 entries per course: the slowest ones drop off.
create or replace function public.race_results_trim() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.race_results r
  where r.course_id = new.course_id
    and r.id not in (
      select id from public.race_results where course_id = new.course_id order by time_s, created_at limit 30
    );
  return null;
end $$;
drop trigger if exists race_results_trim on public.race_results;
create trigger race_results_trim after insert or update of time_s on public.race_results for each row execute function public.race_results_trim();

-- ---------------------------------------------------------------------------------------------
-- Simulation (mirror of sim.ts). Every value is rounded the same way as in the browser.
-- ---------------------------------------------------------------------------------------------

create or replace function public.race_q(v float8, s float8) returns float8
language sql immutable as $$ select floor(v * s + 0.5) / s $$;

create or replace function public.race_n360(a float8) returns float8
language sql immutable as $$ select a - 360 * floor(a / 360) $$;

create or replace function public.race_n180(a float8) returns float8
language sql immutable as $$ select case when public.race_n360(a) > 180 then public.race_n360(a) - 360 else public.race_n360(a) end $$;

create or replace function public.race_polar(twa_abs float8, tws float8) returns float8
language plpgsql immutable as $$
declare
  twas float8[] := array[40, 45, 52, 60, 75, 90, 110, 120, 135, 150, 165, 180]::float8[];
  twss float8[] := array[4, 6, 8, 10, 12, 16, 20]::float8[];
  sp float8[] := array[
    2.4, 3.3, 3.9, 4.3, 4.5, 4.7, 4.8,
    2.7, 3.6, 4.2, 4.6, 4.8, 5.0, 5.1,
    3.0, 3.9, 4.5, 4.9, 5.1, 5.3, 5.4,
    3.2, 4.1, 4.7, 5.1, 5.3, 5.5, 5.6,
    3.4, 4.4, 5.0, 5.4, 5.6, 5.8, 6.0,
    3.5, 4.5, 5.1, 5.5, 5.8, 6.1, 6.4,
    3.4, 4.4, 5.0, 5.5, 5.9, 6.4, 6.9,
    3.3, 4.3, 4.9, 5.4, 5.8, 6.4, 7.0,
    3.0, 4.0, 4.6, 5.1, 5.5, 6.1, 6.8,
    2.6, 3.6, 4.3, 4.8, 5.2, 5.8, 6.4,
    2.3, 3.3, 4.0, 4.5, 4.9, 5.5, 6.1,
    2.1, 3.1, 3.8, 4.3, 4.7, 5.3, 5.9]::float8[];
  i int := 1;
  j int := 1;
  ti float8 := 0;
  tj float8 := 0;
  factor float8 := 1;
  w float8 := tws;
  top float8;
  bottom float8;
begin
  if twa_abs < twas[1] or tws <= 0 then return 0; end if;
  if twa_abs >= twas[12] then
    i := 11; ti := 1;
  else
    while twas[i + 1] < twa_abs loop i := i + 1; end loop;
    ti := (twa_abs - twas[i]) / (twas[i + 1] - twas[i]);
  end if;
  if w < twss[1] then
    factor := w / twss[1]; w := twss[1];
  end if;
  if w >= twss[7] then
    j := 6; tj := 1;
  else
    while twss[j + 1] < w loop j := j + 1; end loop;
    tj := (w - twss[j]) / (twss[j + 1] - twss[j]);
  end if;
  top := sp[(i - 1) * 7 + j] + (sp[(i - 1) * 7 + j + 1] - sp[(i - 1) * 7 + j]) * tj;
  bottom := sp[i * 7 + j] + (sp[i * 7 + j + 1] - sp[i * 7 + j]) * tj;
  return (top + (bottom - top) * ti) * factor;
end $$;

create or replace function public.race_simulate(c jsonb, events jsonb) returns jsonb
language plpgsql immutable set search_path = public as $$
declare
  prestart constant int := 60;
  time_limit constant int := 1800;
  turn_rate constant float8 := 12;
  accel constant float8 := 0.3;
  max_speed constant float8 := 4.5;
  ray_len constant float8 := 400;
  two_pi constant float8 := 2 * pi();
  -- wind
  wdir float8 := (c #>> '{wind,dir}')::float8;
  wspeed float8 := (c #>> '{wind,speed}')::float8;
  sh_amp float8[] := '{}';
  sh_per float8[] := '{}';
  sh_ph float8[] := '{}';
  sp_amp float8 := (c #>> '{wind,spatialAmp}')::float8;
  sp_wave float8 := (c #>> '{wind,spatialWave}')::float8;
  ga float8 := (c #>> '{wind,gust,0}')::float8;
  gp float8 := (c #>> '{wind,gust,1}')::float8;
  gph float8 := (c #>> '{wind,gust,2}')::float8;
  pa float8 := (c #>> '{wind,puff,0}')::float8;
  pw float8 := (c #>> '{wind,puff,1}')::float8;
  pp float8 := (c #>> '{wind,puff,2}')::float8;
  cw float8 := (c #>> '{wind,puff,3}')::float8;
  cph float8 := (c #>> '{wind,puff,4}')::float8;
  wa float8;
  -- geometry
  rx float8[] := '{}';
  ry float8[] := '{}';
  r_start int[] := '{}';
  r_len int[] := '{}';
  r_poly int[] := '{}';
  n_poly int := 0;
  b0 float8 := (c #>> '{bounds,0}')::float8;
  b1 float8 := (c #>> '{bounds,1}')::float8;
  b2 float8 := (c #>> '{bounds,2}')::float8;
  b3 float8 := (c #>> '{bounds,3}')::float8;
  cmx float8 := (c #>> '{marks,committee,0}')::float8;
  cmy float8 := (c #>> '{marks,committee,1}')::float8;
  pnx float8 := (c #>> '{marks,pin,0}')::float8;
  pny float8 := (c #>> '{marks,pin,1}')::float8;
  wwx float8 := (c #>> '{marks,windward,0}')::float8;
  wwy float8 := (c #>> '{marks,windward,1}')::float8;
  ofx float8 := (c #>> '{marks,offset,0}')::float8;
  ofy float8 := (c #>> '{marks,offset,1}')::float8;
  gsx float8 := (c #>> '{marks,gateS,0}')::float8;
  gsy float8 := (c #>> '{marks,gateS,1}')::float8;
  gpx float8 := (c #>> '{marks,gateP,0}')::float8;
  gpy float8 := (c #>> '{marks,gateP,1}')::float8;
  fbx float8 := (c #>> '{marks,finishBoat,0}')::float8;
  fby float8 := (c #>> '{marks,finishBoat,1}')::float8;
  fpx float8 := (c #>> '{marks,finishPin,0}')::float8;
  fpy float8 := (c #>> '{marks,finishPin,1}')::float8;
  rwx float8 := (c #>> '{rays,windward,0}')::float8;
  rwy float8 := (c #>> '{rays,windward,1}')::float8;
  rox float8 := (c #>> '{rays,offset,0}')::float8;
  roy float8 := (c #>> '{rays,offset,1}')::float8;
  pre_sign float8 := (c ->> 'preSign')::float8;
  -- state
  t int := -prestart;
  x float8 := (c #>> '{boat,x}')::float8;
  y float8 := (c #>> '{boat,y}')::float8;
  heading float8 := (c #>> '{boat,heading}')::float8;
  speed float8;
  leg int := 0; -- 0 start, 1 windward, 2 offset, 3 gate, 4 finish, 5 done
  ocs boolean := false;
  status text := 'racing';
  tacks int := 0;
  gybes int := 0;
  dist_sailed float8 := 0;
  side int;
  next_land int := -prestart;
  finish_time float8 := null;
  -- loop helpers
  target float8;
  ev_count int := coalesce(jsonb_array_length(events), 0);
  ev int := 0;
  ev_tick int;
  k int;
  nx float8; ny float8; nh float8; nspeed float8;
  diff float8; turn float8; twa float8; vt float8; h float8; nside int;
  dir float8; tws float8; cr float8; al float8; wave float8; puff float8; spread float8;
  i int; jj int; ri int; s0 int; n int; p int;
  xi float8; yi float8; xj float8; yj float8; dx float8; dy float8; len2 float8; f float8; ex float8; ey float8; d float8;
  in_water boolean; in_poly boolean; ring_in boolean; land_hit boolean; min_d float8; cur_poly int;
  rdx float8; rdy float8;
  before_side int; after_side int; hit float8;
  sx float8; sy float8; den float8; tt float8; uu float8; sax float8; say float8; sbx float8; sby float8;
  poly jsonb; ring jsonb; pt jsonb;
begin
  for i in 0 .. coalesce(jsonb_array_length(c #> '{wind,shifts}'), 0) - 1 loop
    sh_amp := sh_amp || (c #>> array['wind', 'shifts', i::text, '0'])::float8;
    sh_per := sh_per || (c #>> array['wind', 'shifts', i::text, '1'])::float8;
    sh_ph := sh_ph || (c #>> array['wind', 'shifts', i::text, '2'])::float8;
  end loop;
  for poly in select value from jsonb_array_elements(c -> 'water') loop
    for ring in select value from jsonb_array_elements(poly) loop
      r_start := r_start || coalesce(array_length(rx, 1), 0) + 1;
      r_len := r_len || jsonb_array_length(ring);
      r_poly := r_poly || n_poly;
      for pt in select value from jsonb_array_elements(ring) loop
        rx := rx || (pt ->> 0)::float8;
        ry := ry || (pt ->> 1)::float8;
      end loop;
    end loop;
    n_poly := n_poly + 1;
  end loop;
  for ring in select value from jsonb_array_elements(c -> 'land') loop
    r_start := r_start || coalesce(array_length(rx, 1), 0) + 1;
    r_len := r_len || jsonb_array_length(ring);
    r_poly := r_poly || -1;
    for pt in select value from jsonb_array_elements(ring) loop
      rx := rx || (pt ->> 0)::float8;
      ry := ry || (pt ->> 1)::float8;
    end loop;
  end loop;

  -- wind at the boat for the initial speed
  wa := wdir * pi() / 180;
  cr := x * cos(wa) - y * sin(wa);
  al := -(x * sin(wa) + y * cos(wa));
  dir := wdir;
  for i in 1 .. coalesce(array_length(sh_amp, 1), 0) loop
    dir := dir + sh_amp[i] * sin((two_pi * t) / sh_per[i] + sh_ph[i]);
  end loop;
  dir := dir + sp_amp * sin((two_pi * cr) / sp_wave);
  wave := sin(two_pi * (al / pw - t::float8 / pp));
  puff := case when wave > 0 then wave * wave else 0 end;
  spread := 0.6 + 0.4 * sin((two_pi * cr) / cw + cph);
  tws := wspeed * (1 + ga * sin((two_pi * t) / gp + gph) + pa * puff * spread);
  dir := race_q(race_n360(dir), 1e6);
  tws := race_q(tws, 1e6);
  twa := race_n180(dir - heading);
  speed := race_q((race_polar(abs(twa), tws) * 1852) / 3600, 1e6);
  side := case when twa >= 0 then 1 else -1 end;
  target := heading;

  while status = 'racing' loop
    -- helm commands for this second
    while ev < ev_count loop
      ev_tick := (events -> ev ->> 0)::int;
      exit when ev_tick > t;
      if ev_tick = t then target := (events -> ev ->> 1)::float8; end if;
      ev := ev + 1;
    end loop;

    k := t;
    diff := race_n180(target - heading);
    turn := case when diff > turn_rate then turn_rate when diff < -turn_rate then -turn_rate else diff end;
    nh := race_q(race_n360(heading + turn), 1e6);

    -- wind at the old position and time k
    cr := x * cos(wa) - y * sin(wa);
    al := -(x * sin(wa) + y * cos(wa));
    dir := wdir;
    for i in 1 .. coalesce(array_length(sh_amp, 1), 0) loop
      dir := dir + sh_amp[i] * sin((two_pi * k) / sh_per[i] + sh_ph[i]);
    end loop;
    dir := dir + sp_amp * sin((two_pi * cr) / sp_wave);
    wave := sin(two_pi * (al / pw - k::float8 / pp));
    puff := case when wave > 0 then wave * wave else 0 end;
    spread := 0.6 + 0.4 * sin((two_pi * cr) / cw + cph);
    tws := wspeed * (1 + ga * sin((two_pi * k) / gp + gph) + pa * puff * spread);
    dir := race_q(race_n360(dir), 1e6);
    tws := race_q(tws, 1e6);

    twa := race_n180(dir - nh);
    vt := (race_polar(abs(twa), tws) * 1852) / 3600;
    nspeed := race_q(speed + (vt - speed) * accel, 1e6);
    h := nh * pi() / 180;
    nx := race_q(x + nspeed * sin(h), 1e3);
    ny := race_q(y + nspeed * cos(h), 1e3);

    nside := case when twa > 0 then 1 when twa < 0 then -1 else side end;
    if nside <> side then
      if k >= 0 then
        if abs(twa) < 90 then tacks := tacks + 1; else gybes := gybes + 1; end if;
      end if;
      side := nside;
    end if;
    if k >= 0 then dist_sailed := race_q(dist_sailed + nspeed, 1e3); end if;

    -- keep the old position for the crossing tests
    sx := x; sy := y;
    x := nx; y := ny; heading := nh; speed := nspeed; t := k + 1;

    if x < b0 or x > b2 or y < b1 or y > b3 then
      status := 'outside';
      exit;
    end if;

    if t >= next_land then
      in_water := false;
      land_hit := false;
      min_d := 'Infinity'::float8;
      cur_poly := -2;
      in_poly := false;
      for ri in 1 .. coalesce(array_length(r_start, 1), 0) loop
        p := r_poly[ri];
        if p <> cur_poly then
          if cur_poly >= 0 and in_poly then in_water := true; end if;
          cur_poly := p;
          in_poly := false;
        end if;
        s0 := r_start[ri];
        n := r_len[ri];
        ring_in := false;
        jj := n - 1;
        for i in 0 .. n - 1 loop
          xi := rx[s0 + i]; yi := ry[s0 + i];
          xj := rx[s0 + jj]; yj := ry[s0 + jj];
          if ((yi > y) <> (yj > y)) and x < ((xj - xi) * (y - yi)) / (yj - yi) + xi then ring_in := not ring_in; end if;
          dx := xi - xj; dy := yi - yj;
          len2 := dx * dx + dy * dy;
          f := case when len2 > 0 then ((x - xj) * dx + (y - yj) * dy) / len2 else 0 end;
          if f < 0 then f := 0; elsif f > 1 then f := 1; end if;
          ex := xj + f * dx - x; ey := yj + f * dy - y;
          d := sqrt(ex * ex + ey * ey);
          if d < min_d then min_d := d; end if;
          jj := i;
        end loop;
        if p >= 0 then
          if ring_in then in_poly := not in_poly; end if;
        elsif ring_in then
          land_hit := true;
        end if;
      end loop;
      if cur_poly >= 0 and in_poly then in_water := true; end if;
      -- islands mapped separately as land
      if land_hit then in_water := false; end if;
      if not in_water then
        status := 'crashed';
        exit;
      end if;
      next_land := t + greatest(1, floor(min_d / max_speed)::int);
    end if;

    if leg = 0 then
      before_side := case when ((pnx - cmx) * (sy - cmy) - (pny - cmy) * (sx - cmx)) * pre_sign > 0 then -1 else 1 end;
      after_side := case when ((pnx - cmx) * (y - cmy) - (pny - cmy) * (x - cmx)) * pre_sign > 0 then -1 else 1 end;
      if k < 0 then
        if t = 0 and after_side = 1 then ocs := true; end if;
      elsif ocs then
        if after_side = -1 then ocs := false; end if;
      elsif before_side = -1 and after_side = 1 then
        sax := cmx; say := cmy; sbx := pnx; sby := pny;
        hit := -1;
        den := (x - sx) * (sby - say) - (y - sy) * (sbx - sax);
        if den <> 0 then
          tt := ((sax - sx) * (sby - say) - (say - sy) * (sbx - sax)) / den;
          uu := ((sax - sx) * (y - sy) - (say - sy) * (x - sx)) / den;
          if tt >= 0 and tt <= 1 and uu >= 0 and uu <= 1 then hit := tt; end if;
        end if;
        if hit >= 0 then leg := 1; end if;
      end if;
    elsif leg = 1 or leg = 2 then
      if leg = 1 then
        sax := wwx; say := wwy; rdx := rwx; rdy := rwy;
      else
        sax := ofx; say := ofy; rdx := rox; rdy := roy;
      end if;
      sbx := sax + rdx * ray_len; sby := say + rdy * ray_len;
      hit := -1;
      den := (x - sx) * (sby - say) - (y - sy) * (sbx - sax);
      if den <> 0 then
        tt := ((sax - sx) * (sby - say) - (say - sy) * (sbx - sax)) / den;
        uu := ((sax - sx) * (y - sy) - (say - sy) * (x - sx)) / den;
        if tt >= 0 and tt <= 1 and uu >= 0 and uu <= 1 then hit := tt; end if;
      end if;
      if hit >= 0 and (rdx * (y - sy) - rdy * (x - sx)) > 0 then leg := leg + 1; end if;
    elsif leg = 3 then
      sax := gsx; say := gsy; sbx := gpx; sby := gpy;
      hit := -1;
      den := (x - sx) * (sby - say) - (y - sy) * (sbx - sax);
      if den <> 0 then
        tt := ((sax - sx) * (sby - say) - (say - sy) * (sbx - sax)) / den;
        uu := ((sax - sx) * (y - sy) - (say - sy) * (x - sx)) / den;
        if tt >= 0 and tt <= 1 and uu >= 0 and uu <= 1 then hit := tt; end if;
      end if;
      if hit >= 0 and (x - sx) * sin(wa) + (y - sy) * cos(wa) < 0 then leg := 4; end if;
    elsif leg = 4 then
      sax := fbx; say := fby; sbx := fpx; sby := fpy;
      hit := -1;
      den := (x - sx) * (sby - say) - (y - sy) * (sbx - sax);
      if den <> 0 then
        tt := ((sax - sx) * (sby - say) - (say - sy) * (sbx - sax)) / den;
        uu := ((sax - sx) * (y - sy) - (say - sy) * (x - sx)) / den;
        if tt >= 0 and tt <= 1 and uu >= 0 and uu <= 1 then hit := tt; end if;
      end if;
      if hit >= 0 and (x - sx) * sin(wa) + (y - sy) * cos(wa) > 0 then
        leg := 5;
        status := 'finished';
        finish_time := race_q(k + hit, 10);
        exit;
      end if;
    end if;
    if t >= time_limit then status := 'timeout'; end if;
  end loop;

  return jsonb_build_object(
    'status', status,
    'time', finish_time,
    'tacks', tacks,
    'gybes', gybes,
    'distance', floor(dist_sailed + 0.5)::int,
    'ticks', t
  );
end $$;

revoke all on function public.race_simulate(jsonb, jsonb) from public;
revoke all on function public.race_polar(float8, float8) from public;

-- ---------------------------------------------------------------------------------------------
-- Public API (anonymous players)
-- ---------------------------------------------------------------------------------------------

create or replace function public.race_client_hash() returns text
language sql stable as $$
  select md5('race-salt-' || coalesce(
    nullif(trim(split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'unknown'))
$$;

/** Starts a race for a player name; returns the session id needed to submit the result. */
create or replace function public.race_start(p_course text, p_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  clean text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
  who text := public.race_client_hash();
  sid uuid;
begin
  if char_length(clean) < 2 or char_length(clean) > 24 or clean ~ '[<>{}\[\]\\/"`@#$%^*=|~]' or clean ~ '[[:cntrl:]]' then
    raise exception 'race: invalid name' using errcode = '22023';
  end if;
  if not exists (select 1 from public.race_courses where id = p_course and active) then
    raise exception 'race: course not available' using errcode = '22023';
  end if;
  delete from public.race_sessions where started_at < now() - interval '1 day';
  if (select count(*) from public.race_sessions where ip_hash = who and started_at > now() - interval '1 hour') >= 40 then
    raise exception 'race: too many races, try again later' using errcode = '54000';
  end if;
  insert into public.race_sessions (course_id, name, ip_hash) values (p_course, clean, who) returning id into sid;
  return sid;
end $$;

/** Re-sails the race from the helm commands and records a finish on the course's scoreboard. */
create or replace function public.race_submit(p_session uuid, p_events jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  s public.race_sessions%rowtype;
  course jsonb;
  res jsonb;
  ev jsonb;
  prev int := -1000;
  tick int;
  hdg int;
  elapsed float8;
  needed float8;
  t numeric(7, 1);
  existing public.race_results%rowtype;
  row_id uuid;
  rank int;
  on_board boolean := false;
  improved boolean := false;
  had_existing boolean := false;
begin
  select * into s from public.race_sessions where id = p_session for update;
  if not found or s.submitted_at is not null then
    raise exception 'race: unknown or used session' using errcode = '22023';
  end if;
  update public.race_sessions set submitted_at = now() where id = p_session;

  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 4000 then
    raise exception 'race: invalid helm log' using errcode = '22023';
  end if;
  for ev in select value from jsonb_array_elements(p_events) loop
    if jsonb_typeof(ev) <> 'array' or jsonb_array_length(ev) <> 2
       or jsonb_typeof(ev -> 0) <> 'number' or jsonb_typeof(ev -> 1) <> 'number' then
      raise exception 'race: invalid helm log' using errcode = '22023';
    end if;
    tick := (ev ->> 0)::numeric::int;
    hdg := (ev ->> 1)::numeric::int;
    if (ev ->> 0)::numeric <> tick or (ev ->> 1)::numeric <> hdg or tick < -60 or tick > 1800 or hdg < 0 or hdg > 359 or tick < prev then
      raise exception 'race: invalid helm log' using errcode = '22023';
    end if;
    prev := tick;
  end loop;

  select data into course from public.race_courses where id = s.course_id;
  res := public.race_simulate(course, p_events);

  -- The browser plays at 8 simulated seconds per real second: a result can't arrive much sooner.
  elapsed := extract(epoch from now() - s.started_at);
  needed := ((res ->> 'ticks')::float8 + 60) / 8 * 0.7;
  if elapsed < needed then
    return res || jsonb_build_object('accepted', false, 'reason', 'too-fast');
  end if;
  if elapsed > 7200 then
    return res || jsonb_build_object('accepted', false, 'reason', 'expired');
  end if;
  if res ->> 'status' <> 'finished' then
    return res || jsonb_build_object('accepted', true);
  end if;

  t := (res ->> 'time')::numeric;
  select * into existing from public.race_results
   where course_id = s.course_id and lower(name) = lower(s.name) and source = 'race'
   order by time_s limit 1;
  had_existing := found;
  if had_existing then
    row_id := existing.id;
    if t < existing.time_s then
      update public.race_results
         set time_s = t, tacks = (res ->> 'tacks')::int, gybes = (res ->> 'gybes')::int,
             distance_m = (res ->> 'distance')::int, name = s.name, created_at = now()
       where id = existing.id;
      improved := true;
    end if;
  else
    insert into public.race_results (course_id, name, time_s, tacks, gybes, distance_m)
    values (s.course_id, s.name, t, (res ->> 'tacks')::int, (res ->> 'gybes')::int, (res ->> 'distance')::int)
    returning id into row_id;
    improved := true;
  end if;

  on_board := exists (select 1 from public.race_results where id = row_id);
  select count(*) + 1 into rank from public.race_results where course_id = s.course_id and time_s < t;

  return res || jsonb_build_object(
    'accepted', true,
    'rank', rank,
    'on_board', on_board,
    'personal_best', not had_existing or improved,
    'best_time', case when improved then t else existing.time_s end,
    'board_size', (select count(*) from public.race_results where course_id = s.course_id)
  );
end $$;

/** Admin: make one course the one shown sby default (and active). */
create or replace function public.race_set_current(p_course text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'race: admin only' using errcode = '42501';
  end if;
  update public.race_courses set is_current = false where is_current and id <> p_course;
  update public.race_courses set is_current = true, active = true where id = p_course;
end $$;

revoke all on function public.race_start(text, text) from public;
revoke all on function public.race_submit(uuid, jsonb) from public;
revoke all on function public.race_set_current(text) from public;
grant execute on function public.race_start(text, text) to anon, authenticated;
grant execute on function public.race_submit(uuid, jsonb) to anon, authenticated;
grant execute on function public.race_set_current(text) to authenticated;

notify pgrst, 'reload schema';
