import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import slugify from 'slugify';
import prisma from '@/lib/db';
import { adminGuard } from '@/lib/admin-guard';
import { revalidateTestnet, revalidateTestnetsList } from '@/lib/cache';
import { testnetCreateSchema, testnetDetailResponseSchema } from '@/lib/zod';
import { serializeTestnetDetail } from '@/lib/serializers/testnet';
import { createAuditLog, getClientInfo } from '@/lib/audit-log';

let lastCall = 0;
function rateLimit() {
  const now = Date.now();
  if (now - lastCall < 500) {
    throw new Error('rate_limit');
  }
  lastCall = now;
}

const DIFFICULTY_MAP = new Map<string, 'EASY' | 'MEDIUM' | 'HARD'>([
  ['EASY', 'EASY'],
  ['MEDIUM', 'MEDIUM'],
  ['HARD', 'HARD'],
  ['INTERMEDIATE', 'MEDIUM']
]);

const STATUS_SET = new Set(['LIVE', 'PAUSED', 'ENDED', 'UPCOMING']);

const adminInputSchema = z.object({
  slug: z.string().trim().min(1).optional(),
  name: z.string().min(2),
  shortDescription: z.string().optional(),
  network: z.string().min(1),
  status: z.string().optional(),
  difficulty: z.string().optional(),
  estTimeMinutes: z.union([z.number(), z.string()]).optional(),
  rewardType: z.string().optional(),
  rewardNote: z.string().optional(),
  kycRequired: z.boolean().optional(),
  requiresWallet: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  gettingStarted: z.array(z.string()).optional(),
  hasDashboard: z.boolean().optional(),
  totalRaisedUSD: z.union([z.number(), z.string()]).optional(),
  logoUrl: z.string().optional(),
  heroImageUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  dashboardUrl: z.string().optional(),
  discordRoles: z
    .array(
      z.object({
        role: z.string(),
        requirement: z.string().optional(),
        perks: z.string().optional()
      })
    )
    .optional(),
  tasks: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        reward: z.string().optional(),
        order: z.union([z.number(), z.string()]).optional()
      })
    )
    .optional()
});

function cleanString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function cleanUrl(value: unknown) {
  const candidate = cleanString(value);
  if (!candidate) return undefined;
  try {
    return new URL(candidate).toString();
  } catch {
    return undefined;
  }
}

function parseNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
}

function parseInteger(value: unknown) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const numeric = Number.parseInt(value, 10);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
}

function normalizeDifficulty(value: string | undefined) {
  if (!value) return 'MEDIUM' as const;
  const normalized = value.trim().toUpperCase();
  return DIFFICULTY_MAP.get(normalized) ?? 'MEDIUM';
}

function normalizeStatus(value: string | undefined) {
  if (!value) return 'UPCOMING';
  const normalized = value.trim().toUpperCase();
  return STATUS_SET.has(normalized) ? (normalized as typeof normalized) : 'UPCOMING';
}

