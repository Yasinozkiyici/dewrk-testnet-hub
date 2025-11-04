import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

const PASS_KEYS = ['ADMIN_PASSPHRASE', 'NEXT_PUBLIC_ADMIN_PASS'] as const;

export const dynamic = 'force-dynamic';

function getConfiguredPassphrase(): string | null {
  for (const key of PASS_KEYS) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const expected = getConfiguredPassphrase();
    if (!expected) {
      return NextResponse.json({ error: 'not_configured' }, { status: 400 });
    }

    const { pass } = await request.json().catch(() => ({}));
    if (typeof pass !== 'string' || pass.trim().length === 0) {
      return NextResponse.json({ error: 'missing_pass' }, { status: 400 });
    }

    if (pass.trim() !== expected) {
      return NextResponse.json({ error: 'invalid_pass' }, { status: 401 });
    }

    const cookieStore = cookies();
    cookieStore.set({
      name: ADMIN_COOKIE_NAME,
      value: 'granted',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[api/admin/session] Failed to create admin session', error);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
