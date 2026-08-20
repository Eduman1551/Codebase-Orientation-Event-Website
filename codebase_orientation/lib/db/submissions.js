import supabase from '../supabase.js'

/** Seed one submission row per team for a given round. */
export async function seedRoundSubmissions(round_id) {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id')
  if (teamsError) return { data: null, error: teamsError }

  const rows = teams.map((t) => ({
    team_id: t.id,
    round_id,
    is_correct: false,
  }))
  return supabase.from('submissions').insert(rows).select()
}

/** Record a team's answer result. */
export async function submitAnswer(team_id, round_id, is_correct, time_taken, score) {
  return supabase
    .from('submissions')
    .update({
      is_correct,
      time_taken,
      score,
      submitted_at: new Date().toISOString(),
    })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

/** Record the final zero-score result after a round expires. */
export async function finalizeTimedOutSubmission(team_id, round_id, time_taken) {
  return supabase
    .from('submissions')
    .update({
      is_correct: false,
      time_taken,
      score: 0,
      submitted_at: new Date().toISOString(),
    })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

/** Reset a team's submission so they can try again. */
export async function resetTeamSubmission(team_id, round_id) {
  return supabase
    .from('submissions')
    .update({
      is_correct: false,
      time_taken: null,
      score: null,
      submitted_at: null,
    })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

/** Admin: manually edit a team's time and score. */
export async function editTeamTime(team_id, round_id, new_time, new_score) {
  return supabase
    .from('submissions')
    .update({ time_taken: new_time, score: new_score })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

/** Get all submissions for a round, joined with team names. */
export async function getSubmissionsForRound(round_id) {
  return supabase
    .from('submissions')
    .select('*, teams(team_name, member_names)')
    .eq('round_id', round_id)
    .order('time_taken', { ascending: true, nullsFirst: false })
}

/** Aggregate leaderboard across all rounds. */
export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('submissions')
    .select('team_id, score, time_taken, is_correct, teams(team_name)')

  if (error) return { data: null, error }

  const totals = {}
  for (const row of data) {
    if (!totals[row.team_id]) {
      totals[row.team_id] = {
        team_name: row.teams?.team_name ?? 'Unknown',
        total_score: 0,
        total_time: 0,
        rounds_completed: 0,
      }
    }
    totals[row.team_id].total_score += row.score || 0
    totals[row.team_id].total_time += row.time_taken || 0
    if (row.is_correct) totals[row.team_id].rounds_completed += 1
  }

  const leaderboard = Object.values(totals).sort(
    (a, b) => b.total_score - a.total_score || a.total_time - b.total_time
  )
  return { data: leaderboard, error: null }
}
