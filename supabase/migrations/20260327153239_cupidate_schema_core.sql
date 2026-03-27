create extension if not exists pgcrypto;

create type public.connection_status as enum ('pending', 'accepted', 'rejected', 'blocked');
create type public.match_status as enum ('proposed', 'accepted', 'dismissed');

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cupids (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cupids_touch_updated_at
before update on public.cupids
for each row
execute function public.touch_updated_at();

create table if not exists public.cupid_connections (
  id uuid primary key default gen_random_uuid(),
  requester_cupid_id uuid not null references public.cupids(id) on delete cascade,
  addressee_cupid_id uuid not null references public.cupids(id) on delete cascade,
  status public.connection_status not null default 'pending',
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cupid_connections_distinct_pair check (requester_cupid_id <> addressee_cupid_id),
  constraint cupid_connections_unique_direction unique (requester_cupid_id, addressee_cupid_id)
);

create index if not exists idx_cupid_connections_requester on public.cupid_connections(requester_cupid_id);
create index if not exists idx_cupid_connections_addressee on public.cupid_connections(addressee_cupid_id);
create index if not exists idx_cupid_connections_status on public.cupid_connections(status);

create trigger cupid_connections_touch_updated_at
before update on public.cupid_connections
for each row
execute function public.touch_updated_at();

create or replace function public.are_cupids_connected(cupid_a uuid, cupid_b uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.cupid_connections cc
    where cc.status = 'accepted'
      and (
        (cc.requester_cupid_id = cupid_a and cc.addressee_cupid_id = cupid_b)
        or (cc.requester_cupid_id = cupid_b and cc.addressee_cupid_id = cupid_a)
      )
  );
$$;

create table if not exists public.cupidates (
  id uuid primary key default gen_random_uuid(),
  owner_cupid_id uuid not null references public.cupids(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 60),
  birth_year int check (birth_year between 1900 and extract(year from now())::int),
  gender text,
  bio text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_cupidates_owner on public.cupidates(owner_cupid_id);
create index if not exists idx_cupidates_active on public.cupidates(is_active);

create trigger cupidates_touch_updated_at
before update on public.cupidates
for each row
execute function public.touch_updated_at();

create table if not exists public.cupidate_preferences (
  id uuid primary key default gen_random_uuid(),
  cupidate_id uuid not null unique references public.cupidates(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger cupidate_preferences_touch_updated_at
before update on public.cupidate_preferences
for each row
execute function public.touch_updated_at();

create table if not exists public.match_candidates (
  id uuid primary key default gen_random_uuid(),
  source_cupidate_id uuid not null references public.cupidates(id) on delete cascade,
  target_cupidate_id uuid not null references public.cupidates(id) on delete cascade,
  match_score numeric(5, 2) not null check (match_score between 0 and 100),
  match_status public.match_status not null default 'proposed',
  reason jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint match_candidates_no_self_pair check (source_cupidate_id <> target_cupidate_id),
  constraint match_candidates_unique_pair unique (source_cupidate_id, target_cupidate_id)
);

create index if not exists idx_match_candidates_source on public.match_candidates(source_cupidate_id);
create index if not exists idx_match_candidates_target on public.match_candidates(target_cupidate_id);
create index if not exists idx_match_candidates_score on public.match_candidates(match_score desc);

create trigger match_candidates_touch_updated_at
before update on public.match_candidates
for each row
execute function public.touch_updated_at();

create or replace function public.enforce_connected_cupid_match()
returns trigger
language plpgsql
as $$
declare
  source_owner uuid;
  target_owner uuid;
begin
  select c.owner_cupid_id into source_owner
  from public.cupidates c
  where c.id = new.source_cupidate_id;

  select c.owner_cupid_id into target_owner
  from public.cupidates c
  where c.id = new.target_cupidate_id;

  if source_owner is null or target_owner is null then
    raise exception 'invalid cupidate pair';
  end if;

  if source_owner = target_owner then
    raise exception 'self-owned cupidate pairs are not allowed';
  end if;

  if not public.are_cupids_connected(source_owner, target_owner) then
    raise exception 'cupids must be connected before match candidates can be created';
  end if;

  return new;
end;
$$;

create trigger match_candidates_check_connected_cupids
before insert or update on public.match_candidates
for each row
execute function public.enforce_connected_cupid_match();
