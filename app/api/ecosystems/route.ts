import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ECOSYSTEMS } from '@/prisma/ecosystems';
import { safeRevalidateTag } from '@/lib/cache';

const ECOSYSTEMS_TAG = 'ecosystems';

type EcosystemPayload = {
  id?: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  networkType?: string | null;
  totalTestnets: number;
  totalFunding: number;
  activeTestnets: number;
  featured?: boolean;
  displayOrder?: number;
  metadata?: Record<string, unknown> | null;
  updatedAt?: string | null;
};

function mapEcosystem(ecosystem: Awaited<ReturnType<typeof prisma.ecosystem.findFirst>>): EcosystemPayload | null {
  if (!ecosystem) return null;
  return {
    id: ecosystem.id,
    slug: ecosystem.slug,
    name: ecosystem.name,
    shortDescription: ecosystem.shortDescription,
    description: ecosystem.description,
    networkType: ecosystem.networkType,
    totalTestnets: ecosystem.totalTestnets,
    totalFunding: ecosystem.totalFunding ?? 0,
    activeTestnets: ecosystem.activeTestnets,
    featured: ecosystem.featured,
    displayOrder: ecosystem.displayOrder,
    metadata: (ecosystem.metadata as Record<string, unknown> | null) ?? null,
    updatedAt: ecosystem.updatedAt?.toISOString?.() ?? null
  };
}

export async function GET() {
  try {
    safeRevalidateTag(ECOSYSTEMS_TAG);
    const ecosystems = await prisma.ecosystem.findMany({
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' }
      ]
    });

    if (!ecosystems.length) {
      return NextResponse.json({
        items: ECOSYSTEMS,
        source: 'seed',
        timestamp: new Date().toISOString()
      });
    }

    const items = ecosystems
      .map(mapEcosystem)
      .filter((entry): entry is EcosystemPayload => Boolean(entry));

    return NextResponse.json({
      items,
      source: 'prisma',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/ecosystems]', message);
    return NextResponse.json({
      items: ECOSYSTEMS,
      source: 'seed',
      timestamp: new Date().toISOString(),
      error: message
    });
  }
}
