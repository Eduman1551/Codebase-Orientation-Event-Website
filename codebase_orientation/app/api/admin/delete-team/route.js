import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';
import { deleteTeam } from '@/lib/db/teams.js';

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

    const { team_id } = body || {};

    if (!team_id) {
      return NextResponse.json(
        { success: false, error: 'team_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await deleteTeam(team_id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to delete team' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully',
      team: data
    });
  } catch (err) {
    console.error('Delete team API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
