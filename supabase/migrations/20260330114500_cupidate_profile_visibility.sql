do $$
begin
  create type public.profile_visibility_scope as enum ('private', 'basic', 'public');
exception
  when duplicate_object then null;
end $$;

alter table public.cupidates
  add column if not exists profile_visibility public.profile_visibility_scope not null default 'basic';

update public.cupidates
set profile_visibility = 'basic'
where profile_visibility is null;
