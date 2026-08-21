import { NextResponse } from 'next/server';
import { getActiveRound } from '@/lib/db/rounds.js';
import { getCluesForRoom } from '@/lib/db/clues.js';

function normalizeRoomName(rawRoom) {
  if (!rawRoom) return '';
  const cleaned = rawRoom.trim().toLowerCase();
  if (cleaned.includes('engine')) return 'Engine';
  if (cleaned.includes('control')) return 'Control';
  if (cleaned.includes('electrical')) return 'Electrical';
  if (cleaned.includes('medbay') || cleaned.includes('med bay') || cleaned.includes('medical')) return 'MedBay';
  if (cleaned.includes('weapon')) return 'Weapons';
  if (cleaned.includes('meeting')) return 'Meeting';
  return rawRoom.trim();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawRoom = searchParams.get('room') || searchParams.get('room_name') || searchParams.get('name');
    let roundId = searchParams.get('round_id') || searchParams.get('roundId');

    if (!rawRoom) {
      return NextResponse.json(
        { success: false, error: 'Room name parameter is required (e.g. ?room=engine)' },
        { status: 400 }
      );
    }

    if (!roundId) {
      const { data: activeRound, error: roundError } = await getActiveRound();
      if (roundError || !activeRound || activeRound.is_locked) {
        return NextResponse.json(
          { success: false, error: 'No active round found' },
          { status: 400 }
        );
      }
      roundId = activeRound.id;
    }

    const roomName = normalizeRoomName(rawRoom);

    let { data: clues, error } = await getCluesForRoom(roundId, roomName);

    if ((!clues || clues.length === 0) && roomName !== rawRoom) {
      const fallbackResult = await getCluesForRoom(roundId, rawRoom.trim());
      if (fallbackResult.data && fallbackResult.data.length > 0) {
        clues = fallbackResult.data;
        error = fallbackResult.error;
      }
    }

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to fetch clues' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      round_id: roundId,
      room_name: roomName,
      clues: clues || []
    });
  } catch (err) {
    console.error('Clues API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
