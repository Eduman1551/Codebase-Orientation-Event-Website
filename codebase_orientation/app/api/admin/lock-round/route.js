import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { lockRound, getActiveRound } from '@/lib/db/rounds.js';

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

    let { round_id } = body || {};

    if (!round_id) {
      const { data: activeRound } = await getActiveRound();
      if (!activeRound) {
        return NextResponse.json(
          { success: false, error: 'No active round found to lock' },
          { status: 400 }
        );
      }
      round_id = activeRound.id;
    }

    const { data: round, error } = await lockRound(round_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to lock round' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Round ${round_id} locked successfully`,
      round
    });
  } catch (err) {
    console.error('Lock round API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
