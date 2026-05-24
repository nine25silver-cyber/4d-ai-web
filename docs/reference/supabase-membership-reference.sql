-- 4D AI Web/App shared auth + membership reference SQL
-- Reference/setup draft only. Do not run directly in production until William manually reviews it.
-- Web/App frontend may read the signed-in user's membership state, but must not write entitlement fields.
-- Entitlement/subscription writes must be handled only by server-side webhook/admin/service-role code.
-- Never place a service role key or other backend secret in Web/App frontend code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Ordinary user profile fields shared by Web and App. Membership entitlements are stored separately in public.user_entitlements.';

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  is_pro boolean not null default false,
  status text not null default 'free',
  subscription_provider text,
  subscription_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_entitlements is
  'Read-only membership/subscription state for frontend clients. Writes must be performed by trusted server-side webhook/admin/service-role code only.';

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_entitlements (user_id, plan, is_pro, status)
  values (new.id, 'free', false, 'free')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;

create trigger touch_profiles_updated_at
before update on public.profiles
for each row
execute function public.touch_profile_updated_at();

create or replace function public.touch_user_entitlements_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_user_entitlements_updated_at on public.user_entitlements;

create trigger touch_user_entitlements_updated_at
before update on public.user_entitlements
for each row
execute function public.touch_user_entitlements_updated_at();

alter table public.profiles enable row level security;
alter table public.user_entitlements enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_basic_own" on public.profiles;
create policy "profiles_update_basic_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;
create policy "user_entitlements_select_own"
on public.user_entitlements
for select
to authenticated
using (auth.uid() = user_id);

-- Intentionally no authenticated insert/update/delete policies on user_entitlements.
-- Without those policies, frontend clients cannot change plan, is_pro, subscription status,
-- provider customer ids, or billing period fields. Trusted server/admin/service-role code
-- should perform entitlement writes after payment webhook verification.

-- Backfill ordinary profiles for existing auth users.
insert into public.profiles (id, email, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- Backfill default free entitlement rows for existing auth users.
insert into public.user_entitlements (user_id, plan, is_pro, status)
select u.id, 'free', false, 'free'
from auth.users u
left join public.user_entitlements e on e.user_id = u.id
where e.user_id is null;
