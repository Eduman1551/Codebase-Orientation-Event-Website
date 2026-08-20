import supabase from '../supabase.js'

/** Returns the active (unlocked) round, or null if none. */
export async function getActiveRound() {
  return supabase
    .from('rounds')
    .select('*')
    .eq('is_locked', false)
    .order('round_number', { ascending: true })
    .limit(1)
    .maybeSingle()
}

export async function getRoundById(id) {
  return supabase.from('rounds').select('*').eq('id', id).single()
}

/**
 * Start a round: unlock it, record the answer and start time.
 */
export async function startRound(round_id, expected_answer) {
  return supabase
    .from('rounds')
    .update({
      is_locked: false,
      round_start_time: new Date().toISOString(),
      expected_answer,
    })
    .eq('id', round_id)
    .select()
    .single()
}

/** Lock a round so no more submissions are accepted. */
export async function lockRound(round_id) {
  return supabase
    .from('rounds')
    .update({ is_locked: true })
    .eq('id', round_id)
    .select()
    .single()
}

/** Get all rounds ordered by round_number */
export async function getAllRounds() {
  return supabase
    .from('rounds')
    .select('*')
    .order('round_number', { ascending: true })
}
