import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from './auth-guards';

/**
 * Legacy admin guard (backward compatibility)
 * @deprecated Use requireAdmin from auth-guards.ts instead
 */
export function adminGuard(request: NextRequest) {
  // Development mode: allow access
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Check legacy header
  const isAdmin = request.headers.get('x-admin-authenticated') === 'true';
  const adminKey = request.headers.get('x-admin-key');

  // Also check for admin key
  if (adminKey && adminKey === process.env.ADMIN_KEY) {
    return null;
  }

  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Admin access required' },
      { status: 401 }
    );
  }
  
  return null;
}

/**
 * Legacy requireAdmin wrapper (backward compatibility)
 * @deprecated Use withAdmin from auth-guards.ts instead
 */
export function requireAdminLegacy(handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const guardResponse = adminGuard(req);
    if (guardResponse) return guardResponse;
    
    return handler(req, ...args);
  };
}
