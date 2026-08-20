import { redirect } from "next/navigation";
import { getSession } from "../../../lib/auth";
import { getActiveRound, getLatestRound, lockRound, startRound } from "../../../lib/db/rounds";
import { getAllTeams } from "../../../lib/db/teams";
import { getLeaderboard, seedRoundSubmissions } from "../../../lib/db/submissions";

export const dynamic = "force-dynamic";

async function startCurrentRound() {
	"use server";
	const { data: round } = await getLatestRound();
	if (round) {
		await startRound(round.id, round.expected_answer);
		await seedRoundSubmissions(round.id);
	}
}

async function lockCurrentRound() {
	"use server";
	const { data: round } = await getActiveRound();
	if (round) await lockRound(round.id);
}

export default async function AdminActionPage() {
	const session = await getSession();
	if (!session) redirect("/adminlogin");

	const [{ data: activeRound }, { data: latestRound }, { data: teams }, { data: leaderboard }] = await Promise.all([
		getActiveRound(),
		getLatestRound(),
		getAllTeams(),
		getLeaderboard(),
	]);

	return (
		<main className="min-h-screen bg-slate-100 px-6 py-12">
			<div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg">
				<h1 className="text-2xl font-semibold text-slate-900">Admin actions</h1>
				<p className="mt-2 text-slate-600">
					Welcome, {session.username}.
				</p>
				<p className="mt-4 text-slate-700">
					Latest round: {latestRound ? latestRound.id : "none"}
				</p>
				<p className="mt-2 text-slate-700">
					Status: {activeRound ? "running" : "stopped"}
				</p>
				<div className="mt-4 flex gap-3">
					<form action={startCurrentRound}>
						<button type="submit">Start round</button>
					</form>
					<form action={lockCurrentRound}>
						<button type="submit">Lock round</button>
					</form>
				</div>
				<h2 className="mt-8 text-xl font-semibold text-slate-900">Teams ({teams?.length || 0})</h2>
				<ul>
					{teams?.map((team) => <li key={team.id}>{team.team_name}</li>)}
				</ul>
				<h2 className="mt-8 text-xl font-semibold text-slate-900">Leaderboard</h2>
				<ol>
					{leaderboard?.map((entry) => <li key={entry.team_name}>{entry.team_name}: {entry.total_score}</li>)}
				</ol>
			</div>
		</main>
	);
}
