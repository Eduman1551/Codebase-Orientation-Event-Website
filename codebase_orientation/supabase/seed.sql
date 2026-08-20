-- Development-only seed data for the Codebase Orientation game.
-- Run this in the Supabase SQL editor after the tables have been created.
-- The round starts locked so an admin must explicitly start it.

insert into public.rounds (id, is_locked, expected_answer, room_name, created_at)
values (
  '00000000-0000-0000-0000-000000000001',
  true,
  'blue',
  'main',
  now()
)
on conflict (id) do update set
  is_locked = excluded.is_locked,
  expected_answer = excluded.expected_answer,
  room_name = excluded.room_name;

insert into public.teams (id, team_name, member_names, created_at)
values
  ('00000000-0000-0000-0000-000000000011', 'Pixel Pioneers', '{Ada,Grace}', now()),
  ('00000000-0000-0000-0000-000000000012', 'Null Terminators', '{Linus,Barbara}', now()),
  ('00000000-0000-0000-0000-000000000013', 'Runtime Rebels', '{Alan,Anita}', now())
on conflict (id) do update set
  team_name = excluded.team_name,
  member_names = excluded.member_names;

insert into public.clues (id, round_id, room_name, clue, created_at)
values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'main', 'Find the color of the clear daytime sky.', now()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'main', 'Refresh clue: what color is commonly used for a hyperlink?', now()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'main', 'Refresh clue: name the primary color made by short-wavelength light.', now())
on conflict (id) do update set
  room_name = excluded.room_name,
  clue = excluded.clue;

insert into public.submissions (team_id, round_id, is_correct, time_taken, score, submitted_at)
values
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', true, 18, 82, now()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', false, null, 0, null),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', false, null, 0, null)
on conflict (team_id, round_id) do update set
  is_correct = excluded.is_correct,
  time_taken = excluded.time_taken,
  score = excluded.score,
  submitted_at = excluded.submitted_at;