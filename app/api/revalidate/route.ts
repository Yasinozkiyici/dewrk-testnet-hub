import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const tags = Array.isArray(body?.tags)
      ? (body.tags as string[])
      : body?.tag
        ? [String(body.tag)]
        : [];

    if (!tags.length) {
      return NextResponse.json({ error: 'No tags provided' }, { status: 400 });
    }

    await Promise.all(tags.map((tag) => revalidateTag(tag)));
    return NextResponse.json({ ok: true, tags });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/revalidate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
