-- VHF practice radio (radio.mteke.com): banned users. Admins manage the list; a signed-in user can only see
-- whether their own e-mail is on it, which the radio server checks with the user's own JWT before admitting them.
create table public.radio_bans (
  email text primary key check (email = lower(email)),
  reason text,
  created_at timestamptz not null default now()
);

alter table public.radio_bans enable row level security;

create policy "radio_bans: own row" on public.radio_bans
  for select to authenticated
  using (email = lower(auth.jwt() ->> 'email'));

create policy "radio_bans: admins manage" on public.radio_bans
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
