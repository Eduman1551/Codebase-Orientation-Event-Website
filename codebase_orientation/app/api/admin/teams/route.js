import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { getAllTeams } from '@/lib/db/teams.js';
import { getActiveRound } from '@/lib/db/rounds.js';
import supabase from '@/lib/supabase.js';

export async function GET(request) {
  try {
    const isAuthorized = await verifyAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const { data: teams, error: teamsError } = await getAllTeams();

    if (teamsError) {
      return NextResponse.json({ success: false, error: teamsError.message }, { status: 500 });
    }

    const { data: activeRound } = await getActiveRound();

    // Fetch submissions for active round if it exists
    let submissionsMap = {};
    if (activeRound) {
      const { data: submissions } = await supabase
        .from('submissions')
        .select('*')
        .eq('round_id', activeRound.id);

      if (submissions) {
        submissions.forEach(sub => {
          submissionsMap[sub.team_id] = sub;
        });
      }
    }

    const enrichedTeams = (teams || []).map(team => {
      const sub = submissionsMap[team.id];
      return {
        ...team,
        current_submission: sub || null,
        is_completed: Boolean(sub?.is_correct),
        time_taken: sub?.time_taken ?? null,
        score: sub?.score ?? null
      };
    });

    return NextResponse.json({
      success: true,
      activeRound: activeRound || null,
      teams: enrichedTeams
    });
  } catch (err) {
    console.error('Admin teams API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
