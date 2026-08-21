import supabase from '../supabase.js'

export async function seedRoundSubmissions(round_id) {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id')
  if (teamsError) return { data: null, error: teamsError }

  // Upsert so re-seeding doesn't create duplicates
  const rows = teams.map(t => ({ team_id: t.id, round_id, is_correct: false }))
  return supabase
    .from('submissions')
    .upsert(rows, { onConflict: 'team_id,round_id', ignoreDuplicates: false })
    .select()
}

export async function submitAnswer(
  team_id,
  round_id,
  is_correct,
  time_taken,
  score
) {
  return supabase
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
  return supabase
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

export async function resetAllSubmissionsForRound(round_id) {
  return supabase
    .from('submissions')
    .update({
      is_correct: false,
      time_taken: null,
      score: null,
      submitted_at: null
    })
    .eq('round_id', round_id)
    .select()
}

export async function assignDNFSubmissions(round_id, round_duration = 300) {
  return supabase
    .from('submissions')
    .update({
      time_taken: round_duration,
      is_correct: false,
    })
    .eq('round_id', round_id)
    .eq('is_correct', false)
    .is('time_taken', null)
    .select()
}

export async function editTeamTime(team_id, round_id, new_time, new_score) {
  const updates = {}
  if (new_time !== undefined && new_time !== null) updates.time_taken = new_time
  if (new_score !== undefined && new_score !== null) updates.score = new_score
  
  if (Object.keys(updates).length === 0) return { data: null, error: new Error("No fields to update") }

  return supabase
    .from('submissions')
    .update(updates)
    .eq('team_id', team_id)
    .eq('round_id', round_id)
    .select()
}

export async function getLeaderboard() {
  const { data, error } = await supabase
    .from('submissions')
    .select('team_id, score, time_taken, teams(team_name, member_names)')
    .not('time_taken', 'is', null) // Include both completed and DNF

  if (error) return { data: null, error }

  const totals = {}
  for (const row of data) {
    if (!totals[row.team_id]) {
      let mNames = row.teams.member_names;
      if (typeof mNames === 'string') {
        try { mNames = JSON.parse(mNames); } catch(e) { mNames = [mNames]; }
      }
      if (!Array.isArray(mNames)) {
        mNames = mNames ? [mNames] : [];
      }
      
      totals[row.team_id] = {
        team_name: row.teams.team_name,
        member_names: mNames,
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

