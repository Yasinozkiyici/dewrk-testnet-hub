import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toAdminTestnetRecord } from '@/lib/admin/testnet-record';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const testnet = await prisma.testnet.findUnique({
      where: { slug },
      include: { tasks: { orderBy: { order: 'asc' } } }
    });

    if (!testnet) {
      return NextResponse.json({ error: 'TestnetNotFound' }, { status: 404 });
    }

    return NextResponse.json({
      testnet: toAdminTestnetRecord(testnet),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/admin/testnets/[slug]]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
