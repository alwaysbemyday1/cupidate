create temporary table cupidate_owner_canonical on commit drop as
with ranked as (
  select
    c.id as cupidate_id,
    c.owner_cupid_id,
    first_value(c.id) over (
      partition by c.owner_cupid_id
      order by c.is_active desc, c.updated_at desc, c.created_at desc, c.id desc
    ) as canonical_cupidate_id,
    row_number() over (
      partition by c.owner_cupid_id
      order by c.is_active desc, c.updated_at desc, c.created_at desc, c.id desc
    ) as owner_rank
  from public.cupidates c
)
select
  cupidate_id,
  owner_cupid_id,
  canonical_cupidate_id,
  owner_rank
from ranked;

create temporary table cupidate_preference_canonical on commit drop as
with mapped as (
  select
    coalesce(map.canonical_cupidate_id, p.cupidate_id) as cupidate_id,
    p.preferences,
    p.preferred_age_min,
    p.preferred_age_max,
    p.preferred_height_min_cm,
    p.preferred_height_max_cm,
    p.preferred_regions,
    p.preferred_job_groups,
    p.preferred_smoking,
    p.preferred_drinking,
    p.preferred_genders,
    p.must_have_condition_keys,
    p.created_at,
    p.updated_at,
    row_number() over (
      partition by coalesce(map.canonical_cupidate_id, p.cupidate_id)
      order by p.updated_at desc, p.created_at desc, p.id desc
    ) as preference_rank
  from public.cupidate_preferences p
  left join cupidate_owner_canonical map
    on map.cupidate_id = p.cupidate_id
)
select
  cupidate_id,
  preferences,
  preferred_age_min,
  preferred_age_max,
  preferred_height_min_cm,
  preferred_height_max_cm,
  preferred_regions,
  preferred_job_groups,
  preferred_smoking,
  preferred_drinking,
  preferred_genders,
  must_have_condition_keys,
  created_at,
  updated_at
from mapped
where preference_rank = 1;

create temporary table match_candidate_canonical on commit drop as
with remapped as (
  select
    coalesce(src_map.canonical_cupidate_id, mc.source_cupidate_id) as source_cupidate_id,
    coalesce(tgt_map.canonical_cupidate_id, mc.target_cupidate_id) as target_cupidate_id,
    mc.match_score,
    mc.match_status,
    mc.reason,
    mc.created_at,
    mc.updated_at,
    row_number() over (
      partition by
        coalesce(src_map.canonical_cupidate_id, mc.source_cupidate_id),
        coalesce(tgt_map.canonical_cupidate_id, mc.target_cupidate_id)
      order by
        case mc.match_status
          when 'accepted' then 2
          when 'proposed' then 1
          else 0
        end desc,
        mc.match_score desc,
        mc.updated_at desc,
        mc.created_at desc,
        mc.id desc
    ) as pair_rank
  from public.match_candidates mc
  left join cupidate_owner_canonical src_map
    on src_map.cupidate_id = mc.source_cupidate_id
  left join cupidate_owner_canonical tgt_map
    on tgt_map.cupidate_id = mc.target_cupidate_id
)
select
  remapped.source_cupidate_id,
  remapped.target_cupidate_id,
  remapped.match_score,
  remapped.match_status,
  remapped.reason,
  remapped.created_at,
  remapped.updated_at
from remapped
join public.cupidates src
  on src.id = remapped.source_cupidate_id
join public.cupidates tgt
  on tgt.id = remapped.target_cupidate_id
where remapped.pair_rank = 1
  and remapped.source_cupidate_id <> remapped.target_cupidate_id
  and src.owner_cupid_id <> tgt.owner_cupid_id
  and src.is_active
  and tgt.is_active
  and public.are_cupids_connected(src.owner_cupid_id, tgt.owner_cupid_id);

delete from public.match_candidates;

delete from public.cupidate_preferences;

delete from public.cupidates target
using cupidate_owner_canonical map
where target.id = map.cupidate_id
  and map.owner_rank > 1;

insert into public.cupidate_preferences (
  cupidate_id,
  preferences,
  preferred_age_min,
  preferred_age_max,
  preferred_height_min_cm,
  preferred_height_max_cm,
  preferred_regions,
  preferred_job_groups,
  preferred_smoking,
  preferred_drinking,
  preferred_genders,
  must_have_condition_keys,
  created_at,
  updated_at
)
select
  cupidate_id,
  preferences,
  preferred_age_min,
  preferred_age_max,
  preferred_height_min_cm,
  preferred_height_max_cm,
  preferred_regions,
  preferred_job_groups,
  preferred_smoking,
  preferred_drinking,
  preferred_genders,
  must_have_condition_keys,
  created_at,
  updated_at
from cupidate_preference_canonical;

insert into public.match_candidates (
  source_cupidate_id,
  target_cupidate_id,
  match_score,
  match_status,
  reason,
  created_at,
  updated_at
)
select
  source_cupidate_id,
  target_cupidate_id,
  match_score,
  match_status,
  reason,
  created_at,
  updated_at
from match_candidate_canonical;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cupidates_owner_single_profile'
  ) then
    alter table public.cupidates
      add constraint cupidates_owner_single_profile unique (owner_cupid_id);
  end if;
end $$;
