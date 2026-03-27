-- Cupidate seed strategy template
-- 1) 먼저 Supabase Auth로 테스트 유저(=cupid 계정)를 생성한다.
-- 2) 생성된 auth.users.id를 아래 insert에 연결한다.

-- Seed cupids from existing auth users (example)
-- insert into public.cupids (id, nickname)
-- select id, split_part(email, '@', 1)
-- from auth.users
-- where email in ('cupid-a@example.com', 'cupid-b@example.com')
-- on conflict (id) do update set nickname = excluded.nickname;

-- Example connection (A -> B accepted)
-- insert into public.cupid_connections (requester_cupid_id, addressee_cupid_id, status, responded_at)
-- values ('<cupid_a_uuid>', '<cupid_b_uuid>', 'accepted', now());

-- Example cupidates
-- insert into public.cupidates (owner_cupid_id, display_name, birth_year, gender, bio)
-- values
--   ('<cupid_a_uuid>', 'Alice', 1997, 'F', 'hiking, coffee'),
--   ('<cupid_b_uuid>', 'Bob', 1995, 'M', 'music, travel');

-- Example preferences
-- insert into public.cupidate_preferences (cupidate_id, preferences)
-- values
--   ('<alice_cupidate_uuid>', '{"ageRange":[27,34],"hobbies":["hiking","movies"],"smoking":"no"}'::jsonb),
--   ('<bob_cupidate_uuid>', '{"ageRange":[25,33],"hobbies":["travel","music"],"smoking":"no"}'::jsonb);
