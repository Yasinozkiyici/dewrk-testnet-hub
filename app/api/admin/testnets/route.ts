import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeUrl } from '@/lib/format';
import { safeRevalidateTag, TESTNETS_TAG, testnetTag } from '@/lib/cache';
import { toAdminTestnetRecord } from '@/lib/admin/testnet-record';

export const dynamic = 'force-dynamic';

let lastCall = 0;
function rateLimit() {
  const now = Date.now();
  if (now - lastCall < 500) throw new Error('rate_limit');
  lastCall = now;
}

function normalise(p: any) {
  const diff = (p.difficulty || '').toLowerCase();
  const diffMap: any = { easy: 'MEDIUM', medium: 'MEDIUM', intermediate: 'MEDIUM', hard: 'HARD' };
  const normalizedDiff = diffMap[diff] || p.difficulty;
  
  // Preserve status if provided, otherwise default to UPCOMING
  const statusMap: any = { 
    live: 'LIVE', 
    tba: 'TBA', 
    paused: 'TBA',  // Legacy support
    ended: 'ENDED', 
    upcoming: 'UPCOMING',
    active: 'LIVE'
  };
  const statusLower = (p.status || '').toLowerCase();
  const normalizedStatus = statusMap[statusLower] || p.status || 'UPCOMING';
  
  return { 
    ...p, 
    difficulty: normalizedDiff || p.difficulty, 
    status: normalizedStatus 
  };
}

function slugify(input: string) {
  return (input || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeTasks(raw: unknown, testnetId: string) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry, index) => {
      if (!entry || typeof entry !== 'object') return null;
      const record = entry as Record<string, unknown>;
      const title = typeof record.title === 'string' ? record.title.trim() : '';
      if (!title) return null;
      const description = typeof record.description === 'string' ? record.description.trim() : undefined;
      const reward = typeof record.reward === 'string' ? record.reward.trim() : undefined;
      const url = typeof record.url === 'string' ? record.url.trim() : undefined;
      const orderValue = record.order;
      const order =
        typeof orderValue === 'number'
          ? orderValue
          : typeof orderValue === 'string' && Number.isFinite(Number(orderValue))
            ? Number(orderValue)
            : index;
      return {
        testnetId,
        title,
        description: description ?? null,
        reward: reward ?? null,
        url: url ? safeUrl(url) ?? null : null,
        order
      };
    })
    .filter((task): task is {
      testnetId: string;
      title: string;
      description: string | null;
      reward: string | null;
      url: string | null;
      order: number;
    } => task !== null)
    .sort((a, b) => a.order - b.order)
    .map((task, index) => ({ ...task, order: index }));
}

