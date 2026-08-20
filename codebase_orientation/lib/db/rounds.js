import { getSupabase } from '../supabase.js'

export async function getActiveRound() {
  return getSupabase().from('rounds').select('*').eq('is_locked', false).single()
}

export async function getLatestRound() {
  return getSupabase()
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function getRoundById(id) {
  return getSupabase().from('rounds').select('*').eq('id', id).single()
}

export async function startRound(round_id, expected_answer) {
  return getSupabase()
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
  return getSupabase()
    .from('rounds')
    .update({ is_locked: true })
    .eq('id', round_id)
    .select()
    .single()
}
