import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: './.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Clues per room per round
// object_name = "ButtonLabel|Clue text shown on click"
const CLUES_BY_ROOM = {
  engine: [
    { object_name: 'Reactor|CLUE 1: The first digit of the password is the number of crewmates.' },
    { object_name: 'Valve|CLUE 2: The saboteur was last seen in Electrical.' },
    { object_name: 'Toolbox|CLUE 3: A wrench is missing from the lower deck.' },
  ],
  electrical: [
    { object_name: 'Fuse Box|CLUE 7: The lights were sabotaged exactly 42 seconds after the mission started.' },
    { object_name: 'Vent|CLUE 8: There are footprints leading from the vent to the Engine room.' },
    { object_name: 'Wiring|CLUE 9: The RED wire was cut first. But the BLUE wire caused the outage.' },
  ],
  medbay: [
    { object_name: "Scanner|CLUE 10: The bioscanner confirms the imposter's height is exactly 5'9\"." },
    { object_name: 'Samples|CLUE 11: The blood sample turned green. It matches an alien DNA signature.' },
    { object_name: 'MedKit|CLUE 12: A scalpel is missing from the emergency kit.' },
  ],
  control: [
    { object_name: 'Security|CLUE 4: The cameras show someone walking towards the Medical bay.' },
    { object_name: 'Navigation|CLUE 5: The ship is off course by 45 degrees.' },
    { object_name: "Comms|CLUE 6: A garbled transmission repeats the word 'Oxygen'." },
  ],
}

async function seed() {
  // Get all rounds
  const { data: rounds, error: rErr } = await supabase.from('rounds').select('id, round_number').order('round_number')
  if (rErr) { console.error('Error fetching rounds:', rErr.message); return }
  console.log(`Found ${rounds.length} round(s)`)

  for (const round of rounds) {
    console.log(`\nSeeding clues for Round ${round.round_number} (id: ${round.id})`)

    // Check if clues already exist for this round
    const { data: existing } = await supabase.from('clues').select('id').eq('round_id', round.id)
    if (existing?.length > 0) {
      console.log(`  → ${existing.length} clues already exist, skipping.`)
      continue
    }

    for (const [room, clues] of Object.entries(CLUES_BY_ROOM)) {
      const rows = clues.map(c => {
        const [, clue_content = c.object_name] = c.object_name.split('|')
        return { round_id: round.id, room_name: room, object_name: c.object_name, clue_content }
      })
      const { data, error } = await supabase.from('clues').insert(rows).select()
      if (error) {
        console.error(`  ✗ ${room}: ${error.message}`)
      } else {
        console.log(`  ✓ ${room}: inserted ${data.length} clues`)
      }
    }
  }

  // Verify
  const { data: allClues } = await supabase.from('clues').select('*').order('room_name')
  console.log(`\nTotal clues in DB: ${allClues?.length}`)
  allClues?.forEach(c => console.log(`  [${c.room_name}] ${c.object_name.split('|')[0]}`))
}

seed().catch(console.error)
