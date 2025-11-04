import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/activity
 * Get user's recent activity
 * 
 * TODO: Real implementation - fetch from ActivityLog or AuditLog tables
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by activity type

    // TODO: Real implementation
    // const activities = await prisma.activityLog.findMany({
    //   where: {
    //     userId: user.id,
    //     ...(type ? { type } : {})
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset
    // });

    // Alternative: Use AuditLog if available
    // const activities = await prisma.auditLog.findMany({
    //   where: { userId: user.id },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset
    // });

    // MOCK DATA - Remove when real implementation is ready
    return NextResponse.json({
      items: [],
      total: 0,
      limit,
      offset,
      hasMore: false
    });
  } catch (error) {
    console.error('[api/dashboard/activity]', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
});

