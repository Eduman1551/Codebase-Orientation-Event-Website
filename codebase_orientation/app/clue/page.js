import { getActiveRound } from '../../lib/db/rounds'
import { getCluesForRoom } from '../../lib/db/clues'
import ClueForm from './ClueForm'

export const dynamic = 'force-dynamic'

export default async function CluePage({ searchParams }) {
    const { data: round, error: roundError } = await getActiveRound()
    if (roundError) return <p>Unable to load the active round.</p>

    const { data: clues, error } = await getCluesForRoom(round.id, round.room_name)
    if (error || !clues?.length) return <p>No clue is available for this round.</p>

    const params = await searchParams
    const requestedIndex = Number.parseInt(params?.clue || '0', 10)
    const clueIndex = Number.isNaN(requestedIndex)
        ? 0
        : Math.min(Math.max(requestedIndex, 0), clues.length - 1)

    return (
        <ClueForm
            clue={clues[clueIndex]}
            clueIndex={clueIndex}
            clueCount={clues.length}
            roundStartedAt={Date.parse(round.round_start_time)}
            roundEndsAt={Date.parse(round.round_start_time) + 5 * 60 * 1000}
        />
    )
}