export async function POST(req: Request) {
  let parsedBody: any | undefined;
  try {
    if (process.env.NODE_ENV !== 'test') {
      rateLimit();
    }
    const body = normalise(await req.json());
    parsedBody = body;
    // Minimal validation for tests
    if (!body?.name && !body?.slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const targetSlug = body.slug ? slugify(body.slug) : slugify(body.name);

    const upsertWithClient = async (client: any) => {
      const record = await client.testnet.upsert({
        where: { slug: targetSlug },
        update: {
          name: body.name ?? undefined,
          network: body.network ?? undefined,
          status: (body.status as any) ?? undefined,
          difficulty: (body.difficulty as any) ?? undefined,
          shortDescription: body.shortDescription ?? undefined,
          heroImageUrl: body.heroImageUrl ?? undefined,
          logoUrl: body.logoUrl ?? undefined,
          estTimeMinutes: body.estTimeMinutes ?? undefined,
          rewardType: body.rewardType ?? undefined,
          rewardNote: body.rewardNote ?? undefined,
          rewardCategory: body.rewardCategory ?? undefined,
          rewardRangeUSD:
            body.rewardRangeUSD !== undefined && body.rewardRangeUSD !== null && body.rewardRangeUSD !== ''
              ? Number(body.rewardRangeUSD)
              : undefined,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          hasFaucet: typeof body.hasFaucet === 'boolean' ? body.hasFaucet : undefined,
          kycRequired: body.kycRequired ?? undefined,
          requiresWallet: body.requiresWallet ?? undefined,
          tags: body.tags ?? undefined,
          categories: body.categories ?? undefined,
          highlights: body.highlights ?? undefined,
          prerequisites: body.prerequisites ?? undefined,
          gettingStarted: body.gettingStarted ?? undefined,
          websiteUrl: body.websiteUrl ?? undefined,
          githubUrl: body.githubUrl ?? undefined,
          twitterUrl: body.twitterUrl ?? undefined,
          discordUrl: body.discordUrl ?? undefined,
          dashboardUrl: body.dashboardUrl ?? undefined,
          hasDashboard: body.hasDashboard ?? undefined,
          totalRaisedUSD: body.totalRaisedUSD ?? undefined,
          discordRoles: ((): any => {
            const value = body.discordRoles;
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
              try { return JSON.parse(value); } catch { return undefined; }
            }
            return undefined;
          })()
        },
        create: {
          slug: targetSlug,
          name: body.name ?? targetSlug,
          network: body.network ?? 'Unknown',
          status: (body.status as any) ?? 'UPCOMING',
          difficulty: (body.difficulty as any) ?? 'MEDIUM',
          shortDescription: body.shortDescription ?? null,
          heroImageUrl: body.heroImageUrl ?? null,
          logoUrl: body.logoUrl ?? null,
          estTimeMinutes: body.estTimeMinutes ?? null,
          rewardType: body.rewardType ?? null,
          rewardNote: body.rewardNote ?? null,
          rewardCategory: body.rewardCategory ?? null,
          rewardRangeUSD:
            body.rewardRangeUSD !== undefined && body.rewardRangeUSD !== null && body.rewardRangeUSD !== ''
              ? Number(body.rewardRangeUSD)
              : null,
          startDate: body.startDate ? new Date(body.startDate) : null,
          hasFaucet: typeof body.hasFaucet === 'boolean' ? body.hasFaucet : null,
          kycRequired: body.kycRequired ?? false,
          requiresWallet: body.requiresWallet ?? true,
          tags: body.tags ?? null,
          categories: body.categories ?? null,
          highlights: body.highlights ?? null,
          prerequisites: body.prerequisites ?? null,
          gettingStarted: body.gettingStarted ?? null,
          websiteUrl: body.websiteUrl ?? null,
          githubUrl: body.githubUrl ?? null,
          twitterUrl: body.twitterUrl ?? null,
          discordUrl: body.discordUrl ?? null,
          dashboardUrl: body.dashboardUrl ?? null,
          hasDashboard: body.hasDashboard ?? false,
          totalRaisedUSD: body.totalRaisedUSD ?? null,
          discordRoles: ((): any => {
            const value = body.discordRoles;
            if (Array.isArray(value)) return value;
            if (typeof value === 'string') {
              try { return JSON.parse(value); } catch { return null; }
            }
            return null;
          })()
        }
      });

      if (Array.isArray(body.tasks)) {
        await client.task.deleteMany({ where: { testnetId: record.id } });
        const tasksPayload = normalizeTasks(body.tasks, record.id);
        if (tasksPayload.length) {
          await client.task.createMany({ data: tasksPayload });
        }
        await client.testnet.update({
          where: { id: record.id },
          data: { tasksCount: tasksPayload.length }
        });
      }

      return record;
    };

    const resultRecord =
      typeof prisma.$transaction === 'function'
        ? await prisma.$transaction(async (tx) => upsertWithClient(tx))
        : await upsertWithClient(prisma);

    safeRevalidateTag(TESTNETS_TAG);
    safeRevalidateTag(testnetTag(targetSlug));
    const fresh = await prisma.testnet.findUnique({
      where: { id: resultRecord.id },
      include: { tasks: { orderBy: { order: 'asc' } } }
    });
    if (fresh) {
      return NextResponse.json(toAdminTestnetRecord(fresh));
    }
    return NextResponse.json(
      toAdminTestnetRecord({
        ...(resultRecord as any),
        tasks: []
      })
    );
  } catch (e: any) {
    // Enhanced error logging with context for Sentry
    const errorMessage = e?.message ?? 'Unknown error';
    const errorContext = {
      endpoint: '/api/admin/testnets/upsert',
      method: 'POST',
      body: parsedBody ? { slug: parsedBody.slug, name: parsedBody.name } : null,
      error: errorMessage,
      stack: e?.stack
    };

    if (errorMessage === 'rate_limit') {
      console.warn('[api/admin/testnets/upsert] Rate limit exceeded', errorContext);
      return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
    }

    console.error('[api/admin/testnets/upsert] Failed to upsert testnet', errorContext);
    
    // TODO: Send to Sentry with context
    // if (typeof window === 'undefined' && typeof process !== 'undefined') {
    //   const Sentry = await import('@sentry/nextjs');
    //   Sentry.captureException(e, {
    //     tags: { endpoint: 'admin/testnets/upsert', method: 'POST', action: 'upsert' },
    //     extra: errorContext,
    //     user: { id: req.headers.get('x-user-id') || undefined }
    //   });
    // }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
