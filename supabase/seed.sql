-- Cupid-first POC fake data seed
-- Every user is a cupid. A cupidate profile is optional and belongs to the same cupid.
-- Connected cupids with active cupidate profiles should appear in Network -> Cupidates automatically.

do $$
declare
  base_cupid_id uuid;
  connected_jin_cupid_id constant uuid := '11111111-1111-4111-8111-111111111111';
  connected_yuna_cupid_id constant uuid := '22222222-2222-4222-8222-222222222222';
  discoverable_hana_cupid_id constant uuid := '33333333-3333-4333-8333-333333333333';
  discoverable_bridge_cupid_id constant uuid := '44444444-4444-4444-8444-444444444444';
  self_cupidate_id constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  jin_cupidate_id constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  yuna_cupidate_id constant uuid := 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
  hana_cupidate_id constant uuid := 'dddddddd-dddd-4ddd-8ddd-ddddddddddd1';
begin
  select id into base_cupid_id
  from auth.users
  order by created_at asc
  limit 1;

  if base_cupid_id is null then
    raise exception 'seed requires at least one auth user';
  end if;

  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_sso_user,
    is_anonymous
  )
  values
    (
      connected_jin_cupid_id,
      'authenticated',
      'authenticated',
      'demo-jin@cupidate.app',
      crypt('Cupidate123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nickname":"pixel_jin"}'::jsonb,
      now(),
      now(),
      false,
      false
    ),
    (
      connected_yuna_cupid_id,
      'authenticated',
      'authenticated',
      'demo-yuna@cupidate.app',
      crypt('Cupidate123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nickname":"navy_yuna"}'::jsonb,
      now(),
      now(),
      false,
      false
    ),
    (
      discoverable_hana_cupid_id,
      'authenticated',
      'authenticated',
      'demo-hana@cupidate.app',
      crypt('Cupidate123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nickname":"quiet_hana"}'::jsonb,
      now(),
      now(),
      false,
      false
    ),
    (
      discoverable_bridge_cupid_id,
      'authenticated',
      'authenticated',
      'demo-bridge@cupidate.app',
      crypt('Cupidate123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nickname":"bridge_lee"}'::jsonb,
      now(),
      now(),
      false,
      false
    )
  on conflict (id) do update
  set email = excluded.email,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = now();

  insert into public.cupids (id, nickname)
  values
    (base_cupid_id, 'cupid'),
    (connected_jin_cupid_id, 'pixel_jin'),
    (connected_yuna_cupid_id, 'navy_yuna'),
    (discoverable_hana_cupid_id, 'quiet_hana'),
    (discoverable_bridge_cupid_id, 'bridge_lee')
  on conflict (id) do update
  set nickname = excluded.nickname,
      updated_at = now();

  insert into public.cupid_connections (
    requester_cupid_id,
    addressee_cupid_id,
    status,
    responded_at
  )
  values
    (base_cupid_id, connected_jin_cupid_id, 'accepted', now()),
    (base_cupid_id, connected_yuna_cupid_id, 'accepted', now())
  on conflict (requester_cupid_id, addressee_cupid_id) do update
  set status = excluded.status,
      responded_at = excluded.responded_at,
      updated_at = now();

  delete from public.cupidates
  where owner_cupid_id in (
      base_cupid_id,
      connected_jin_cupid_id,
      connected_yuna_cupid_id,
      discoverable_hana_cupid_id
    )
    and id not in (self_cupidate_id, jin_cupidate_id, yuna_cupidate_id, hana_cupidate_id);

  insert into public.cupidates (
    id,
    owner_cupid_id,
    display_name,
    birth_year,
    gender,
    bio,
    is_active,
    profile_visibility,
    region,
    job_title,
    height_cm,
    smoking_habit,
    drinking_habit
  )
  values
    (
      self_cupidate_id,
      base_cupid_id,
      'Dohun',
      1994,
      'male',
      'Warm, steady, and ready to meet someone through trusted introductions.',
      true,
      'public',
      'seoul',
      'Frontend Engineer',
      178,
      'none',
      'social'
    ),
    (
      jin_cupidate_id,
      connected_jin_cupid_id,
      'Jin',
      1993,
      'male',
      'Food, film, and honest communication.',
      true,
      'basic',
      'bundang',
      'PM',
      181,
      'none',
      'social'
    ),
    (
      yuna_cupidate_id,
      connected_yuna_cupid_id,
      'Yuna',
      1997,
      'female',
      'Bright humor, design energy, and city-date vibes.',
      true,
      'public',
      'seoul',
      'Product Designer',
      166,
      'none',
      'social'
    ),
    (
      hana_cupidate_id,
      discoverable_hana_cupid_id,
      'Hana',
      1996,
      'female',
      'Currently focusing on work and keeping the dating profile paused.',
      false,
      'private',
      'seoul',
      'Finance Manager',
      165,
      'none',
      'social'
    )
  on conflict (id) do update
  set owner_cupid_id = excluded.owner_cupid_id,
      display_name = excluded.display_name,
      birth_year = excluded.birth_year,
      gender = excluded.gender,
      bio = excluded.bio,
      is_active = excluded.is_active,
      profile_visibility = excluded.profile_visibility,
      region = excluded.region,
      job_title = excluded.job_title,
      height_cm = excluded.height_cm,
      smoking_habit = excluded.smoking_habit,
      drinking_habit = excluded.drinking_habit,
      updated_at = now();

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
    must_have_condition_keys
  )
  values
    (
      self_cupidate_id,
      '{
        "hobbies":["running","ramen","travel"]
      }'::jsonb,
      25,
      33,
      158,
      170,
      array['seoul','bundang'],
      array['designer','brand','marketing'],
      'none_only',
      'social',
      array['female'],
      array['shared_hobbies','preferred_regions']::public.preference_condition_key[]
    ),
    (
      jin_cupidate_id,
      '{
        "hobbies":["movie","ramen","running"]
      }'::jsonb,
      24,
      32,
      158,
      170,
      array['seoul','bundang'],
      array['designer','brand','marketing'],
      'ok',
      'social',
      array['female'],
      array['shared_hobbies','preferred_height_range']::public.preference_condition_key[]
    ),
    (
      yuna_cupidate_id,
      '{
        "hobbies":["coffee","travel","exhibition"]
      }'::jsonb,
      28,
      36,
      173,
      185,
      array['seoul','bundang'],
      array['engineer','pm','product'],
      'none_only',
      'social',
      array['male'],
      array['preferred_regions','preferred_job_groups','shared_hobbies']::public.preference_condition_key[]
    ),
    (
      hana_cupidate_id,
      '{
        "hobbies":["pilates","reading","brunch"]
      }'::jsonb,
      29,
      36,
      173,
      185,
      array['seoul','bundang'],
      array['finance','consulting','strategy'],
      'none_only',
      'social',
      array['male'],
      array['preferred_regions','preferred_job_groups','preferred_height_range']::public.preference_condition_key[]
    )
  on conflict (cupidate_id) do update
  set preferences = excluded.preferences,
      preferred_age_min = excluded.preferred_age_min,
      preferred_age_max = excluded.preferred_age_max,
      preferred_height_min_cm = excluded.preferred_height_min_cm,
      preferred_height_max_cm = excluded.preferred_height_max_cm,
      preferred_regions = excluded.preferred_regions,
      preferred_job_groups = excluded.preferred_job_groups,
      preferred_smoking = excluded.preferred_smoking,
      preferred_drinking = excluded.preferred_drinking,
      preferred_genders = excluded.preferred_genders,
      must_have_condition_keys = excluded.must_have_condition_keys,
      updated_at = now();

  delete from public.match_candidates
  where source_cupidate_id in (self_cupidate_id, jin_cupidate_id, yuna_cupidate_id, hana_cupidate_id)
     or target_cupidate_id in (self_cupidate_id, jin_cupidate_id, yuna_cupidate_id, hana_cupidate_id);

  insert into public.match_candidates (
    source_cupidate_id,
    target_cupidate_id,
    match_score,
    match_status,
    reason
  )
  values
    (
      self_cupidate_id,
      yuna_cupidate_id,
      92,
      'proposed',
      '{
        "matchedHobbies":["travel"],
        "priorityMatches":["shared_hobbies","preferred_regions"],
        "breakdown":{
          "age":25,
          "hobbies":22,
          "lifestyle":18,
          "location":14,
          "profile":13
        }
      }'::jsonb
    ),
    (
      self_cupidate_id,
      jin_cupidate_id,
      81,
      'accepted',
      '{
        "matchedHobbies":["running","ramen"],
        "priorityMatches":["shared_hobbies"],
        "breakdown":{
          "age":21,
          "hobbies":22,
          "lifestyle":17,
          "location":11,
          "profile":10
        }
      }'::jsonb
    )
  on conflict (source_cupidate_id, target_cupidate_id) do update
  set match_score = excluded.match_score,
      match_status = excluded.match_status,
      reason = excluded.reason,
      updated_at = now();
end $$;
