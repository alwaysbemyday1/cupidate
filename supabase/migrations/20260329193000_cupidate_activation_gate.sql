alter table public.cupidates
alter column is_active set default false;

create or replace function public.enforce_connected_cupid_match()
returns trigger
language plpgsql
as $$
declare
  source_owner uuid;
  target_owner uuid;
  source_active boolean;
  target_active boolean;
begin
  select c.owner_cupid_id, c.is_active
    into source_owner, source_active
  from public.cupidates c
  where c.id = new.source_cupidate_id;

  select c.owner_cupid_id, c.is_active
    into target_owner, target_active
  from public.cupidates c
  where c.id = new.target_cupidate_id;

  if source_owner is null or target_owner is null then
    raise exception 'invalid cupidate pair';
  end if;

  if source_owner = target_owner then
    raise exception 'self-owned cupidate pairs are not allowed';
  end if;

  if not source_active or not target_active then
    raise exception 'both cupidates must be active before matching';
  end if;

  if not public.are_cupids_connected(source_owner, target_owner) then
    raise exception 'cupids must be connected before match candidates can be created';
  end if;

  return new;
end;
$$;

create index if not exists idx_cupidates_owner_active
on public.cupidates(owner_cupid_id, is_active);
