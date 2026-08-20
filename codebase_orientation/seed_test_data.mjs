import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: './.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local')
}

const supabase = createClient(url, serviceRoleKey)

const TEST_TEAMS = [
  { team_name: 'TEST_ORBIT', member_names: ['Ava Orbit', 'Leo Orbit'] },
  { team_name: 'TEST_NEBULA', member_names: ['Mia Nebula', 'Noah Nebula'] },
  { team_name: 'TEST_COMET', member_names: ['Ivy Comet', 'Owen Comet'] },
]

const ROUND_DATA = [
  {
    round_number: 1,
    expected_answer: 'ORBIT',
    clues: {
      engine: ['Reactor|R1 Engine clue: Count the crew and check the reactor.', 'Valve|R1 Engine clue: The valve points toward the answer.', 'Toolbox|R1 Engine clue: The toolbox contains a map of the orbit.'],
      electrical: ['Fuse Box|R1 Electrical clue: The green wire carries the signal.', 'Vent|R1 Electrical clue: The vent sensor detects orbital movement.', 'Wiring|R1 Electrical clue: The wiring diagram forms a circle.'],
      medbay: ['Scanner|R1 MedBay clue: The scanner displays a circular path.', 'Samples|R1 MedBay clue: The sample rotates under the microscope.', 'MedKit|R1 MedBay clue: The medical kit contains a ring-shaped mark.'],
      control: ['Security|R1 Control clue: Security footage shows an orbiting object.', 'Navigation|R1 Control clue: Navigation traces a circular route.', 'Comms|R1 Control clue: The transmission repeats a word for a path around a body.'],
    },
  },
  {
    round_number: 2,
    expected_answer: 'NEBULA',
    clues: {
      engine: ['Reactor|R2 Engine clue: A cloud of dust blocks the engine view.', 'Valve|R2 Engine clue: The valve points toward a glowing cloud.', 'Toolbox|R2 Engine clue: The toolbox contains a dust-covered chart.'],
      electrical: ['Fuse Box|R2 Electrical clue: The fuse box glows through the dust.', 'Vent|R2 Electrical clue: The vent sensor detects a glowing cloud.', 'Wiring|R2 Electrical clue: The wiring disappears into the cloud.'],
      medbay: ['Scanner|R2 MedBay clue: The scanner sees a colorful cloud.', 'Samples|R2 MedBay clue: The sample contains colorful space dust.', 'MedKit|R2 MedBay clue: The kit is coated in nebula particles.'],
      control: ['Security|R2 Control clue: Security footage shows a cloud crossing the ship.', 'Navigation|R2 Control clue: Navigation reports a nebula ahead.', 'Comms|R2 Control clue: The transmission mentions a stellar cloud.'],
    },
  },
  {
    round_number: 3,
    expected_answer: 'COMET',
    clues: {
      engine: ['Reactor|R3 Engine clue: A fast object passes the reactor window.', 'Valve|R3 Engine clue: The valve is vibrating from a nearby flyby.', 'Toolbox|R3 Engine clue: The toolbox contains ice from the passing object.'],
      electrical: ['Fuse Box|R3 Electrical clue: The fuse box flashes as the object passes.', 'Vent|R3 Electrical clue: The vent records a long glowing tail.', 'Wiring|R3 Electrical clue: The cable map resembles a comet tail.'],
      medbay: ['Scanner|R3 MedBay clue: The scanner tracks a frozen visitor.', 'Samples|R3 MedBay clue: The sample contains ancient ice.', 'MedKit|R3 MedBay clue: The kit has debris from a fast flyby.'],
      control: ['Security|R3 Control clue: Security footage shows a bright object.', 'Navigation|R3 Control clue: Navigation predicts a fast flyby.', 'Comms|R3 Control clue: The transmission repeats a word for a flying icy body.'],
    },
  },
]

