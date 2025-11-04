import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LEADERBOARDS_TAG = 'leaderboards';
const METRICS_TAG = 'metrics';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.leaderboardSlug || !body?.entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leaderboard = await prisma.leaderboard.findUnique({
      where: { slug: body.leaderboardSlug },
      select: { id: true }
    });

    if (!leaderboard) {
      return NextResponse.json({ error: 'LeaderboardNotFound' }, { status: 404 });
    }

    const entry = await prisma.leaderboardEntry.upsert({
      where: {
        leaderboardId_entityId: {
          leaderboardId: leaderboard.id,
          entityId: body.entityId
        }
      },
      update: {
        metricValue: body.metricValue ?? undefined,
        change: body.change ?? null,
        metadata: body.metadata ?? undefined
      },
      create: {
        leaderboardId: leaderboard.id,
        entityId: body.entityId,
        entityName: body.entityName ?? body.entityId,
        rank: body.rank ?? 1,
        metricValue: body.metricValue ?? 0,
        change: body.change ?? null,
        metadata: body.metadata ?? {}
      }
    });

    await revalidateTag(LEADERBOARDS_TAG);
    await revalidateTag(METRICS_TAG);

    return NextResponse.json(entry);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/admin/leaderboards]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
