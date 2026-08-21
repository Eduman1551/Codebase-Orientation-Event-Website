import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { startRound, getRoundByNumber, getAllRounds } from '@/lib/db/rounds.js';
import { seedRoundSubmissions } from '@/lib/db/submissions.js';

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

    const { round_number, round_id, expected_answer } = body || {};

    let targetRoundId = round_id;

    // Look up round by round_number if round_id not provided
    if (!targetRoundId && round_number) {
      const { data: roundByNum, error: lookupErr } = await getRoundByNumber(round_number);
      if (lookupErr || !roundByNum) {
        return NextResponse.json(
          { success: false, error: `Round ${round_number} not found in database` },
          { status: 404 }
        );
      }
      targetRoundId = roundByNum.id;
    }

    // If still no round_id, use the first round (round_number = 1)
    if (!targetRoundId) {
      const { data: roundOne } = await getRoundByNumber(1);
      if (!roundOne) {
        // Fallback: get first available round
        const { data: allRounds } = await getAllRounds();
        if (!allRounds || allRounds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No rounds found. Run seed first.' },
            { status: 404 }
          );
        }
        targetRoundId = allRounds[0].id;
      } else {
        targetRoundId = roundOne.id;
      }
    }

    // Always use round's own expected_answer from DB unless overridden
    const { data: round, error: startError } = await startRound(
      targetRoundId,
      expected_answer || undefined // pass undefined to keep DB value if not overriding
    );

    if (startError) {
      return NextResponse.json(
        { success: false, error: startError.message || 'Failed to start round' },
        { status: 400 }
      );
    }

    // Seed/reset pending submission rows for all existing teams
    await seedRoundSubmissions(targetRoundId);

    return NextResponse.json({
      success: true,
      message: `Round ${round?.round_number || targetRoundId} started successfully`,
      round
    });
  } catch (err) {
    console.error('Start round API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}


