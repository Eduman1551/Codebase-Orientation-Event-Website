
import { cookies } from 'next/headers'
import { getTeamById } from '../lib/db/teams'
import { getActiveRound } from '../lib/db/rounds'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const teamId = (await cookies()).get('team_id')?.value
  const [{ data: team }, { data: round }] = await Promise.all([
    teamId ? getTeamById(teamId) : Promise.resolve({ data: null }),
    getActiveRound()
  ])

  return (
    <>
        <main>
          <h1>{team ? `Welcome, ${team.team_name}` : 'Codebase Orientation'}</h1>
          <p>{round ? 'The current round is open.' : 'Waiting for the next round to start.'}</p>
          {round && <a href="/clue">Open current clue</a>}
        </main>
    </>
  );
}
