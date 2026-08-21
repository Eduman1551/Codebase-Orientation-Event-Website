import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { startRound } from '@/lib/db/rounds.js';
import { seedRoundSubmissions } from '@/lib/db/submissions.js';
import supabase from '@/lib/supabase.js';

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

    let { round_id, expected_answer, answer } = body || {};
    const finalAnswer = (expected_answer || answer || 'ALIEN').trim();

    // If no round_id passed, check for existing round or create/use round 1
    if (!round_id) {
      const { data: existingRounds } = await supabase
        .from('rounds')
        .select('id')
        .order('id', { ascending: true })
        .limit(1);

      if (existingRounds && existingRounds.length > 0) {
        round_id = existingRounds[0].id;
      } else {
        const { data: newRound, error: createError } = await supabase
          .from('rounds')
          .insert([{ round_name: 'Round 1', is_locked: false, expected_answer: finalAnswer, round_start_time: new Date().toISOString() }])
          .select()
          .single();

        if (createError) {
          return NextResponse.json({ success: false, error: createError.message }, { status: 500 });
        }

        await seedRoundSubmissions(newRound.id);
        return NextResponse.json({
          success: true,
          message: 'Round created and started successfully',
          round: newRound
        });
      }
    }

    const { data: round, error: startError } = await startRound(round_id, finalAnswer);

    if (startError) {
      return NextResponse.json(
        { success: false, error: startError.message || 'Failed to start round' },
        { status: 400 }
      );
    }

    // Seed pending submission rows for all existing teams
    await seedRoundSubmissions(round_id);

    return NextResponse.json({
      success: true,
      message: `Round ${round_id} started successfully`,
      round
    });
  } catch (err) {
    console.error('Start round API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
