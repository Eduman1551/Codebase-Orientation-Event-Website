import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/db/submissions.js';

export async function GET() {
  try {
    const { data, error } = await getLeaderboard();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    const formatted = (data || []).map((item, idx) => ({
      id: item.team_id || `team-${idx}`,
      name: item.team_name || 'Anonymous Crew',
      members: item.member_names || [],
      time: item.total_time || 0,
      score: item.total_score || 0,
      team_name: item.team_name || 'Anonymous Crew',
      total_time: item.total_time || 0,
      total_score: item.total_score || 0,
      rank: idx + 1
    }));

    return NextResponse.json(
      {
        success: true,
        leaderboard: formatted
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    );
  } catch (err) {
    console.error('Leaderboard API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
