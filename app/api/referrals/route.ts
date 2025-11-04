import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    if (parts.length) {
      return parts[0].trim();
    }
  }
  return request.headers.get('x-real-ip') ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawRef = typeof body?.ref === 'string' ? body.ref.trim() : '';

    if (!rawRef) {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
    }

    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent');

    await prisma.referral.create({
      data: {
        code: rawRef,
        ipAddress: ipAddress ?? undefined,
        userAgent: userAgent ?? undefined
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/referrals]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
