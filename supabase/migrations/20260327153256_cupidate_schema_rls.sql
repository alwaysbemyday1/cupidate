alter table public.cupids enable row level security;
alter table public.cupid_connections enable row level security;
alter table public.cupidates enable row level security;
alter table public.cupidate_preferences enable row level security;
alter table public.match_candidates enable row level security;

create policy "cupids_self_select"
on public.cupids
for select
to authenticated
using (id = auth.uid());

create policy "cupids_self_insert"
on public.cupids
for insert
to authenticated
with check (id = auth.uid());

create policy "cupids_self_update"
on public.cupids
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "connections_visible_to_members"
on public.cupid_connections
for select
to authenticated
using (requester_cupid_id = auth.uid() or addressee_cupid_id = auth.uid());

create policy "connections_requester_insert"
on public.cupid_connections
for insert
to authenticated
with check (requester_cupid_id = auth.uid());

create policy "connections_member_update"
on public.cupid_connections
for update
to authenticated
using (requester_cupid_id = auth.uid() or addressee_cupid_id = auth.uid())
with check (requester_cupid_id = auth.uid() or addressee_cupid_id = auth.uid());

create policy "connections_member_delete"
on public.cupid_connections
for delete
to authenticated
using (requester_cupid_id = auth.uid() or addressee_cupid_id = auth.uid());

create policy "cupidates_visible_if_owner_or_connected"
on public.cupidates
for select
to authenticated
using (
  owner_cupid_id = auth.uid()
  or public.are_cupids_connected(owner_cupid_id, auth.uid())
);

create policy "cupidates_owner_insert"
on public.cupidates
for insert
to authenticated
with check (owner_cupid_id = auth.uid());

create policy "cupidates_owner_update"
on public.cupidates
for update
to authenticated
using (owner_cupid_id = auth.uid())
with check (owner_cupid_id = auth.uid());

create policy "cupidates_owner_delete"
on public.cupidates
for delete
to authenticated
using (owner_cupid_id = auth.uid());

create policy "preferences_visible_if_owner_or_connected"
on public.cupidate_preferences
for select
to authenticated
using (
  exists (
    select 1
    from public.cupidates c
    where c.id = cupidate_id
      and (
        c.owner_cupid_id = auth.uid()
        or public.are_cupids_connected(c.owner_cupid_id, auth.uid())
      )
  )
);

create policy "preferences_owner_insert"
on public.cupidate_preferences
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cupidates c
    where c.id = cupidate_id
      and c.owner_cupid_id = auth.uid()
  )
);

create policy "preferences_owner_update"
on public.cupidate_preferences
for update
to authenticated
using (
  exists (
    select 1
    from public.cupidates c
    where c.id = cupidate_id
      and c.owner_cupid_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cupidates c
    where c.id = cupidate_id
      and c.owner_cupid_id = auth.uid()
  )
);

create policy "preferences_owner_delete"
on public.cupidate_preferences
for delete
to authenticated
using (
  exists (
    select 1
    from public.cupidates c
    where c.id = cupidate_id
      and c.owner_cupid_id = auth.uid()
  )
);

create policy "matches_visible_if_participant_or_connected"
on public.match_candidates
for select
to authenticated
using (
  exists (
    select 1
    from public.cupidates src
    join public.cupidates tgt on tgt.id = target_cupidate_id
    where src.id = source_cupidate_id
      and (
        src.owner_cupid_id = auth.uid()
        or tgt.owner_cupid_id = auth.uid()
        or public.are_cupids_connected(src.owner_cupid_id, auth.uid())
        or public.are_cupids_connected(tgt.owner_cupid_id, auth.uid())
      )
  )
);

create policy "matches_source_owner_insert"
on public.match_candidates
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cupidates src
    where src.id = source_cupidate_id
      and src.owner_cupid_id = auth.uid()
  )
);

create policy "matches_source_owner_update"
on public.match_candidates
for update
to authenticated
using (
  exists (
    select 1
    from public.cupidates src
    where src.id = source_cupidate_id
      and src.owner_cupid_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cupidates src
    where src.id = source_cupidate_id
      and src.owner_cupid_id = auth.uid()
  )
);

create policy "matches_source_owner_delete"
on public.match_candidates
for delete
to authenticated
using (
  exists (
    select 1
    from public.cupidates src
    where src.id = source_cupidate_id
      and src.owner_cupid_id = auth.uid()
  )
);
