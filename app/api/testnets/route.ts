import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import prisma from '@/lib/db';
import { revalidateTestnetsList } from '@/lib/cache';
import { testnetCreateSchema, testnetDetailResponseSchema, testnetListQuerySchema, testnetListResponseSchema } from '@/lib/zod';
import { adminGuard } from '@/lib/admin-guard';
import { createAuditLog, getClientInfo } from '@/lib/audit-log';
import { serializeTestnetDetail, serializeTestnetListItem } from '@/lib/serializers/testnet';
import { serializeTestnetLite } from '@/lib/serializer';

const LIST_SELECT = {
  slug: true,
  name: true,
  logoUrl: true,
  network: true,
  status: true,
  difficulty: true,
  estTimeMinutes: true,
  rewardType: true,
  rewardNote: true,
  kycRequired: true,
  tags: true,
  tasksCount: true,
  updatedAt: true,
  hasDashboard: true,
  totalRaisedUSD: true,
  twitterUrl: true,
  discordUrl: true,
} as const;

async function getTestnets(params: URLSearchParams) {
  const parsed = testnetListQuerySchema.parse(Object.fromEntries(params.entries()));
  const { q, tag, status, difficulty, page, pageSize } = parsed;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { network: { contains: q, mode: 'insensitive' } },
              { tags: { has: q.toLowerCase() } }
            ]
          }
        : {},
      tag ? { tags: { has: tag } } : {},
      status ? { status } : {},
      difficulty ? { difficulty } : {}
    ]
  } as const;

  const [total, items] = await prisma.$transaction([
    prisma.testnet.count({ where }),
    prisma.testnet.findMany({
      where,
      select: LIST_SELECT,
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return { total, items, page, pageSize };
}

async function ensureSlug(name: string) {
  const base = slugify(name, { lower: true, strict: true });
  let candidate = base;
  let attempts = 0;

  while (true) {
    const existing = await prisma.testnet.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) {
      return candidate;
    }
    attempts += 1;
    candidate = `${base}-${attempts}`;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getTestnets(searchParams);

  // Use contract-compliant serializer
  const payload = result.items.map((item) => serializeTestnetLite(item));

  const body = {
    items: payload,
    page: result.page,
    pageSize: result.pageSize,
    total: result.total
  };

  const response = NextResponse.json(body);
  response.headers.set('Cache-Tags', 'testnets');
  return response;
}

export async function POST(request: NextRequest) {
  // Admin guard
  const guardResponse = adminGuard(request);
  if (guardResponse) return guardResponse;

  const json = await request.json();
  const parsed = testnetCreateSchema.parse(json);

  const { tasks, discordRoles, ...rest } = parsed;
  const slug = await ensureSlug(rest.name);
  const clientInfo = getClientInfo(request);

  const created = await prisma.testnet.create({
    data: {
      ...rest,
      slug,
      discordRoles: discordRoles?.length ? discordRoles : undefined,
      tasks: tasks?.length
        ? {
            create: tasks.map((task, index) => ({
              ...task,
              order: task.order ?? index
            }))
          }
        : undefined
    },
    include: { tasks: true }
  });

  // Audit log
  await createAuditLog({
    action: 'CREATE',
    resource: 'testnet',
    resourceId: created.id,
    changes: {
      after: {
        name: created.name,
        slug: created.slug,
        network: created.network,
        status: created.status
      }
    },
    ...clientInfo
  });

  await revalidateTestnetsList();

  return NextResponse.json(
    testnetDetailResponseSchema.parse(serializeTestnetDetail(created)),
    { status: 201 }
  );
}
