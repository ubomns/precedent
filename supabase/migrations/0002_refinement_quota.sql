-- Refinement metering. /critique, /regenerate-section and /apply-critique are all
-- LLM-backed (OpenAI cost) but were previously unmetered per user — a registered
-- free-tier user could call them without limit, bypassing the generation cap's
-- cost-control intent. This adds a per-user DAILY cap on refinement operations,
-- separate from the lifetime generation quota so it does not eat into the
-- "3 BRDs included" promise. Subscribed users are unlimited.

-- One row per user per day; count = refinement ops used that day.
create table if not exists public.refinement_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  count int not null default 0,
  primary key (user_id, usage_date)
);

-- RLS: users may read only their own usage. Writes happen via the SECURITY DEFINER
-- RPC / service role only (both bypass RLS), so no insert/update policies are granted.
alter table public.refinement_usage enable row level security;

drop policy if exists refinement_usage_select_own on public.refinement_usage;
create policy refinement_usage_select_own on public.refinement_usage
  for select to authenticated using (auth.uid() = user_id);

-- Atomic check + consume of one refinement op. Free-tier daily limit is 30 (single
-- source of truth here). A per-user transaction advisory lock serializes concurrent
-- refinements to prevent a check-then-increment race past the cap. The lock key is
-- namespaced ('refine:') so it does not collide with consume_quota's per-user lock.
create or replace function public.consume_refinement(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := 30;  -- free-tier refinement ops per day
  v_subscribed boolean;
  v_count int;
begin
  perform pg_advisory_xact_lock(hashtext('refine:' || p_user_id::text));

  select is_subscribed into v_subscribed
  from public.profiles where user_id = p_user_id;

  if v_subscribed is null then
    insert into public.profiles (user_id) values (p_user_id)
    on conflict (user_id) do nothing;
    v_subscribed := false;
  end if;

  if v_subscribed then
    return json_build_object('allowed', true, 'remaining', -1, 'tier', 'subscribed');
  end if;

  select count into v_count
  from public.refinement_usage
  where user_id = p_user_id and usage_date = current_date;

  if v_count is null then
    v_count := 0;
  end if;

  if v_count >= v_limit then
    return json_build_object('allowed', false, 'remaining', 0, 'tier', 'registered');
  end if;

  insert into public.refinement_usage (user_id, usage_date, count)
  values (p_user_id, current_date, 1)
  on conflict (user_id, usage_date)
  do update set count = public.refinement_usage.count + 1;

  return json_build_object(
    'allowed', true,
    'remaining', v_limit - (v_count + 1),
    'tier', 'registered'
  );
end;
$$;

-- Only the service role (which bypasses these grants) should call this.
revoke all on function public.consume_refinement(uuid) from public, anon, authenticated;
