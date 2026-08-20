import supabase from '../supabase.js'

/**
 * Fetch clues for a given room from the database.
 * The clues table has: id, round_id, room_name, object_name
 * Clue text is stored in object_name (or returned as fallback).
 */
export async function getCluesForRoom(round_id, room_name) {
  return supabase
    .from('clues')
    .select('*')
    .eq('round_id', round_id)
    .eq('room_name', room_name)
}

/**
 * Insert a clue for a given round and room.
 */
export async function insertClue(round_id, room_name, object_name) {
  return supabase
    .from('clues')
    .insert([{ round_id, room_name, object_name }])
    .select()
    .single()
}
