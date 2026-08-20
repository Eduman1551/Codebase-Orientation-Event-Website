'use server'

import { createTeam } from '../../lib/db/teams.js'
import { getActiveRound, getAllRounds, getRoundById } from '../../lib/db/rounds.js'
import { submitAnswer, finalizeTimedOutSubmission } from '../../lib/db/submissions.js'
import { getCluesForRoom } from '../../lib/db/clues.js'

const ROUND_DURATION_SECONDS = 5 * 60 // 5 minutes

const getScore = (timeTakenSeconds) => Math.max(0, 100 - Math.floor(timeTakenSeconds / 5))

function asUtcIso(value) {
  if (!value) return value
  const text = String(value)
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}Z`
}

/**
 * Register a new team. Requires team name + at least 1 member.
 */
export async function registerTeamAction(teamName, members) {
  if (!teamName?.trim()) throw new Error('Team name is required')
  const filled = (members || []).filter((m) => m?.trim())
  if (filled.length === 0) throw new Error('At least 1 crewmate name is required')

  const { data, error } = await createTeam(teamName.trim(), filled)
  if (error) throw new Error(error.message)

  return { teamId: data.id, teamName: data.team_name, members: data.member_names }
}

/**
 * Check if a round is currently active (unlocked).
 * Returns active flag + start time so client can sync timer.
 */
export async function checkRoundStatusAction() {
  const { data, error } = await getActiveRound()
  if (error || !data) return { active: false, roundId: null, roundStartTime: null }
  return {
    active: true,
    roundId: data.id,
    roundStartTime: asUtcIso(data.round_start_time),
    roundNumber: data.round_number,
  }
}

/** Fetch the clues for a room in the currently active round. */
export async function getRoomCluesAction(roomName) {
  if (!roomName) return { clues: [], roundId: null }

  const { data: round, error: roundError } = await getActiveRound()
  if (roundError || !round) return { clues: [], roundId: null }

  const { data, error } = await getCluesForRoom(round.id, roomName)
  if (error) throw new Error(error.message)

  return { clues: data || [], roundId: round.id }
}

/**
 * Submit an answer for a team.
 * - Verifies against active round expected_answer (case-insensitive).
 * - Rejects if round is over (> 5 min elapsed).
 * - Calculates server-authoritative time and score.
 * - Score starts at 100 and drops by 1 every 5 seconds.
 */
export async function submitAnswerAction(teamId, roundId, answer, clientStartTimeMs) {
  if (!teamId || !roundId || !answer?.trim()) {
    return { correct: false, message: 'Missing required fields.' }
  }

  const { data: round, error: roundError } = await getActiveRound()
  if (roundError || !round) {
    return { correct: false, message: 'No active round. The host may have locked it.' }
  }

  // Use server round_start_time as authoritative start
  const startMs = round.round_start_time
    ? new Date(round.round_start_time).getTime()
    : clientStartTimeMs || Date.now()

  const timeTakenSeconds = Math.floor((Date.now() - startMs) / 1000)

  // Reject if over 5 minutes
  if (timeTakenSeconds > ROUND_DURATION_SECONDS) {
    const { error: timeoutError } = await finalizeTimedOutSubmission(teamId, round.id, timeTakenSeconds)
    if (timeoutError) console.error('Timeout save error:', timeoutError.message)

    return {
      correct: false,
      timedOut: true,
      message: `Time's up! The 5-minute window has closed.`,
      timeTaken: timeTakenSeconds,
      score: 0,
    }
  }

  const isCorrect =
    answer.trim().toUpperCase() === (round.expected_answer || '').trim().toUpperCase()

  const score = isCorrect ? getScore(timeTakenSeconds) : 0

  const m = Math.floor(timeTakenSeconds / 60).toString().padStart(2, '0')
  const s = (timeTakenSeconds % 60).toString().padStart(2, '0')
  const timeString = `${m}:${s}`

  const { error: subError } = await submitAnswer(teamId, round.id, isCorrect, timeTakenSeconds, score)
  if (subError) console.error('Submission save error:', subError.message)

  return {
    correct: isCorrect,
    timeTaken: timeTakenSeconds,
    timeString,
    score,
    roundId: round.id,
    message: isCorrect
      ? `✅ Correct! Time: ${timeString} | Score: ${score}`
      : '❌ Wrong answer. Try again.',
  }
}

/** Persist a zero-score result when the five-minute window expires. */
export async function finalizeTimeoutAction(teamId, roundId) {
  if (!teamId || !roundId) return { success: false, score: 0, timeTaken: ROUND_DURATION_SECONDS }

  const { data: round, error } = await getRoundById(roundId)
  if (error || !round?.round_start_time) {
    return { success: false, score: 0, timeTaken: ROUND_DURATION_SECONDS }
  }

  const timeTaken = Math.max(
    ROUND_DURATION_SECONDS,
    Math.floor((Date.now() - new Date(round.round_start_time).getTime()) / 1000)
  )
  const { error: saveError } = await finalizeTimedOutSubmission(teamId, roundId, timeTaken)
  if (saveError) throw new Error(saveError.message)

  return { success: true, score: 0, timeTaken }
}

/**
 * Get remaining round time in seconds.
 * Returns secondsLeft (can be negative if over time).
 */
export async function getRoundTimeRemainingAction() {
  const { data, error } = await getActiveRound()
  if (error || !data || !data.round_start_time) {
    return { active: false, secondsLeft: 0 }
  }
  const elapsed = Math.floor((Date.now() - new Date(data.round_start_time).getTime()) / 1000)
  return {
    active: true,
    secondsLeft: ROUND_DURATION_SECONDS - elapsed,
    roundId: data.id,
    roundStartTime: asUtcIso(data.round_start_time),
  }
}
