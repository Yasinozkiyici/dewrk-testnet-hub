import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiEndpointSeed } from '@/prisma/seed-content-extended';

export async function GET() {
  try {
    const endpoints = await prisma.apiEndpoint.findMany({
      where: {
        deprecated: false
      },
      orderBy: [
        { category: 'asc' },
        { displayOrder: 'asc' }
      ]
    });

    if (!endpoints.length) {
      return NextResponse.json({ items: apiEndpointSeed });
    }
    return NextResponse.json({ items: endpoints });
  } catch (error) {
    // If tables don't exist yet, return empty array instead of error
    if (error instanceof Error && /does not exist|relation/i.test(error.message)) {
      console.warn('[api/api-endpoints] Tables not created yet, returning seed fallback');
      return NextResponse.json({ items: apiEndpointSeed });
    }
    console.error('[api/api-endpoints]', error);
    return NextResponse.json({ error: 'Failed to fetch API endpoints' }, { status: 500 });
  }
}

