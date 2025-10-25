import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidateTestnet, revalidateTestnetsList } from '@/lib/cache';
import { testnetDetailResponseSchema, testnetUpdateSchema } from '@/lib/zod';
import { adminGuard } from '@/lib/admin-guard';
import { createAuditLog, getClientInfo } from '@/lib/audit-log';
import { serializeTestnetDetail } from '@/lib/serializers/testnet';

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const testnet = await prisma.testnet.findUnique({
    where: { slug: params.slug },
    select: {
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
      shortDescription: true,
      highlights: true,
      prerequisites: true,
      gettingStarted: true,
      websiteUrl: true,
      githubUrl: true,
      dashboardUrl: true,
      discordRoles: true,
      tasks: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          url: true,
          reward: true,
          order: true,
          createdAt: true,
          updatedAt: true
        }
      }
    },
  });

  if (!testnet) {
    return NextResponse.json({ error: 'NotFound' }, { status: 404 });
  }

  // Use contract-compliant serializer
  const serializedData = serializeTestnetDetail(testnet);
  
  const response = NextResponse.json(serializedData);
  response.headers.set('Cache-Tags', `testnets,testnet:${params.slug}`);
  return response;
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  // Admin guard
  const guardResponse = adminGuard(request);
  if (guardResponse) return guardResponse;

  const json = await request.json();
  const parsed = testnetUpdateSchema.parse(json);
  const clientInfo = getClientInfo(request);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.testnet.findUnique({ where: { slug: params.slug } });
      if (!existing) {
        throw new Error('NOT_FOUND');
      }

      const { tasks, discordRoles, ...rest } = parsed;

      const data = {
        ...rest,
        tags: rest.tags !== undefined ? rest.tags : undefined,
        categories: rest.categories !== undefined ? rest.categories : undefined,
        highlights: rest.highlights !== undefined ? rest.highlights : undefined,
        prerequisites: rest.prerequisites !== undefined ? rest.prerequisites : undefined,
        gettingStarted: rest.gettingStarted !== undefined ? rest.gettingStarted : undefined,
        discordRoles: discordRoles !== undefined ? discordRoles : undefined
      };

      const saved = await tx.testnet.update({
        where: { slug: params.slug },
        data
      });

      if (tasks) {
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
      }

      return { saved, existing };
    });

    // Audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'testnet',
      resourceId: updated.saved.id,
      changes: {
        before: {
          name: updated.existing.name,
          status: updated.existing.status,
          network: updated.existing.network
        },
        after: {
          name: updated.saved.name,
          status: updated.saved.status,
          network: updated.saved.network
        },
        fields: Object.keys(parsed)
      },
      ...clientInfo
    });

    const fresh = await prisma.testnet.findUnique({
      where: { slug: params.slug },
      include: { tasks: { orderBy: { order: 'asc' } } }
    });

    if (!fresh) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await Promise.all([revalidateTestnetsList(), revalidateTestnet(params.slug)]);

    return NextResponse.json(
      testnetDetailResponseSchema.parse(serializeTestnetDetail(fresh))
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.testnet.delete({ where: { slug: params.slug } });
    await Promise.all([revalidateTestnetsList(), revalidateTestnet(params.slug)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
