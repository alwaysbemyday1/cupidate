create policy "cupids_authenticated_directory_select"
on public.cupids
for select
to authenticated
using (true);
