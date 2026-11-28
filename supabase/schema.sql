-- The Dojo: published card edits.
-- Run this once in the Supabase SQL editor (Database → SQL Editor → New query → paste → Run).
-- Anyone can read published edits; only users listed in public.admins can publish, change or remove them.
-- The site never decides who is an admin: these policies do.

create table if not exists public.content_overrides (
  card_id    text primary key,
  body       text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.content_overrides enable row level security;
alter table public.admins enable row level security;
-- No policies on public.admins: nobody can read or change it through the API. Manage it in the dashboard.

-- True when the signed-in user is in public.admins. security definer so it can read the locked admins table.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Published edits are public" on public.content_overrides;
create policy "Published edits are public"
  on public.content_overrides for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins publish edits" on public.content_overrides;
create policy "Admins publish edits"
  on public.content_overrides for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins change edits" on public.content_overrides;
create policy "Admins change edits"
  on public.content_overrides for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins remove edits" on public.content_overrides;
create policy "Admins remove edits"
  on public.content_overrides for delete
  to authenticated
  using (public.is_admin());

grant select on public.content_overrides to anon, authenticated;
grant insert, update, delete on public.content_overrides to authenticated;
