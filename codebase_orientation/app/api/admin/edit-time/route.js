import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { editTeamTime } from '@/lib/db/submissions.js';
import { getActiveRound } from '@/lib/db/rounds.js';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body
    }

    const isAuthorized = await verifyAdmin(request, body);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const { team_id, teamId, new_time, new_score, time, score } = body || {};
    let { round_id, roundId } = body || {};

    const targetTeamId = team_id || teamId;
    if (!targetTeamId) {
      return NextResponse.json({ success: false, error: 'team_id is required' }, { status: 400 });
    }

    let targetRoundId = round_id || roundId;
    if (!targetRoundId) {
      const { data: activeRound } = await getActiveRound();
      if (activeRound) {
        targetRoundId = activeRound.id;
      }
    }

    if (!targetRoundId) {
      return NextResponse.json(
        { success: false, error: 'round_id is required or an active round must exist' },
        { status: 400 }
      );
    }

    const rawTime = new_time !== undefined ? new_time : time;
    const rawScore = new_score !== undefined ? new_score : score;

    if (rawTime === undefined && rawScore === undefined) {
      return NextResponse.json(
        { success: false, error: 'Either new_time or new_score must be provided' },
        { status: 400 }
      );
    }

    const finalTime = rawTime !== undefined ? Number(rawTime) : null;
    const finalScore = rawScore !== undefined ? Number(rawScore) : null;

    const { data, error } = await editTeamTime(targetTeamId, targetRoundId, finalTime, finalScore);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to edit team time' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Team ${targetTeamId} time updated to ${finalTime}s, score to ${finalScore}`,
      submission: data
    });
  } catch (err) {
    console.error('Edit time API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
