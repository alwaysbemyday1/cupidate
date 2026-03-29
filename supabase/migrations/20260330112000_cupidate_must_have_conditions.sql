do $$
begin
  create type public.preference_condition_key as enum (
    'age_range',
    'shared_hobbies',
    'preferred_regions',
    'preferred_job_groups',
    'preferred_smoking',
    'preferred_drinking',
    'preferred_gender',
    'preferred_height_range'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.cupidate_preferences
  add column if not exists must_have_condition_keys public.preference_condition_key[] not null default '{}'::public.preference_condition_key[];

update public.cupidate_preferences
set must_have_condition_keys = coalesce(
  (
    select array_agg(value::public.preference_condition_key)
    from jsonb_array_elements_text(preferences -> 'mustHaveConditionKeys') as entry(value)
    where value = any (
      array[
        'age_range',
        'shared_hobbies',
        'preferred_regions',
        'preferred_job_groups',
        'preferred_smoking',
        'preferred_drinking',
        'preferred_gender',
        'preferred_height_range'
      ]
    )
  ),
  '{}'::public.preference_condition_key[]
)
where preferences ? 'mustHaveConditionKeys'
  and coalesce(array_length(must_have_condition_keys, 1), 0) = 0;

update public.cupidate_preferences
set preferences = preferences - 'mustHaveConditionKeys'
where preferences ? 'mustHaveConditionKeys';

alter table public.cupidate_preferences
  drop constraint if exists cupidate_preferences_must_have_condition_keys_limit;

alter table public.cupidate_preferences
  add constraint cupidate_preferences_must_have_condition_keys_limit
  check (coalesce(array_length(must_have_condition_keys, 1), 0) <= 5);
