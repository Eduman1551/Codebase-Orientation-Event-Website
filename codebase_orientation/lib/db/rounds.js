import supabase from '../supabase.js'

export async function getActiveRound() {
  return supabase
    .from('rounds')
    .select('*')
    .eq('is_locked', false)
    .not('round_start_time', 'is', null)
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function getRoundById(id) {
  return supabase.from('rounds').select('*').eq('id', id).single()
}

export async function getRoundByNumber(round_number) {
  return supabase.from('rounds').select('*').eq('round_number', round_number).single()
}

export async function getAllRounds() {
  return supabase.from('rounds').select('*').order('round_number', { ascending: true })
}

export async function getLatestRound() {
  // Gets the most recently started round (locked or not) for between-rounds detection
  return supabase
    .from('rounds')
    .select('*')
    .not('round_start_time', 'is', null)
    .order('round_number', { ascending: false })
    .limit(1)
    .maybeSingle()
}

export async function startRound(round_id, expected_answer) {
  const updatePayload = {
    is_locked: false,
    round_start_time: new Date().toISOString(),
  };
  // Only overwrite expected_answer if explicitly provided
  if (expected_answer !== undefined && expected_answer !== null) {
    updatePayload.expected_answer = expected_answer;
  }
  return supabase
    .from('rounds')
    .update(updatePayload)
    .eq('id', round_id)
    .select()
    .single();
}


export async function lockRound(round_id) {
  return supabase
    .from('rounds')
    .update({ is_locked: true })
    .eq('id', round_id)
    .select()
    .single()
}

export async function resetRoundForLobby(round_id) {
  // Lock and clear start time so status API returns 'waiting' (full lobby reset)
  return supabase
    .from('rounds')
    .update({ is_locked: true, round_start_time: null })
    .eq('id', round_id)
    .select()
    .single()
}
