import { getSupabase } from '../supabase.js'

export async function getCluesForRoom(round_id, room_name) {
  return getSupabase()
    .from('clues')
    .select('*')
    .eq('round_id', round_id)
    .eq('room_name', room_name)
    .order('created_at', { ascending: true })
}
