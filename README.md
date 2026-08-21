# Codebase Orientation Event Website

Live puzzle-hunt game for incoming freshmen/juniors, hosted in the auditorium as part of the club's orientation event. Space Station (Among Us style) theme.

## Stack
- **Frontend/Backend:** Next.js (App Router)
- **Database:** Supabase (Postgres)
- **Deployment:** Vercel
- **Realtime:** Polling (no websockets)
- **Styling:** Tailwind, Framer Motion (leaderboard animations)

## How the Game Works
- Teams of 4 register with a team name + 4 member names (single register action, no separate login).
- After registering, teams land on a **rules page** showing "waiting for game to start".
- The game has **5 rounds**. Each round runs 5 minutes, then auto-pauses for a 30-second gap (during which clues/answer update for the next round), then auto-advances with the timer reset to 0:00.
- Each round has 4 rooms — **Engine Room, Control Room, Weapons Room ("electrical" route), Meeting Hall ("medbay" route)** — each with 3 clickable objects that reveal a clue. Combining all clues gives the round's answer, submitted on a 5th **answer page**.
- The answer field auto-locks when a round ends and unlocks when the next one starts. Teams that don't answer correctly in time get the full round duration (5 min) added to their leaderboard total.
- Between rounds, teams see a "waiting for next round" screen with a 30s countdown.
- After round 5, the game ends. Top 3 teams (lowest cumulative time) win.

## Admin Panel
Passkey-gated (no full auth). Controls:
- Start round / lock round
- Reset system to lobby (sends all teams back to rules page, resets ongoing round's times)
- Delete a team
- Per-team overrides: unlock a team's answer field, manually edit a team's time

## Live Leaderboard
Public, polling-based (1-2s interval), meant to be projected on the auditorium screen. Sorted by lowest cumulative time across all rounds, with animated rank changes.

## Timing (Anti-Tamper)
All timing is computed **server-side only** — the client never reports elapsed time. The status API computes and returns elapsed/remaining seconds fresh on every poll; the frontend just displays that number and increments it locally between polls, syncing on each new poll response.

## Database Schema
- **teams**: `id, team_name, member_names[]`
- **rounds**: `id, round_number, expected_answer, is_locked, round_start_time`
- **clues**: `id, round_id, room_name, object_name, clue_content` — one row per object per round
- **submissions**: `id, team_id, round_id, is_correct, time_taken, score` — one row per team per round

`/lib/db/` contains the tested database functions (teams, rounds, clues, submissions) — reuse these rather than writing new Supabase calls directly.

## Routes (`app/`)
| Route | Purpose |
|---|---|
| `/login` | Team registration (also acts as `/`) |
| `/rules` | Waiting room, pre-round and between-round countdown |
| `/engine`, `/control`, `/electrical`, `/medbay` | The 4 puzzle rooms |
| `/clue` | Shared clue-display component/page |
| `/answer` | Final answer submission page |
| `/leaderboard` | Public live leaderboard (for projector) |
| `/admin` | Admin passkey login |
| `/admin/panel` | Admin dashboard |
| `/adminlogin`, `/adminaction` | Admin auth/action handling |

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSKEY=
```