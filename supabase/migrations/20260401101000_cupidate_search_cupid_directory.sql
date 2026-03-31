create or replace function public.search_cupid_directory(search_query text)
returns table (
  id uuid,
  nickname text
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select c.id, c.nickname
  from public.cupids c
  left join auth.users u on u.id = c.id
  where auth.uid() is not null
    and btrim(coalesce(search_query, '')) <> ''
    and c.id <> auth.uid()
    and (
      c.nickname ilike '%' || btrim(search_query) || '%'
      or coalesce(u.email, '') ilike '%' || btrim(search_query) || '%'
    )
  order by c.nickname asc
  limit 20;
$$;

revoke all on function public.search_cupid_directory(text) from public;
grant execute on function public.search_cupid_directory(text) to authenticated;
