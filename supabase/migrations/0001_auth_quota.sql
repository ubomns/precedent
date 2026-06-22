-- Profiles: one row per auth user. is_subscribed flipped by payments (sub-project #4).
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_subscribed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Ledger: one row per generated BRD. Quota = count(*) per user.
create table if not exists public.brd_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists brd_generations_user_id_idx
  on public.brd_generations (user_id);

-- RLS: users may read only their own rows. Writes happen via the SECURITY DEFINER
-- RPC / service role only (both bypass RLS), so no insert/update policies are granted.
alter table public.profiles enable row level security;
alter table public.brd_generations enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists brd_generations_select_own on public.brd_generations;
create policy brd_generations_select_own on public.brd_generations
  for select to authenticated using (auth.uid() = user_id);

-- Auto-create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic quota check + consume. Registered free-tier limit is 3 (single source of truth).
-- A per-user transaction advisory lock serializes concurrent generates to prevent the
-- check-then-insert race that could let a user exceed their cap.
create or replace function public.consume_quota(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_limit int := 3;  -- registered free tier
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

-- Only the service role (which bypasses these grants) should call this.
revoke all on function public.consume_quota(uuid) from public, anon, authenticated;
