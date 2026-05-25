-- 4D AI Web/App minimal user_membership_entitlements setup
-- Manual review required before production execution.
-- Frontend Web/App may select the signed-in user's own row only.
-- Entitlement writes must be done by trusted backend/admin/server-side code only.
-- Do not place privileged backend keys or other backend secrets in Web/App frontend code.
--
-- Scope:
-- - Creates public.user_membership_entitlements only.
-- - Does not create or modify public.user_entitlements.
-- - Does not create or modify public.profiles.
-- - Does not backfill existing auth.users.
-- - Does not insert real user data.
-- - Does not create authenticated insert/update/delete policies.

create table if not exists public.user_membership_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  is_pro boolean not null default false,
  status text not null default 'free',
  subscription_provider text,
  subscription_customer_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_membership_entitlements_plan_check check (plan in ('free', 'pro')),
  constraint user_membership_entitlements_status_check check (
    status in ('free', 'active', 'trialing', 'past_due', 'canceled', 'expired')
  )
);

comment on table public.user_membership_entitlements is
  'Read-only auth-based membership/subscription state for frontend clients. Writes must be performed by trusted backend/admin code only.';

comment on column public.user_membership_entitlements.user_id is
  'Matches auth.users.id. Frontend clients may select only their own row through RLS.';

comment on column public.user_membership_entitlements.plan is
  'Frontend-readable plan value. Trusted backend/admin code is responsible for writes.';

comment on column public.user_membership_entitlements.is_pro is
  'Frontend-readable Pro flag. Trusted backend/admin code is responsible for writes.';

comment on column public.user_membership_entitlements.status is
  'Frontend-readable entitlement status such as free, active, trialing, past_due, canceled, or expired.';

create or replace function public.touch_user_membership_entitlements_updated_at()
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

drop trigger if exists touch_user_membership_entitlements_updated_at on public.user_membership_entitlements;

create trigger touch_user_membership_entitlements_updated_at
before update on public.user_membership_entitlements
for each row
execute function public.touch_user_membership_entitlements_updated_at();

alter table public.user_membership_entitlements enable row level security;

drop policy if exists "user_membership_entitlements_select_own" on public.user_membership_entitlements;

create policy "user_membership_entitlements_select_own"
on public.user_membership_entitlements
for select
to authenticated
using (auth.uid() = user_id);

-- Intentionally no authenticated insert/update/delete policies.
-- Frontend clients must not be able to change plan, is_pro, status, provider ids, or billing period fields.
