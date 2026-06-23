-- Pricing + billing scaffold.
--   1. Bump the registered free-tier lifetime limit from 3 to 10 BRDs.
--   2. Add Stripe customer linkage to profiles so the billing webhook / customer
--      portal can map a Stripe customer back to a Supabase user.
-- NOTE: this is a SCAFFOLD for a portfolio demo — not hardened billing.

-- 1. Free tier = 10 lifetime generations. Re-create consume_quota with the new limit
-- (body otherwise identical to 0001_auth_quota.sql).
create or replace function public.consume_quota(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := 10;  -- registered free tier (was 3)
  v_subscribed boolean;
  v_count int;
  v_remaining int;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select is_subscribed into v_subscribed
  from public.profiles where user_id = p_user_id;

  if v_subscribed is null then
    insert into public.profiles (user_id) values (p_user_id)
    on conflict (user_id) do nothing;
    v_subscribed := false;
  end if;

  if v_subscribed then
    insert into public.brd_generations (user_id) values (p_user_id);
    return json_build_object('allowed', true, 'remaining', -1, 'tier', 'subscribed');
  end if;

  select count(*) into v_count
  from public.brd_generations where user_id = p_user_id;

  if v_count >= v_limit then
    return json_build_object('allowed', false, 'remaining', 0, 'tier', 'registered');
  end if;

  insert into public.brd_generations (user_id) values (p_user_id);
  v_remaining := v_limit - (v_count + 1);
  return json_build_object('allowed', true, 'remaining', v_remaining, 'tier', 'registered');
end;
$$;

revoke all on function public.consume_quota(uuid) from public, anon, authenticated;

-- 2. Stripe customer id on the profile (one Stripe customer per user). The billing
-- webhook flips is_subscribed; this column lets subscription.* events (which carry the
-- customer, not our user_id) resolve back to the owning user.
alter table public.profiles
  add column if not exists stripe_customer_id text;

create unique index if not exists profiles_stripe_customer_id_key
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;
