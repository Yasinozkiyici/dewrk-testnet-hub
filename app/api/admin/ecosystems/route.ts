import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

const ECOSYSTEMS_TAG = 'ecosystems';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.slug && !body?.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = (body.slug ?? body.name)
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const metadata = (() => {
      if (Array.isArray(body.topProjects) || Array.isArray(body.resources)) {
        return {
          topProjects: body.topProjects ?? undefined,
          resources: body.resources ?? undefined
        };
      }
      if (body.metadata && typeof body.metadata === 'object') {
        return body.metadata;
      }
      return undefined;
    })();

    const ecosystem = await prisma.ecosystem.upsert({
      where: { slug },
      update: {
        name: body.name ?? undefined,
        shortDescription: body.shortDescription ?? undefined,
        description: body.description ?? undefined,
        networkType: body.networkType ?? undefined,
        totalFunding: body.totalFunding ?? undefined,
        totalTestnets: body.totalTestnets ?? undefined,
        activeTestnets: body.activeTestnets ?? undefined,
        metadata
      },
      create: {
        slug,
        name: body.name ?? slug,
        shortDescription: body.shortDescription ?? null,
        description: body.description ?? null,
        networkType: body.networkType ?? 'L2',
        totalFunding: body.totalFunding ?? 0,
        totalTestnets: body.totalTestnets ?? 0,
        activeTestnets: body.activeTestnets ?? 0,
        metadata: metadata ?? {}
      }
    });

    await revalidateTag(ECOSYSTEMS_TAG);
    await revalidateTag('health');
    return NextResponse.json(ecosystem);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/admin/ecosystems]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
