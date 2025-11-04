import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-guards';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/tasks
 * Get user's tasks across testnets
 * 
 * TODO: Real implementation - fetch from UserProgress or TaskCompletion tables
 */
export const GET = withAuth(async (req: NextRequest, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // 'completed' | 'pending' | 'all'
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // TODO: Real implementation
    // const tasks = await prisma.task.findMany({
    //   where: {
    //     taskCompletions: {
    //       some: { userId: user.id }
    //     },
    //     ...(status && status !== 'all' ? { status } : {})
    //   },
    //   include: {
    //     testnet: {
    //       select: { name: true, slug: true }
    //     }
    //   },
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
    console.error('[api/dashboard/tasks]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
});

