import { NextResponse } from 'next/server';
import { getActiveRound, getLatestRound, getAllRounds } from '@/lib/db/rounds.js';
import supabase from '@/lib/supabase.js';

const ROUND_DURATION_SECONDS = 300; // 5 minutes
const BETWEEN_ROUNDS_SECONDS = 30;  // 30s gap between rounds
const TOTAL_ROUNDS = 5;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId =
      searchParams.get('team_id') ||
      request.cookies.get('team_id')?.value ||
      request.headers.get('x-team-id');

    const now = Date.now();
    const { data: activeRound } = await getActiveRound();

    // ─── Active Round ────────────────────────────────────────────────────
    if (activeRound && activeRound.round_start_time) {
      const rawTimeStr = String(activeRound.round_start_time).trim();
      const isoUtcStr = rawTimeStr.endsWith('Z') ? rawTimeStr : `${rawTimeStr}Z`;
      const startTs = new Date(isoUtcStr).getTime();
      const elapsedSeconds = Math.max(0, Math.floor((now - startTs) / 1000));

      let submissionInfo = null;
      if (teamId) {
        const { data: submission } = await supabase
          .from('submissions')
          .select('is_correct, time_taken, score, submitted_at')
          .eq('team_id', teamId)
          .eq('round_id', activeRound.id)
          .maybeSingle();
        if (submission) submissionInfo = submission;
      }

      const publicRound = {
        id: activeRound.id,
        round_number: activeRound.round_number,
        round_name: activeRound.round_name || `Round ${activeRound.round_number}`,
        round_start_time: isoUtcStr,
        startTimestamp: startTs,
        is_locked: false
      };

      return NextResponse.json({
        success: true,
        active: true,
        gameState: 'running',
        round: publicRound,
        serverTime: now,
        elapsedSeconds,
        isCompleted: Boolean(submissionInfo?.is_correct),
        submission: submissionInfo
      });
    }

    // ─── No Active Round — Check for Between-Rounds Window ──────────────
    const { data: latestRound } = await getLatestRound();

    if (latestRound && latestRound.is_locked && latestRound.round_start_time) {
      const rawLatestStr = String(latestRound.round_start_time).trim();
      const isoLatestStr = rawLatestStr.endsWith('Z') ? rawLatestStr : `${rawLatestStr}Z`;
      const lockedAt = new Date(isoLatestStr).getTime() + ROUND_DURATION_SECONDS * 1000;
      const timeSinceLock = Math.floor((now - lockedAt) / 1000);
      const nextRoundIn = Math.max(0, BETWEEN_ROUNDS_SECONDS - timeSinceLock);

      if (latestRound.round_number < TOTAL_ROUNDS && nextRoundIn > 0) {
        return NextResponse.json({
          success: true,
          active: false,
          gameState: 'between_rounds',
          currentRoundNumber: latestRound.round_number,
          nextRoundNumber: latestRound.round_number + 1,
          nextRoundIn,
          serverTime: now,
          round: null
        });
      }

      if (latestRound.round_number >= TOTAL_ROUNDS) {
        return NextResponse.json({
          success: true,
          active: false,
          gameState: 'game_over',
          serverTime: now,
          round: null
        });
      }
    }

    // ─── Lobby / Waiting State ───────────────────────────────────────────
    return NextResponse.json({
      success: true,
      active: false,
      gameState: 'waiting',
      round: null,
      serverTime: now,
      message: 'No active round in progress'
    });

  } catch (err) {
    console.error('Round status API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

