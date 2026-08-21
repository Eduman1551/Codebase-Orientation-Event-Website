'use server';

import { createTeam } from '@/lib/db/teams.js';

export const register = async (form) => {
  try {
    const teamName = (form.teamName || form.team_name || '').trim();
    const members = [
      form.memName1,
      form.memName2,
      form.memName3,
      form.memName4
    ].map(m => (m || '').trim()).filter(Boolean);

    if (!teamName) {
      return { success: false, error: 'Team name is required' };
    }

    if (members.length === 0) {
      return { success: false, error: 'At least one member is required' };
    }

    const { data: team, error } = await createTeam(teamName, members);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, team };
  } catch (err) {
    console.error('Server action registration error:', err);
    return { success: false, error: err.message || 'Registration failed' };
  }
};
