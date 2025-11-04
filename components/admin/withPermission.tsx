'use client';

import { ReactNode } from 'react';
import { UserRole, hasPermission } from '@/lib/admin/permissions';

/**
 * Permission-based conditional rendering component
 * 
 * Usage:
 * ```tsx
 * <WithPermission role={userRole} resource="testnets" action="create">
 *   <Button>Create Testnet</Button>
 * </WithPermission>
 * ```
 */
interface WithPermissionProps {
  role: UserRole;
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithPermission({
  role,
  resource,
  action,
  children,
  fallback = null
}: WithPermissionProps) {
  if (!hasPermission(role, resource, action)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}

