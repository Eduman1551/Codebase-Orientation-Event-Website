import supabase from '../supabase.js'

/**
 * Create a new team and return it.
 * member_names is stored as a JSON array in the DB.
 */
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

export async function getTeamByName(team_name) {
  return supabase.from('teams').select('*').eq('team_name', team_name).maybeSingle()
}

export async function getAllTeams() {
  return supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true })
}
