import supabase from '../supabase.js'

export async function createTeam(team_name, member_names) {
  return supabase
    .from('teams')
    .insert([{ team_name, member_names }])
    .select()
    .single()
}

export async function getTeamById(id) {
  return supabase.from('teams').select('*').eq('id', id).single()
}

export async function getAllTeams() {
  return supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true })
}

export async function deleteTeam(team_id) {
  // First, delete submissions for this team to satisfy foreign key constraints
  const { error: subError } = await supabase
    .from('submissions')
    .delete()
    .eq('team_id', team_id)

  if (subError) return { data: null, error: subError }

  // Then, delete the team
  return supabase
    .from('teams')
    .delete()
    .eq('id', team_id)
    .select()
    .single()
}
