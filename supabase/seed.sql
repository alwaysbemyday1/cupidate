-- Cupidate POC fake data seed
-- Uses the earliest existing auth user as the base tester account.
-- Adds one accepted connected cupid, one discoverable cupid,
-- three owned cupidates, two connected cupidates, and two match candidates.

do $$
declare
  base_cupid_id uuid;
  connected_cupid_id constant uuid := '11111111-1111-4111-8111-111111111111';
  discoverable_cupid_id constant uuid := '22222222-2222-4222-8222-222222222222';
  my_mina_id constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  my_dohun_id constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
  my_hana_id constant uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
  remote_yuna_id constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1';
  remote_jin_id constant uuid := 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';
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
      connected_cupid_id,
      'authenticated',
      'authenticated',
      'demo-connected@cupidate.app',
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
      discoverable_cupid_id,
      'authenticated',
      'authenticated',
      'demo-discover@cupidate.app',
      crypt('Cupidate123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"nickname":"navy_yuna"}'::jsonb,
      now(),
      now(),
      false,
      false
    )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  insert into public.cupids (id, nickname)
  values
    (base_cupid_id, 'cupid'),
    (connected_cupid_id, 'pixel_jin'),
    (discoverable_cupid_id, 'navy_yuna')
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
    (base_cupid_id, connected_cupid_id, 'accepted', now())
  on conflict (requester_cupid_id, addressee_cupid_id) do update
  set status = excluded.status,
      responded_at = excluded.responded_at,
      updated_at = now();

  insert into public.cupidates (
    id,
    owner_cupid_id,
    display_name,
    birth_year,
    gender,
    bio,
    is_active,
    region,
    job_title,
    height_cm,
    smoking_habit,
    drinking_habit
  )
  values
    (
      my_mina_id,
      base_cupid_id,
      'Mina',
      1998,
      'female',
      'Coffee, calm walks, and thoughtful conversations.',
      true,
      'seoul',
      'Brand Strategist',
      164,
      'none',
      'social'
    ),
    (
      my_dohun_id,
      base_cupid_id,
      'Dohun',
      1994,
      'male',
      'Weekend runner with a warm and steady style.',
      true,
      'seoul',
      'Frontend Engineer',
      178,
      'none',
      'social'
    ),
    (
      my_hana_id,
      base_cupid_id,
      'Hana',
      1996,
      'female',
      'Currently paused from matching while focusing on work.',
      false,
      'seoul',
      'Finance Manager',
      165,
      'none',
      'social'
    ),
    (
      remote_yuna_id,
      connected_cupid_id,
      'Yuna',
      1997,
      'female',
      'Designer energy, bright humor, and city-date vibes.',
      true,
      'seoul',
      'Product Designer',
      166,
      'none',
      'social'
    ),
    (
      remote_jin_id,
      connected_cupid_id,
      'Jin',
      1993,
      'male',
      'Product-minded foodie who likes honest communication.',
      true,
      'bundang',
      'PM',
      181,
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
    preferred_genders
  )
  values
    (
      my_mina_id,
      '{
        "hobbies":["coffee","exhibition","walking"]
      }'::jsonb,
      29,
      35,
      172,
      184,
      array['seoul','bundang'],
      array['engineer','pm','product'],
      'none_only',
      'social',
      array['male']
    ),
    (
      my_dohun_id,
      '{
        "hobbies":["running","ramen","travel"]
      }'::jsonb,
      25,
      33,
      158,
      170,
      array['seoul'],
      array['designer','brand','marketing'],
      'none_only',
      'any',
      array['female']
    ),
    (
      my_hana_id,
      '{
        "hobbies":["pilates","brunch","reading"]
      }'::jsonb,
      29,
      36,
      173,
      185,
      array['seoul','bundang'],
      array['finance','consulting','strategy'],
      'none_only',
      'social',
      array['male']
    ),
    (
      remote_yuna_id,
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
      array['male']
    ),
    (
      remote_jin_id,
      '{
        "hobbies":["running","ramen","movie"]
      }'::jsonb,
      24,
      32,
      158,
      170,
      array['seoul','bundang'],
      array['designer','brand','marketing'],
      'ok',
      'social',
      array['female']
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
      updated_at = now();

  insert into public.match_candidates (
    source_cupidate_id,
    target_cupidate_id,
    match_score,
    match_status,
    reason
  )
  values
    (
      my_mina_id,
      remote_jin_id,
      91,
      'proposed',
      '{
        "matchedHobbies":["coffee"],
        "breakdown":{
          "age":27,
          "hobbies":21,
          "lifestyle":18,
          "location":13,
          "profile":12
        }
      }'::jsonb
    ),
    (
      my_dohun_id,
      remote_yuna_id,
      88,
      'accepted',
      '{
        "matchedHobbies":["travel","running"],
        "breakdown":{
          "age":24,
          "hobbies":22,
          "lifestyle":17,
          "location":13,
          "profile":12
        }
      }'::jsonb
    )
  on conflict (source_cupidate_id, target_cupidate_id) do update
  set match_score = excluded.match_score,
      match_status = excluded.match_status,
      reason = excluded.reason,
      updated_at = now();
end $$;
