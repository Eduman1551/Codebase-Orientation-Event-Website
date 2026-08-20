import { getSupabase } from '../supabase.js'

export async function createTeam(team_name, member_names) {
  return getSupabase()
    .from('teams')
    .insert([{ team_name, member_names }])
    .select()
    .single()
}

export async function getTeamById(id) {
  return getSupabase().from('teams').select('*').eq('id', id).single()
}

export async function getAllTeams() {
  return getSupabase()
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true })
}
