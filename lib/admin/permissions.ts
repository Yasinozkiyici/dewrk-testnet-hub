/**
 * Granular Permissions System
 * 
 * Defines roles (admin, editor, viewer) and permission checks.
 * Integrates with Supabase RLS policies.
 */

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

/**
 * Permission matrix: role -> resource -> actions allowed
 */
const PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  admin: {
    testnets: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update'],
    activity: ['read']
  },
  editor: {
    testnets: ['create', 'read', 'update'],
    users: ['read'],
    content: ['create', 'read', 'update'],
    settings: ['read'],
    activity: ['read']
  },
  viewer: {
    testnets: ['read'],
    users: ['read'],
    content: ['read'],
    settings: ['read'],
    activity: ['read']
  }
};

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(
  role: UserRole,
  resource: string,
  action: string
): boolean {
  const rolePermissions = PERMISSIONS[role] ?? {};
  const resourcePermissions = rolePermissions[resource] ?? [];
  return resourcePermissions.includes(action);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Record<string, string[]> {
  return PERMISSIONS[role] ?? {};
}

/**
 * Check if user can create in a resource
 */
export function canCreate(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'create');
}

/**
 * Check if user can update in a resource
 */
export function canUpdate(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'update');
}

/**
 * Check if user can delete in a resource
 */
export function canDelete(role: UserRole, resource: string): boolean {
  return hasPermission(role, resource, 'delete');
}

/**
 * HOC/Wrapper for conditional rendering based on permissions
 * 
 * Usage:
 * ```tsx
 * <WithPermission role={userRole} resource="testnets" action="create">
 *   <Button>Create Testnet</Button>
 * </WithPermission>
 * ```
 */
export interface WithPermissionProps {
  role: UserRole;
  resource: string;
  action: string;
  children: React.ReactNode;
}

export function WithPermission({ role, resource, action, children }: WithPermissionProps) {
  if (!hasPermission(role, resource, action)) {
    return null;
  }
  return <>{children}</>;
}

