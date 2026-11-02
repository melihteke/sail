-- Site settings editable from the admin panel (e.g. the location of the home page's live wind box).
-- Everyone can read them (the public site shows them); only admins can change them.

create table public.site_settings (
  key        text primary key check (key ~ '^[a-z_]+$'),
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

alter table public.site_settings enable row level security;
create policy site_settings_read on public.site_settings for select using (true);
create policy site_settings_admin_write on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (key, value) values
  ('live_wind', '{"name": "De Poel, Amstelveen", "lat": 52.2984, "lon": 4.8395}'),
  ('sea', '{"name": "North Sea off IJmuiden", "lat": 52.47, "lon": 4.5}')
on conflict (key) do nothing;