async function requireResult(label, result) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`)
  return result.data
}

async function findOrCreateTeam(team) {
  const existing = await requireResult(
    `Find ${team.team_name}`,
    await supabase.from('teams').select('*').eq('team_name', team.team_name).maybeSingle()
  )
  if (existing) return existing

  return requireResult(
    `Create ${team.team_name}`,
    await supabase.from('teams').insert(team).select().single()
  )
}

async function findOrCreateRound(roundData) {
  let round = await requireResult(
    `Find Round ${roundData.round_number}`,
    await supabase.from('rounds').select('*').eq('round_number', roundData.round_number).maybeSingle()
  )

  if (!round) {
    round = await requireResult(
      `Create Round ${roundData.round_number}`,
      await supabase
        .from('rounds')
        .insert({
          round_number: roundData.round_number,
          expected_answer: roundData.expected_answer,
          is_locked: roundData.round_number !== 1,
          round_start_time: roundData.round_number === 1 ? new Date().toISOString() : null,
        })
        .select()
        .single()
    )
  } else {
    round = await requireResult(
      `Reset Round ${roundData.round_number}`,
      await supabase
        .from('rounds')
        .update({
          expected_answer: roundData.expected_answer,
          is_locked: roundData.round_number !== 1,
          round_start_time: roundData.round_number === 1 ? new Date().toISOString() : null,
        })
        .eq('id', round.id)
        .select()
        .single()
    )
  }

  return round
}

async function seedClues(round, roundData) {
  for (const [roomName, objects] of Object.entries(roundData.clues)) {
    for (const object_name of objects) {
      const [, clue_content = object_name] = object_name.split('|')
      const existing = await requireResult(
        `Find clue ${round.round_number}/${roomName}`,
        await supabase
          .from('clues')
          .select('id')
          .eq('round_id', round.id)
          .eq('room_name', roomName)
          .eq('object_name', object_name)
          .maybeSingle()
      )

      if (!existing) {
        await requireResult(
          `Create clue ${round.round_number}/${roomName}`,
          await supabase
            .from('clues')
            .insert({ round_id: round.id, room_name: roomName, object_name, clue_content })
        )
      }
    }
  }
}

async function findOrCreateSubmission(teamId, roundId, values) {
  const existing = await requireResult(
    'Find submission',
    await supabase.from('submissions').select('id').eq('team_id', teamId).eq('round_id', roundId).maybeSingle()
  )

  if (existing) {
    return requireResult(
      'Update submission',
      await supabase.from('submissions').update(values).eq('id', existing.id).select().single()
    )
  }

  return requireResult(
    'Create submission',
    await supabase.from('submissions').insert({ team_id: teamId, round_id: roundId, ...values }).select().single()
  )
}

async function seed() {
  const teams = []
  for (const team of TEST_TEAMS) teams.push(await findOrCreateTeam(team))

  const rounds = []
  for (const roundData of ROUND_DATA) {
    const round = await findOrCreateRound(roundData)
    rounds.push(round)
    await seedClues(round, roundData)
  }

  const [roundOne, roundTwo, roundThree] = rounds
  await findOrCreateSubmission(teams[0].id, roundOne.id, {
    is_correct: true,
    time_taken: 35,
    score: 93,
    submitted_at: new Date(Date.now() - 35_000).toISOString(),
  })
  await findOrCreateSubmission(teams[1].id, roundOne.id, {
    is_correct: false,
    time_taken: 18,
    score: 0,
    submitted_at: new Date(Date.now() - 18_000).toISOString(),
  })
  await findOrCreateSubmission(teams[2].id, roundOne.id, {
    is_correct: false,
    time_taken: 300,
    score: 0,
    submitted_at: new Date(Date.now() - 300_000).toISOString(),
  })

  for (const team of teams) {
    await findOrCreateSubmission(team.id, roundTwo.id, {
      is_correct: false,
      time_taken: null,
      score: null,
      submitted_at: null,
    })
    await findOrCreateSubmission(team.id, roundThree.id, {
      is_correct: false,
      time_taken: null,
      score: null,
      submitted_at: null,
    })
  }

  console.log('Test data is ready.')
  console.log(`Teams: ${teams.map((team) => team.team_name).join(', ')}`)
  console.log(`Rounds: ${rounds.map((round) => `Round ${round.round_number}`).join(', ')}`)
  console.log('Round 1 is active with answer ORBIT.')
  console.log('Leader for each team is the first member name.')
}

seed().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
