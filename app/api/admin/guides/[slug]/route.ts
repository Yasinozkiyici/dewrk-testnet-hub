import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { promises as fs } from 'fs';
import path from 'path';
import { getGuideBySlug } from '@/lib/content/guides';

const GUIDES_DIR = path.join(process.cwd(), 'content', 'guides');
const GUIDES_TAG = 'guides';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const guide = await getGuideBySlug(params.slug);
    if (!guide) {
      return NextResponse.json({ error: 'GuideNotFound' }, { status: 404 });
    }
    return NextResponse.json({ slug: guide.frontmatter.slug ?? params.slug, content: guide.raw });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/admin/guides/get]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await request.json();
    if (typeof body?.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json({ error: 'ContentMissing' }, { status: 400 });
    }

    await fs.mkdir(GUIDES_DIR, { recursive: true });
    const existing = await getGuideBySlug(params.slug);
    const filePath = existing?.filePath ?? path.join(GUIDES_DIR, `${params.slug}.md`);
    await fs.writeFile(filePath, body.content, 'utf8');
    await revalidateTag(GUIDES_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/admin/guides]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
