import { NextRequest, NextResponse } from 'next/server';

export function adminGuard(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const isAdmin = request.headers.get('x-admin-authenticated') === 'true';

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin access required' },
      { status: 401 }
    );
  }
  
  return null;
}

export function requireAdmin(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]) => {
    const guardResponse = adminGuard(req);
    if (guardResponse) return guardResponse;
    
    return handler(req, ...args);
  };
}
