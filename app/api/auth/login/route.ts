import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

function getExpectedPassword(): string {
  return process.env.ADMIN_PANEL_PASSWORD ?? process.env.NEXT_PUBLIC_ADMIN_PASS ?? '';
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json().catch(() => ({ password: '' }));

    const expected = getExpectedPassword();
    if (!expected) {
      return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 });
    }

    if (typeof password !== 'string' || password.trim().length === 0) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: 'admin',
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/auth/login]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


