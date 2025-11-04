import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listGuideSummaries } from '@/lib/content/guides';
import { safeRevalidateTag } from '@/lib/cache';

const GUIDES_TAG = 'guides';

export async function GET() {
  try {
    safeRevalidateTag(GUIDES_TAG);

    const guides = await prisma.guide.findMany({
      where: {
        published: true
      },
      orderBy: [
        { featured: 'desc' },
        { displayOrder: 'asc' },
        { publishedAt: 'desc' }
      ]
    });

    if (guides.length) {
      return NextResponse.json({
        items: guides,
        source: 'prisma',
        timestamp: new Date().toISOString()
      });
    }

    const markdownGuides = await listGuideSummaries();
    if (markdownGuides.length) {
      return NextResponse.json({
        items: markdownGuides.map((guide) => ({
          id: guide.slug,
          slug: guide.slug,
          title: guide.title,
          excerpt: guide.excerpt ?? guide.description ?? guide.bodyPreview,
          author: guide.author ?? 'Dewrk Contributors',
          category: guide.category ?? 'general',
          tags: guide.tags ?? [],
          featured: guide.featured ?? false,
          views: 0,
          readingTime: guide.readingTime ?? Math.max(4, Math.round((guide.bodyPreview?.length ?? 400) / 180)),
          coverImageUrl: guide.coverImageUrl ?? null,
          publishedAt: guide.publishedAt ?? null
        })),
        source: 'markdown',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ items: [], source: 'empty', timestamp: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/guides]', message);
    const markdownGuides = await listGuideSummaries();
    return NextResponse.json({
      items: markdownGuides,
      source: 'markdown',
      timestamp: new Date().toISOString(),
      error: message
    });
  }
}
