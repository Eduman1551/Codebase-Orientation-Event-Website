import { NextResponse } from 'next/server';
import { getActiveRound } from '@/lib/db/rounds.js';
import supabase from '@/lib/supabase.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId =
      searchParams.get('team_id') ||
      request.cookies.get('team_id')?.value ||
      request.headers.get('x-team-id');

    const { data: round, error } = await getActiveRound();

    if (error || !round || round.is_locked) {
      return NextResponse.json({
        success: true,
        active: false,
        gameState: 'waiting',
        round: null,
        message: 'No active round in progress'
      });
    }

    // Calculate server-side elapsed time
    const startTimestamp = round.round_start_time ? new Date(round.round_start_time).getTime() : Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));

    let submissionInfo = null;
    if (teamId) {
      const { data: submission } = await supabase
        .from('submissions')
        .select('is_correct, time_taken, score, submitted_at')
        .eq('team_id', teamId)
        .eq('round_id', round.id)
        .maybeSingle();

      if (submission) {
        submissionInfo = submission;
      }
    }

    // Exclude expected_answer from public response
    const publicRound = {
      id: round.id,
      round_name: round.round_name || `Round ${round.id}`,
      round_start_time: round.round_start_time,
      is_locked: round.is_locked
    };

    return NextResponse.json({
      success: true,
      active: true,
      gameState: 'running',
      round: publicRound,
      serverTime: Date.now(),
      elapsedSeconds,
      isCompleted: Boolean(submissionInfo?.is_correct),
      submission: submissionInfo
    });
  } catch (err) {
    console.error('Round status API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
