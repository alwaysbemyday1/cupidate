alter table public.cupidates
  add column if not exists region text,
  add column if not exists job_title text,
  add column if not exists height_cm int,
  add column if not exists smoking_habit text,
  add column if not exists drinking_habit text;

alter table public.cupidate_preferences
  add column if not exists preferred_age_min int,
  add column if not exists preferred_age_max int,
  add column if not exists preferred_height_min_cm int,
  add column if not exists preferred_height_max_cm int,
  add column if not exists preferred_regions text[] not null default '{}'::text[],
  add column if not exists preferred_job_groups text[] not null default '{}'::text[],
  add column if not exists preferred_smoking text,
  add column if not exists preferred_drinking text,
  add column if not exists preferred_genders text[] not null default '{}'::text[];

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cupidates_height_cm_range'
  ) then
    alter table public.cupidates
      add constraint cupidates_height_cm_range
      check (height_cm is null or height_cm between 120 and 230);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidates_smoking_habit_check'
  ) then
    alter table public.cupidates
      add constraint cupidates_smoking_habit_check
      check (smoking_habit is null or smoking_habit in ('none', 'sometimes', 'often'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidates_drinking_habit_check'
  ) then
    alter table public.cupidates
      add constraint cupidates_drinking_habit_check
      check (drinking_habit is null or drinking_habit in ('never', 'social', 'often'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidate_preferences_age_range_check'
  ) then
    alter table public.cupidate_preferences
      add constraint cupidate_preferences_age_range_check
      check (
        (preferred_age_min is null and preferred_age_max is null)
        or (
          preferred_age_min between 19 and 100
          and preferred_age_max between 19 and 100
          and preferred_age_min <= preferred_age_max
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidate_preferences_height_range_check'
  ) then
    alter table public.cupidate_preferences
      add constraint cupidate_preferences_height_range_check
      check (
        (preferred_height_min_cm is null and preferred_height_max_cm is null)
        or (
          preferred_height_min_cm between 120 and 230
          and preferred_height_max_cm between 120 and 230
          and preferred_height_min_cm <= preferred_height_max_cm
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidate_preferences_preferred_smoking_check'
  ) then
    alter table public.cupidate_preferences
      add constraint cupidate_preferences_preferred_smoking_check
      check (preferred_smoking is null or preferred_smoking in ('none_only', 'ok', 'any'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'cupidate_preferences_preferred_drinking_check'
  ) then
    alter table public.cupidate_preferences
      add constraint cupidate_preferences_preferred_drinking_check
      check (preferred_drinking is null or preferred_drinking in ('never', 'social', 'often', 'any'));
  end if;
end $$;

with source as (
  select
    c.id as cupidate_id,
    p.preferences
  from public.cupidates c
  left join public.cupidate_preferences p
    on p.cupidate_id = c.id
)
update public.cupidates c
set
  region = coalesce(
    c.region,
    nullif(lower(source.preferences ->> 'region'), ''),
    nullif(lower(source.preferences ->> 'location'), '')
  ),
  job_title = coalesce(
    c.job_title,
    nullif(source.preferences ->> 'jobTitle', '')
  ),
  height_cm = coalesce(
    c.height_cm,
    case
      when jsonb_typeof(source.preferences -> 'heightCm') = 'number'
        then (source.preferences ->> 'heightCm')::int
      else null
    end
  ),
  smoking_habit = coalesce(
    c.smoking_habit,
    case coalesce(source.preferences ->> 'smokingHabit', source.preferences ->> 'smoking')
      when 'none' then 'none'
      when 'no' then 'none'
      when 'sometimes' then 'sometimes'
      when 'often' then 'often'
      when 'yes' then 'often'
      else null
    end
  ),
  drinking_habit = coalesce(
    c.drinking_habit,
    case coalesce(source.preferences ->> 'drinkingHabit', source.preferences ->> 'drinking')
      when 'never' then 'never'
      when 'social' then 'social'
      when 'often' then 'often'
      else null
    end
  )
from source
where source.cupidate_id = c.id;

update public.cupidate_preferences p
set
  preferred_age_min = coalesce(
    p.preferred_age_min,
    case
      when jsonb_typeof(p.preferences -> 'ageRange') = 'array' and jsonb_array_length(p.preferences -> 'ageRange') = 2
        then least((p.preferences -> 'ageRange' ->> 0)::int, (p.preferences -> 'ageRange' ->> 1)::int)
      when jsonb_typeof(p.preferences -> 'preferredAgeRange') = 'array' and jsonb_array_length(p.preferences -> 'preferredAgeRange') = 2
        then least((p.preferences -> 'preferredAgeRange' ->> 0)::int, (p.preferences -> 'preferredAgeRange' ->> 1)::int)
      else null
    end
  ),
  preferred_age_max = coalesce(
    p.preferred_age_max,
    case
      when jsonb_typeof(p.preferences -> 'ageRange') = 'array' and jsonb_array_length(p.preferences -> 'ageRange') = 2
        then greatest((p.preferences -> 'ageRange' ->> 0)::int, (p.preferences -> 'ageRange' ->> 1)::int)
      when jsonb_typeof(p.preferences -> 'preferredAgeRange') = 'array' and jsonb_array_length(p.preferences -> 'preferredAgeRange') = 2
        then greatest((p.preferences -> 'preferredAgeRange' ->> 0)::int, (p.preferences -> 'preferredAgeRange' ->> 1)::int)
      else null
    end
  ),
  preferred_height_min_cm = coalesce(
    p.preferred_height_min_cm,
    case
      when jsonb_typeof(p.preferences -> 'preferredHeightRange') = 'array'
        and jsonb_array_length(p.preferences -> 'preferredHeightRange') = 2
        then least((p.preferences -> 'preferredHeightRange' ->> 0)::int, (p.preferences -> 'preferredHeightRange' ->> 1)::int)
      else null
    end
  ),
  preferred_height_max_cm = coalesce(
    p.preferred_height_max_cm,
    case
      when jsonb_typeof(p.preferences -> 'preferredHeightRange') = 'array'
        and jsonb_array_length(p.preferences -> 'preferredHeightRange') = 2
        then greatest((p.preferences -> 'preferredHeightRange' ->> 0)::int, (p.preferences -> 'preferredHeightRange' ->> 1)::int)
      else null
    end
  ),
  preferred_regions = case
    when array_length(p.preferred_regions, 1) is not null then p.preferred_regions
    when jsonb_typeof(p.preferences -> 'preferredRegions') = 'array' then (
      select coalesce(array_agg(lower(value)), '{}'::text[])
      from jsonb_array_elements_text(p.preferences -> 'preferredRegions') as value
    )
    else '{}'::text[]
  end,
  preferred_job_groups = case
    when array_length(p.preferred_job_groups, 1) is not null then p.preferred_job_groups
    when jsonb_typeof(p.preferences -> 'preferredJobGroups') = 'array' then (
      select coalesce(array_agg(lower(value)), '{}'::text[])
      from jsonb_array_elements_text(p.preferences -> 'preferredJobGroups') as value
    )
    else '{}'::text[]
  end,
  preferred_smoking = coalesce(
    p.preferred_smoking,
    case p.preferences ->> 'preferredSmoking'
      when 'none_only' then 'none_only'
      when 'ok' then 'ok'
      when 'any' then 'any'
      when 'no' then 'none_only'
      when 'yes' then 'ok'
      else null
    end
  ),
  preferred_drinking = coalesce(
    p.preferred_drinking,
    case p.preferences ->> 'preferredDrinking'
      when 'never' then 'never'
      when 'social' then 'social'
      when 'often' then 'often'
      when 'any' then 'any'
      else null
    end
  ),
  preferred_genders = case
    when array_length(p.preferred_genders, 1) is not null then p.preferred_genders
    when jsonb_typeof(p.preferences -> 'preferredGenders') = 'array' then (
      select coalesce(array_agg(lower(value)), '{}'::text[])
      from jsonb_array_elements_text(p.preferences -> 'preferredGenders') as value
    )
    when p.preferences ? 'preferredGender' then array[lower(p.preferences ->> 'preferredGender')]
    else '{}'::text[]
  end,
  preferences = coalesce(p.preferences, '{}'::jsonb) - array[
    'ageRange',
    'preferredAgeRange',
    'location',
    'region',
    'preferredRegions',
    'preferredJobGroups',
    'smoking',
    'smokingHabit',
    'drinking',
    'drinkingHabit',
    'preferredSmoking',
    'preferredDrinking',
    'jobTitle',
    'heightCm',
    'preferredHeightRange',
    'preferredGenders',
    'preferredGender'
  ]
where true;

create index if not exists idx_cupidates_region on public.cupidates(region);
create index if not exists idx_cupidates_job_title on public.cupidates(job_title);
create index if not exists idx_cupidates_owner_active_region on public.cupidates(owner_cupid_id, is_active, region);
create index if not exists idx_cupidate_preferences_age_range on public.cupidate_preferences(preferred_age_min, preferred_age_max);
create index if not exists idx_cupidate_preferences_height_range on public.cupidate_preferences(preferred_height_min_cm, preferred_height_max_cm);
create index if not exists idx_cupidate_preferences_regions on public.cupidate_preferences using gin (preferred_regions);
create index if not exists idx_cupidate_preferences_job_groups on public.cupidate_preferences using gin (preferred_job_groups);
create index if not exists idx_cupidate_preferences_genders on public.cupidate_preferences using gin (preferred_genders);