export async function POST(request: NextRequest) {
  const guardResponse = adminGuard(request);
  if (guardResponse) return guardResponse;

  try {
    rateLimit();
    const rawBody = await request.json();
    const parsedInput = adminInputSchema.parse(rawBody);

    const normalizedInput = {
      name: cleanString(parsedInput.name) ?? parsedInput.name,
      network: cleanString(parsedInput.network) ?? parsedInput.network,
      status: normalizeStatus(parsedInput.status),
      difficulty: normalizeDifficulty(parsedInput.difficulty),
      shortDescription: cleanString(parsedInput.shortDescription),
      heroImageUrl: cleanUrl(parsedInput.heroImageUrl),
      logoUrl: cleanUrl(parsedInput.logoUrl),
      estTimeMinutes: parseInteger(parsedInput.estTimeMinutes),
      rewardType: cleanString(parsedInput.rewardType),
      rewardNote: cleanString(parsedInput.rewardNote),
      kycRequired: parsedInput.kycRequired ?? false,
      requiresWallet: parsedInput.requiresWallet ?? true,
      tags: (parsedInput.tags ?? []).map((item) => cleanString(item) ?? item).filter(Boolean) as string[],
      categories: (parsedInput.categories ?? []).map((item) => cleanString(item) ?? item).filter(Boolean) as string[],
      highlights: (parsedInput.highlights ?? []).map((item) => cleanString(item) ?? item).filter(Boolean) as string[],
      prerequisites: (parsedInput.prerequisites ?? [])
        .map((item) => cleanString(item) ?? item)
        .filter(Boolean) as string[],
      gettingStarted: (parsedInput.gettingStarted ?? [])
        .map((item) => cleanString(item) ?? item)
        .filter(Boolean) as string[],
      websiteUrl: cleanUrl(parsedInput.websiteUrl),
      githubUrl: cleanUrl(parsedInput.githubUrl),
      twitterUrl: cleanUrl(parsedInput.twitterUrl),
      discordUrl: cleanUrl(parsedInput.discordUrl),
      dashboardUrl: cleanUrl(parsedInput.dashboardUrl),
      hasDashboard: parsedInput.hasDashboard ?? false,
      totalRaisedUSD: parseNumber(parsedInput.totalRaisedUSD),
      discordRoles: (parsedInput.discordRoles ?? [])
        .map((role) => ({
          role: cleanString(role.role),
          requirement: cleanString(role.requirement),
          perks: cleanString(role.perks)
        }))
        .filter((role): role is { role: string; requirement?: string; perks?: string } => Boolean(role.role)),
      tasks: parsedInput.tasks
    };

    const validated = testnetCreateSchema.parse({
      ...normalizedInput,
      tasks: normalizedInput.tasks
        ? normalizedInput.tasks
            .map((task, index) => {
              const title = cleanString(task.title);
              if (!title) return null;
              const order = parseInteger(task.order);
              return {
                title,
                description: cleanString(task.description),
                url: cleanUrl(task.url),
                reward: cleanString(task.reward),
                order: order ?? index
              };
            })
            .filter(
              (task): task is {
                title: string;
                description?: string;
                url?: string;
                reward?: string;
                order?: number;
              } => Boolean(task)
            )
        : undefined
    });

    const slugInput = parsedInput.slug ? slugify(parsedInput.slug, { lower: true, strict: true }) : null;
    const fallbackSlug = slugify(validated.name, { lower: true, strict: true });

    const clientInfo = getClientInfo(request);

    const result = await prisma.$transaction(async (tx) => {
      let slug = slugInput || fallbackSlug;
      let existing = await tx.testnet.findUnique({ where: { slug } });

      if (!existing) {
        existing = await tx.testnet.findUnique({ where: { name: validated.name } });
        if (existing) {
          slug = existing.slug;
        }
      }

      const { tasks, discordRoles, ...rest } = validated;

      const baseData = {
        ...rest,
        slug,
        discordRoles: discordRoles ?? [],
        tags: rest.tags ?? [],
        categories: rest.categories ?? [],
        highlights: rest.highlights ?? [],
        prerequisites: rest.prerequisites ?? [],
        gettingStarted: rest.gettingStarted ?? []
      };

      const saved = existing
        ? await tx.testnet.update({
            where: { id: existing.id },
            data: baseData
          })
        : await tx.testnet.create({
            data: baseData
          });

      if (tasks !== undefined) {
        await tx.task.deleteMany({ where: { testnetId: saved.id } });
        if (tasks.length) {
          await tx.task.createMany({
            data: tasks.map((task, index) => ({
              ...task,
              order: task.order ?? index,
              testnetId: saved.id
            }))
          });
        }

        await tx.testnet.update({
          where: { id: saved.id },
          data: { tasksCount: tasks.length }
        });
      }

      const fresh = await tx.testnet.findUnique({
        where: { id: saved.id },
        include: { tasks: { orderBy: { order: 'asc' } } }
      });

      if (!fresh) {
        throw new Error('NOT_FOUND');
      }

      return { fresh, slug, existing };
    });

    await Promise.all([revalidateTestnetsList(), revalidateTestnet(result.slug)]);

    await createAuditLog({
      action: result.existing ? 'UPDATE' : 'CREATE',
      resource: 'testnet',
      resourceId: result.fresh.id,
      changes: {
        after: {
          name: result.fresh.name,
          slug: result.fresh.slug,
          network: result.fresh.network,
          status: result.fresh.status
        }
      },
      ...clientInfo
    });

    const responseBody = testnetDetailResponseSchema.parse(serializeTestnetDetail(result.fresh));

    const response = NextResponse.json(responseBody, { status: result.existing ? 200 : 201 });
    response.headers.set('Cache-Tags', `testnets,testnet:${result.slug}`);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'rate_limit') {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'admin_upsert',
        error: error instanceof Error ? error.message : 'unknown'
      })
    );
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
