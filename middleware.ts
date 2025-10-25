import { NextResponse } from 'next/server';
import * as jose from 'jose';

async function verifyAdminToken(req: Request) {
  if (process.env.NODE_ENV !== 'production') return true;
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET!);
  const { payload } = await jose.jwtVerify(token, secret).catch(() => ({ payload: {} as any }));
  return payload?.role === 'admin';
}

export async function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/admin/')) {
    const ok = await verifyAdminToken(req);
    if (!ok) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    const res = NextResponse.next();
    res.headers.set('x-admin-authenticated', 'true');
    return res;
  }
  return NextResponse.next();
}

export const config = { matcher: ['/api/admin/:path*'] };
