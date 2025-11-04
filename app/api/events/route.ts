import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();// may throw
    const eventName = typeof body?.eventName === 'string' ? body.eventName.trim() : '';
    if (!eventName) {
      return NextResponse.json({ error: 'Missing eventName' }, { status: 400 });
    }
    const payload = body?.payload ?? null;
    const referrer = typeof body?.referrer === 'string' ? body.referrer : request.headers.get('referer');

    await prisma.userEvent.create({
      data: {
        eventName,
        payload,
        referrer: referrer ?? undefined,
        metadata: {
          userAgent: request.headers.get('user-agent') ?? undefined
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/events]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
