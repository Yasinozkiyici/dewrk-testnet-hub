import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LEADERBOARDS } from '@/prisma/leaderboard';
import { safeRevalidateTag } from '@/lib/cache';

const LEADERBOARDS_TAG = 'leaderboards';

export async function GET() {
  try {
    safeRevalidateTag(LEADERBOARDS_TAG);

    const leaderboards = await prisma.leaderboard.findMany({
      where: {
        isActive: true
      },
      include: {
        entries: {
          orderBy: {
            rank: 'asc'
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    if (!leaderboards.length) {
      return NextResponse.json({
        items: LEADERBOARDS,
        source: 'seed',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      items: leaderboards.map((board) => ({
        ...board,
        updatedAt: board.updatedAt.toISOString(),
        entries: board.entries.map((entry) => ({
          ...entry,
          metricValue: Number(entry.metricValue),
          change: typeof entry.change === 'number' ? entry.change : null,
          metadata: (entry.metadata as Record<string, unknown> | null) ?? null,
          createdAt: entry.createdAt.toISOString(),
          updatedAt: entry.updatedAt.toISOString()
        }))
      })),
      source: 'prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/leaderboards]', message);
    return NextResponse.json({
      items: LEADERBOARDS,
      source: 'seed',
      timestamp: new Date().toISOString(),
      error: message
    });
  }
}
