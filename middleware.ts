import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, JWTPayload } from 'jose';

function getJwtSecret() {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing SUPABASE_JWT_SECRET for admin auth');
  }
  return new TextEncoder().encode(secret);
}

function extractRole(payload: JWTPayload) {
  if (typeof payload.role === 'string') {
    return payload.role;
  }
  if (payload.app_metadata && typeof payload.app_metadata === 'object') {
    const role = (payload.app_metadata as Record<string, unknown>).role;
    if (typeof role === 'string') {
      return role;
    }
  }
  return null;
}

async function verifyAdminToken(token: string) {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ['HS256']
  });
  return extractRole(payload);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const role = await verifyAdminToken(token);
    if (role !== 'admin') {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-authenticated', 'true');
    requestHeaders.set('x-admin-role', role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (error) {
    console.error(JSON.stringify({ level: 'error', scope: 'middleware', error: (error as Error).message }));
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/admin/:path*']
};
