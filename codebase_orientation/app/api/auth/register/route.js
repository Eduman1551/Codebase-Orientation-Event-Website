import { NextResponse } from 'next/server';
import { createTeam } from '@/lib/db/teams.js';
import { getActiveRound, getLatestRound } from '@/lib/db/rounds.js';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { teamName, team_name, members, member_names } = body || {};
    const finalTeamName = (teamName || team_name || '').trim();
    const rawMembers = members || member_names || [];

    if (!finalTeamName) {
      return NextResponse.json({ success: false, error: 'Team name is required' }, { status: 400 });
    }

    let finalMembers = [];
    if (Array.isArray(rawMembers)) {
      finalMembers = rawMembers.map(m => String(m).trim()).filter(Boolean);
    } else if (typeof rawMembers === 'string') {
      finalMembers = rawMembers.split(',').map(m => m.trim()).filter(Boolean);
    }

    if (finalMembers.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one crew member name is required' }, { status: 400 });
    }

    // Guard: Check if the game has already launched
    const { data: activeRound } = await getActiveRound();
    if (activeRound && activeRound.round_start_time) {
      return NextResponse.json({ success: false, error: 'Registration is closed — the mission has already launched.' }, { status: 403 });
    }
    const { data: latestRound } = await getLatestRound();
    if (latestRound && latestRound.is_locked && latestRound.round_start_time) {
      return NextResponse.json({ success: false, error: 'Registration is closed — the mission has already launched.' }, { status: 403 });
    }

    const { data: team, error } = await createTeam(finalTeamName, finalMembers);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to register team. Team name might already exist.'
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        message: 'Team registered successfully',
        team
      },
      { status: 201 }
    );

    // Set cookie on response
    response.cookies.set('team_id', team.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    response.cookies.set('team_name', team.team_name, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (err) {
    console.error('Registration API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
