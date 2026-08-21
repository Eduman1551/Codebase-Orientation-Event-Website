import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { resetRoundForLobby, getLatestRound, getAllRounds } from '@/lib/db/rounds.js';
import { resetAllSubmissionsForRound } from '@/lib/db/submissions.js';

export async function POST(request) {
  try {
    let body = {};
    try { body = await request.json(); } catch {}

    const isAuthorized = await verifyAdmin(request, body);
    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Find all rounds
    const { data: allRounds } = await getAllRounds();
    
    if (!allRounds || allRounds.length === 0) {
      return NextResponse.json({ success: false, error: 'No rounds found' }, { status: 400 });
    }

    for (const round of allRounds) {
      // Lock all rounds and clear their start times
      await resetRoundForLobby(round.id);
      // Reset all team submissions for this round
      await resetAllSubmissionsForRound(round.id);
    }

    return NextResponse.json({
      success: true,
      message: `System fully reset to lobby. All rounds locked and submissions cleared.`,
    });
  } catch (err) {
    console.error('Reset to lobby error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
