import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { resetTeamSubmission } from '@/lib/db/submissions.js';
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

    const { team_id, teamId } = body || {};
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

    const { data, error } = await resetTeamSubmission(targetTeamId, targetRoundId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to unlock team submission' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Team ${targetTeamId} submission field unlocked for round ${targetRoundId}`,
      submission: data
    });
  } catch (err) {
    console.error('Unlock team API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
