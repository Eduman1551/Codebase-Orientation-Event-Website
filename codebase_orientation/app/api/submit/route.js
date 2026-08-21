import { NextResponse } from 'next/server';
import { getActiveRound, getRoundById } from '@/lib/db/rounds.js';
import { submitAnswer } from '@/lib/db/submissions.js';
import supabase from '@/lib/supabase.js';

function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { answer, round_id, score = 100 } = body || {};
    const team_id =
      body?.team_id ||
      body?.teamId ||
      request.cookies.get('team_id')?.value ||
      request.headers.get('x-team-id');

    if (!team_id) {
      return NextResponse.json(
        { success: false, error: 'Team ID is required to submit an answer' },
        { status: 400 }
      );
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json(
        { success: false, error: 'Answer string is required' },
        { status: 400 }
      );
    }

    // 1. Fetch the target round
    let round = null;
    if (round_id) {
      const { data, error } = await getRoundById(round_id);
      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'Specified round not found' },
          { status: 404 }
        );
      }
      round = data;
    } else {
      const { data, error } = await getActiveRound();
      if (error || !data) {
        return NextResponse.json(
          { success: false, error: 'No active round in progress' },
          { status: 400 }
        );
      }
      round = data;
    }

    // 2. Reject if round is locked
    if (round.is_locked) {
      return NextResponse.json(
        {
          success: false,
          error: 'This round is locked. Submissions are no longer accepted.',
          is_locked: true
        },
        { status: 403 }
      );
    }

    // 3. Check existing submission for this team & round
    const { data: existingSubmission } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', team_id)
      .eq('round_id', round.id)
      .maybeSingle();

    if (existingSubmission && existingSubmission.is_correct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Team has already completed this round with a correct submission.',
          alreadySubmitted: true,
          time_taken: existingSubmission.time_taken,
          timeString: formatTime(existingSubmission.time_taken || 0)
        },
        { status: 409 }
      );
    }

    // If no row exists yet (e.g. team registered after round started), seed a pending row
    if (!existingSubmission) {
      await supabase
        .from('submissions')
        .insert([{ team_id, round_id: round.id, is_correct: false }]);
    }

    // 4. Calculate server-side elapsed time strictly (anti-tamper)
    const startTimestamp = round.round_start_time ? new Date(round.round_start_time).getTime() : Date.now();
    const timeTaken = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
    const timeString = formatTime(timeTaken);

    // 5. Verify answer against expected answer
    const expected = (round.expected_answer || '').trim().toUpperCase();
    const submitted = answer.trim().toUpperCase();
    const isCorrect = expected.length > 0 && submitted === expected;

    if (!isCorrect) {
      return NextResponse.json({
        success: true,
        correct: false,
        message: 'ACCESS DENIED: Incorrect passcode.'
      });
    }

    // 6. Submit correct answer atomically
    const { data: updatedSubmission, error: updateError } = await submitAnswer(
      team_id,
      round.id,
      true,
      timeTaken,
      score
    );

    if (updateError || !updatedSubmission || updatedSubmission.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Submission already recorded for this team.',
          alreadySubmitted: true
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      correct: true,
      time_taken: timeTaken,
      timeString,
      score,
      message: 'OVERRIDE ACCEPTED: Correct code submitted!',
      submission: updatedSubmission[0] || updatedSubmission
    });
  } catch (err) {
    console.error('Submit API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
