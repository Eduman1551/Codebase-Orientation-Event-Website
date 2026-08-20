'use server'

import { redirect } from 'next/navigation'
import { getSession } from '../../lib/auth.js'
import { startRound, lockRound, getAllRounds, getRoundById } from '../../lib/db/rounds.js'
import { getAllTeams } from '../../lib/db/teams.js'
import { seedRoundSubmissions, getSubmissionsForRound, resetTeamSubmission, editTeamTime, getLeaderboard } from '../../lib/db/submissions.js'

function requireAuth(session) {
  if (!session) redirect('/adminlogin')
}

/** Start a round using the answer already stored on that round. */
export async function startRoundAction(roundId) {
  const session = await getSession()
  requireAuth(session)

  if (!roundId) {
    return { success: false, error: 'Round ID is required.' }
  }

  const { data: selectedRound, error: roundError } = await getRoundById(roundId)
  if (roundError || !selectedRound?.expected_answer?.trim()) {
    return { success: false, error: 'The selected round has no expected answer in the database.' }
  }

  const { data, error } = await startRound(roundId, selectedRound.expected_answer.trim())
  if (error) return { success: false, error: error.message }

  // Seed submission rows for all teams
  await seedRoundSubmissions(roundId)

  return { success: true, round: data }
}

/** Lock a round so no more answers can be submitted. */
export async function lockRoundAction(roundId) {
  const session = await getSession()
  requireAuth(session)

  const { data, error } = await lockRound(roundId)
  if (error) return { success: false, error: error.message }
  return { success: true, round: data }
}

/** Fetch all data needed for the admin dashboard. */
export async function getAdminDashboardDataAction() {
  const session = await getSession()
  requireAuth(session)

  const [teamsResult, roundsResult, leaderboardResult] = await Promise.all([
    getAllTeams(),
    getAllRounds(),
    getLeaderboard(),
  ])

  // Get submissions for each round
  const submissionsMap = {}
  if (roundsResult.data) {
    await Promise.all(
      roundsResult.data.map(async (round) => {
        const { data } = await getSubmissionsForRound(round.id)
        submissionsMap[round.id] = data || []
      })
    )
  }

  return {
    teams: teamsResult.data || [],
    rounds: roundsResult.data || [],
    leaderboard: leaderboardResult.data || [],
    submissionsMap,
  }
}

/** Admin: reset a team's submission for a round. */
export async function resetTeamSubmissionAction(teamId, roundId) {
  const session = await getSession()
  requireAuth(session)

  const { error } = await resetTeamSubmission(teamId, roundId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

/** Admin: manually edit time and recalculate score. */
export async function editTeamTimeAction(teamId, roundId, newTimeSecs) {
  const session = await getSession()
  requireAuth(session)

  const newScore = Math.max(0, 10000 - parseInt(newTimeSecs, 10))
  const { error } = await editTeamTime(teamId, roundId, parseInt(newTimeSecs, 10), newScore)
  if (error) return { success: false, error: error.message }
  return { success: true }
}
