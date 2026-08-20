import supabase from '../supabase.js'

export async function getCluesForRoom(round_id, room_name) {
  return supabase
    .from('clues')
    .select('*')
    .eq('round_id', round_id)
    .eq('room_name', room_name)
}
