'use server'

import { cookies } from 'next/headers'
import { createTeam } from '../../lib/db/teams'
import { getActiveRound } from '../../lib/db/rounds'
import { seedRoundSubmissions, submitAnswer } from '../../lib/db/submissions'

const TEAM_COOKIE = 'team_id'

export async function register(formData) {
    const teamName = String(formData.get('teamName') || '').trim()
    const memberNames = ['memName1', 'memName2', 'memName3', 'memName4']
        .map((name) => String(formData.get(name) || '').trim())
        .filter(Boolean)

    if (!teamName || memberNames.length === 0) {
        return { error: 'A team name and at least one member are required.' }
    }

    const { data, error } = await createTeam(teamName, memberNames)
    if (error) return { error: error.message }

    const { data: activeRound } = await getActiveRound()
    if (activeRound) await seedRoundSubmissions(activeRound.id)

    const cookieStore = await cookies()
    cookieStore.set(TEAM_COOKIE, String(data.id), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60,
        path: '/'
    })

    return { team: data }
}

export async function checkAns(startTime, submittedAt, answer) {
    const teamId = (await cookies()).get(TEAM_COOKIE)?.value
    if (!teamId) return { error: 'Register your team before submitting an answer.' }

    const { data: round, error: roundError } = await getActiveRound()
    if (roundError) return { error: roundError.message }

    const roundStartedAt = Date.parse(round.round_start_time)
    if (!round.round_start_time || Number.isNaN(roundStartedAt)) {
        return { error: 'This round has not started yet.' }
    }
    if (submittedAt - roundStartedAt >= 5 * 60 * 1000) {
        return { expired: true, error: 'This round has ended.' }
    }

    const isCorrect = String(round.expected_answer || '').trim().toLowerCase() ===
        String(answer || '').trim().toLowerCase()
    const timeTaken = Math.max(0, Math.round((submittedAt - roundStartedAt) / 1000))
    if (!isCorrect) return { correct: false, message: 'Wrong answer. Try again.' }

    const score = Math.max(1, 100 - timeTaken)
    const { data, error } = await submitAnswer(teamId, round.id, true, timeTaken, score)

    if (error) return { error: error.message }
    if (!data?.length) return { correct: true, message: 'Already submitted correctly.' }
    return { correct: isCorrect, message: isCorrect ? 'Correct!' : 'Wrong answer. Try again.' }
}
