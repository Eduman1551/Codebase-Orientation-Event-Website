import supabase from '../supabase.js'

export async function getActiveRound() {
  return supabase.from('rounds').select('*').eq('is_locked', false).single()
}

export async function getRoundById(id) {
  return supabase.from('rounds').select('*').eq('id', id).single()
}

export async function startRound(round_id, expected_answer) {
  return supabase
    .from('rounds')
    .update({
      is_locked: false,
      round_start_time: new Date().toISOString(),
      expected_answer
    })
    .eq('id', round_id)
    .select()
    .single()
}

export async function lockRound(round_id) {
  return supabase
    .from('rounds')
    .update({ is_locked: true })
    .eq('id', round_id)
    .select()
    .single()
}
