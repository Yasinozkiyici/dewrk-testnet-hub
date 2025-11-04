import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'dewrk_admin';

function hasAdminCookie(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;
  return cookieHeader.split(';').some((section) => {
    const [name, value] = section.split('=').map((part) => part.trim());
    return name === ADMIN_COOKIE_NAME && Boolean(value);
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect admin API routes (except session endpoint which needs to work without auth)
  if (!pathname.startsWith('/api/admin/')) {
    return NextResponse.next();
  }

  // Allow session endpoint to work without auth check
  if (pathname === '/api/admin/session') {
    return NextResponse.next();
  }

  // Development mode: allow all admin routes
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.next();
  }

  // Production: require admin cookie
  if (hasAdminCookie(request)) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: 'forbidden' }, { status: 403 });
}

export const config = { matcher: ['/api/admin/:path*'] };
