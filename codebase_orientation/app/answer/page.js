import { getLeaderboard } from '../../lib/db/submissions'

export const dynamic = 'force-dynamic'

export default async function AnswerPage() {
	const { data: leaderboard, error } = await getLeaderboard()

	if (error) return <p>Unable to load the leaderboard.</p>

	return (
		<main>
			<h1>Leaderboard</h1>
			{leaderboard?.length ? (
				<ol>
					{leaderboard.map((entry) => (
						<li key={entry.team_name}>
							{entry.team_name}: {entry.total_score} points ({entry.total_time}s)
						</li>
					))}
				</ol>
			) : <p>No submissions yet.</p>}
		</main>
	)
}
