/**
 * Activity Log System
 * 
 * Captures who changed what and when.
 * Stores snapshots in Supabase audit table.
 */

import { prisma } from '@/lib/prisma';

export type ActivityAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish';

export interface ActivityLogEntry {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: ActivityAction;
  resourceType: string; // 'testnet', 'user', 'guide', etc.
  resourceId: string;
  resourceName?: string;
  changes?: Record<string, { old: any; new: any }>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

/**
 * Create an activity log entry
 * 
 * TODO: Implement with Supabase audit table
 * Table structure:
 * - id (uuid)
 * - user_id (uuid, references auth.users)
 * - user_name (text)
 * - user_email (text)
 * - action (text)
 * - resource_type (text)
 * - resource_id (text)
 * - resource_name (text)
 * - changes (jsonb)
 * - metadata (jsonb)
 * - created_at (timestamp)
 */
export async function logActivity(
  userId: string,
  action: ActivityAction,
  resourceType: string,
  resourceId: string,
  options?: {
    resourceName?: string;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: Record<string, any>;
    userName?: string;
    userEmail?: string;
  }
): Promise<void> {
  try {
    // TODO: Insert into Supabase audit_log table
    // For now, log to console
    console.log('[Activity Log]', {
      userId,
      action,
      resourceType,
      resourceId,
      ...options,
      timestamp: new Date().toISOString()
    });

    // Example Supabase insert (commented until table exists):
    // const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    // await supabase.from('audit_log').insert({
    //   user_id: userId,
    //   user_name: options?.userName,
    //   user_email: options?.userEmail,
    //   action,
    //   resource_type: resourceType,
    //   resource_id: resourceId,
    //   resource_name: options?.resourceName,
    //   changes: options?.changes,
    //   metadata: options?.metadata
    // });
  } catch (error) {
    console.error('[Activity Log] Failed to log activity:', error);
    // Don't throw - activity logging should not break the main flow
  }
}

/**
 * Get activity log entries with filters
 */
export async function getActivityLog(filters?: {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
  action?: ActivityAction;
  limit?: number;
  offset?: number;
}): Promise<ActivityLogEntry[]> {
  try {
    // TODO: Query from Supabase audit_log table
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('[Activity Log] Failed to fetch activity log:', error);
    return [];
  }
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<ActivityLogEntry[]> {
  return getActivityLog({ limit, offset: 0 });
}

