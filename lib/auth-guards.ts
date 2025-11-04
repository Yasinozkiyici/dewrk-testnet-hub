/**
 * Role-based Access Guards
 * 
 * Bu dosya role-based access control (RBAC) guard'larını içerir.
 * Admin, Contributor, Viewer rolleri için koruma sağlar.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, hasRole, type UserRole } from './auth';

/**
 * Guard response type
 */
export type GuardResult = 
  | { allowed: true; user: Awaited<ReturnType<typeof getCurrentUser>> }
  | { allowed: false; response: NextResponse };

/**
 * Role-based guard
 */
export async function requireRole(requiredRole: UserRole): Promise<GuardResult> {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  const hasRequiredRole = await hasRole(requiredRole);
  
  if (!hasRequiredRole) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: `Role '${requiredRole}' required` },
        { status: 403 }
      )
    };
  }

  return { allowed: true, user };
}

/**
 * Admin guard
 */
export async function requireAdmin(): Promise<GuardResult> {
  return requireRole('admin');
}

/**
 * Contributor guard (contributor ve admin)
 */
export async function requireContributor(): Promise<GuardResult> {
  return requireRole('contributor');
}

/**
 * Authenticated user guard (any role)
 */
export async function requireAuth(): Promise<GuardResult> {
  const user = await getCurrentUser();
  
  if (!user) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  return { allowed: true, user };
}

/**
 * Route handler wrapper - Admin only
 */
export function withAdmin<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const guard = await requireAdmin();
    if (!guard.allowed) {
      return guard.response;
    }
    return handler(req, guard.user!, ...args);
  };
}

/**
 * Route handler wrapper - Contributor or Admin
 */
export function withContributor<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const guard = await requireContributor();
    if (!guard.allowed) {
      return guard.response;
    }
    return handler(req, guard.user!, ...args);
  };
}

/**
 * Route handler wrapper - Authenticated user
 */
export function withAuth<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: (req: NextRequest, user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const guard = await requireAuth();
    if (!guard.allowed) {
      return guard.response;
    }
    return handler(req, guard.user!, ...args);
  };
}

/**
 * Server component guard - redirect if not authorized
 */
export async function serverGuard(requiredRole: UserRole = 'viewer') {
  const user = await getCurrentUser();
  
  if (!user) {
    return { user: null, redirect: '/login' };
  }

  const hasRequiredRole = await hasRole(requiredRole);
  
  if (!hasRequiredRole) {
    return { user, redirect: '/dashboard?error=forbidden' };
  }

  return { user, redirect: null };
}

