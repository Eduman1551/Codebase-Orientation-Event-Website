import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/adminAuth.js';

export async function POST(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Body may be empty if auth is passed via header
    }

    const isAuthorized = await verifyAdmin(request, body);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'ACCESS DENIED: Invalid admin passkey' },
        { status: 401 }
      );
    }

    const expectedPasskey =
      process.env.ADMIN_PASSKEY

    const response = NextResponse.json({
      success: true,
      message: 'Admin authorization granted'
    });

    response.cookies.set('admin_passkey', expectedPasskey, {
      path: '/',
      maxAge: 60 * 60 * 8,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (err) {
    console.error('Admin Auth API error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
