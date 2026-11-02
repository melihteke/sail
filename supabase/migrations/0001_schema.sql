-- sail.mteke.com: logbook schema, row level security and storage buckets.
-- Visitors (anon) can read published content; only admins (emails in public.admins) can write.

-- Admins ---------------------------------------------------------------------------------------
create table public.admins (
  email text primary key check (email = lower(email))
);
insert into public.admins (email) values ('melihteke@gmail.com');

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = a.email
    where u.id = auth.uid()
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Boats ----------------------------------------------------------------------------------------
create table public.boats (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name         text not null,
  model        text,
  builder      text,
  builder_url  text,
  designer     text,
  design_year  int,
  sail_number  text,
  home_water   text,
  description  text not null default '',
  specs        jsonb not null default '[]'::jsonb,
  photo_path   text,
  photo_credit jsonb,
  is_default   boolean not null default false,
  sort         int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create unique index boats_one_default on public.boats (is_default) where is_default;
create trigger boats_touch before update on public.boats for each row execute function public.touch_updated_at();

-- Sails ----------------------------------------------------------------------------------------
create table public.sails (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status            text not null default 'draft' check (status in ('draft', 'published')),
  title             text not null,
  date              date not null,
  location          text not null default '',
  summary           text not null default '',
  boat_id           uuid references public.boats (id) on delete set null,
  role              text not null default 'helm' check (role in ('skipper', 'helm', 'crew', 'trimmer', 'student')),
  crew              text[] not null default '{}',
  rating            int not null default 3 check (rating between 1 and 5),
  sails_used        text,
  reef              boolean not null default false,
  tags              text[] not null default '{}',
  how_it_went       text not null default '',
  what_i_practised  text not null default '',
  learnings         text not null default '',
  notes             text not null default '',
  gpx_path          text,
  stats             jsonb,
  track             jsonb,
  wind              jsonb,
  analysis          jsonb,
  cover_media_id    uuid,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  published_at      timestamptz
);
create index sails_status_date on public.sails (status, date desc);
create trigger sails_touch before update on public.sails for each row execute function public.touch_updated_at();

create or replace function public.sails_set_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;
create trigger sails_published_at before insert or update on public.sails for each row execute function public.sails_set_published_at();

-- Media ----------------------------------------------------------------------------------------
create table public.sail_media (
  id            uuid primary key default gen_random_uuid(),
  sail_id       uuid not null references public.sails (id) on delete cascade,
  kind          text not null check (kind in ('photo', 'video', 'youtube', 'link')),
  storage_path  text,
  thumb_path    text,
  url           text,
  caption       text,
  width         int,
  height        int,
  poster_path   text,
  taken_at      timestamptz,
  sort          int not null default 0,
  created_at    timestamptz not null default now(),
  check (
    (kind in ('photo', 'video') and storage_path is not null)
    or (kind in ('youtube', 'link') and url is not null)
  )
);
create index sail_media_sail on public.sail_media (sail_id, sort);

alter table public.sails
  add constraint sails_cover_fk foreign key (cover_media_id) references public.sail_media (id) on delete set null;

-- Row level security ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.boats enable row level security;
alter table public.sails enable row level security;
alter table public.sail_media enable row level security;

create policy admins_admin_read on public.admins for select using (public.is_admin());

create policy boats_read on public.boats for select using (true);
create policy boats_admin_write on public.boats for all using (public.is_admin()) with check (public.is_admin());

create policy sails_read on public.sails for select using (status = 'published' or public.is_admin());
create policy sails_admin_write on public.sails for all using (public.is_admin()) with check (public.is_admin());

create policy sail_media_read on public.sail_media for select using (
  public.is_admin() or exists (select 1 from public.sails s where s.id = sail_id and s.status = 'published')
);
create policy sail_media_admin_write on public.sail_media for all using (public.is_admin()) with check (public.is_admin());

-- Storage ---------------------------------------------------------------------------------------
-- Public buckets: anyone can download by URL, only admins can upload, change or delete.
insert into storage.buckets (id, name, public)
values ('media', 'media', true), ('gpx', 'gpx', true)
on conflict (id) do nothing;

create policy logbook_storage_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('media', 'gpx') and public.is_admin());
create policy logbook_storage_admin_update on storage.objects for update to authenticated
  using (bucket_id in ('media', 'gpx') and public.is_admin());
create policy logbook_storage_admin_delete on storage.objects for delete to authenticated
  using (bucket_id in ('media', 'gpx') and public.is_admin());
create policy logbook_storage_read on storage.objects for select
  using (bucket_id in ('media', 'gpx'));
