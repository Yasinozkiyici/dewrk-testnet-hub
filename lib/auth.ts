/**
 * Authentication & Session Handling
 *
 * Google OAuth + NextAuth ile oturum yönetimi.
 */

import { cookies } from 'next/headers';
import type { Session } from 'next-auth';
import { auth } from '@/auth';

export const ADMIN_COOKIE_NAME = 'dewrk_admin';

export type UserRole = 'admin' | 'contributor' | 'viewer';

export interface AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  walletAddress?: string;
  metadata?: Record<string, unknown>;
}

const ADMIN_EMAILS = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAIL_WHITELIST = ADMIN_EMAILS;

function deriveRoleFromEmail(email?: string | null): UserRole {
  if (!email) return 'viewer';
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'viewer';
}

export async function getServerSession(): Promise<Session | null> {
  return auth();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    if (adminCookie?.value) {
      return {
        id: 'admin-cookie-user',
        email: 'admin@dewrk.com',
        role: 'admin',
        walletAddress: undefined,
        metadata: { source: 'cookie' }
      };
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return null;
    }

    const role = (session.user.role as UserRole | undefined) ?? deriveRoleFromEmail(session.user.email);
    return {
      id: session.user.id ?? session.user.email ?? 'user',
      email: session.user.email ?? undefined,
      role,
      walletAddress: undefined,
      metadata: session.user
    };
  } catch (error) {
    console.error('[auth] Failed to resolve current user:', error);
    return null;
  }
}

export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    viewer: 1,
    contributor: 2,
    admin: 3
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

export async function isContributor(): Promise<boolean> {
  return hasRole('contributor');
}

export function getMockUser(role: UserRole = 'viewer'): AuthUser {
  return {
    id: 'mock-user-id',
    email: 'user@example.com',
    role,
    walletAddress: '0x1234567890123456789012345678901234567890',
    metadata: { mock: true }
  };
}
