import { prisma } from '@/lib/db';

export interface AuditLogData {
  userId?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource: string;
  resourceId?: string;
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        changes: data.changes,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main functionality
  }
}

export function getClientInfo(request: Request) {
  const headers = request.headers;
  return {
    ipAddress: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
    userAgent: headers.get('user-agent') || 'unknown'
  };
}
