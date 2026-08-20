'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { checkAns } from '../actions/useraction'

export default function ClueForm({ clue, clueIndex, clueCount, roundStartedAt, roundEndsAt }) {
    const [answer, setAnswer] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [message, setMessage] = useState('')
    const [range, setRange] = useState(100)
    const router = useRouter()
    const submittedAtRef = useRef(null)

    useEffect(() => {
        const nextClue = Math.min(clueIndex + 1, clueCount - 1)
        const refresh = setTimeout(() => router.replace(`/clue?clue=${nextClue}`), 30 * 1000)
        const timeout = setTimeout(() => router.replace('/answer'), Math.max(0, roundEndsAt - Date.now()))
        const interval = setInterval(() => setRange((value) => Math.max(0, value - 1)), 3000)
        return () => { clearTimeout(refresh); clearTimeout(timeout); clearInterval(interval) }
    }, [router, roundEndsAt, clueIndex, clueCount])

    async function handleSubmit() {
        if (!answer.trim() || submitted) return
        const submittedAt = Date.now()
        submittedAtRef.current = submittedAt
        const result = await checkAns(roundStartedAt, submittedAt, answer)
        if (result.expired) router.replace('/answer')
        else if (result.error) setMessage(result.error)
        else {
            setMessage(result.message)
            setSubmitted(Boolean(result.correct))
        }
    }

    return (
        <main>
            <p>{clue.clue || clue.question || clue.text}</p>
            <input type="text" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={submitted} />
            <input type="range" min={0} max={100} value={range} readOnly />
            <button onClick={handleSubmit} disabled={submitted || !answer.trim()}>Submit</button>
            <p role="status">{message}</p>
        </main>
    )
}