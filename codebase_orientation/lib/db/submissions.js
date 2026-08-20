import { getSupabase } from '../supabase.js'

export async function seedRoundSubmissions(round_id) {
  const { data: teams, error: teamsError } = await getSupabase()
    .from('teams')
    .select('id')
  if (teamsError) return { data: null, error: teamsError }

  const { data: existing, error: existingError } = await getSupabase()
    .from('submissions')
    .select('team_id')
    .eq('round_id', round_id)
  if (existingError) return { data: null, error: existingError }

  const existingTeamIds = new Set(existing.map(row => String(row.team_id)))
  const rows = teams
    .filter(team => !existingTeamIds.has(String(team.id)))
    .map(team => ({ team_id: team.id, round_id, is_correct: false, score: 0 }))
  if (!rows.length) return { data: [], error: null }
  return getSupabase().from('submissions').insert(rows).select()
}

export async function submitAnswer(
  team_id,
  round_id,
  is_correct,
  time_taken,
  score
) {
  return getSupabase()
    .from('submissions')
    .update({
      is_correct,
      time_taken,
      score,
      submitted_at: new Date().toISOString()
    })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .eq('is_correct', false)
    .select()
}

export async function resetTeamSubmission(team_id, round_id) {
  return getSupabase()
    .from('submissions')
    .update({
      is_correct: false,
      time_taken: null,
      score: null,
      submitted_at: null
    })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

export async function editTeamTime(team_id, round_id, new_time, new_score) {
  return getSupabase()
    .from('submissions')
    .update({ time_taken: new_time, score: new_score })
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

export async function getLeaderboard() {
  const { data, error } = await getSupabase()
    .from('submissions')
    .select('team_id, score, time_taken, teams(team_name)')

  if (error) return { data: null, error }

  const totals = {}
  for (const row of data) {
    if (!totals[row.team_id]) {
      totals[row.team_id] = {
        team_name: row.teams.team_name,
        total_score: 0,
        total_time: 0
      }
    }
    totals[row.team_id].total_score += row.score || 0
    totals[row.team_id].total_time += row.time_taken || 0
  }

  const leaderboard = Object.values(totals).sort(
    (a, b) => a.total_time - b.total_time
  )
  return { data: leaderboard, error: null }
}
