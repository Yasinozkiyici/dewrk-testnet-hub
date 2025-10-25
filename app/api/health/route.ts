import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      status: 'ok',
      db: 'ok',
      version: process.env.npm_package_version ?? 'dev',
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        level: 'error',
        scope: 'health_check',
        error: error instanceof Error ? error.message : 'unknown'
      })
    );
    return NextResponse.json(
      {
        ok: false,
        status: 'error',
        db: 'unreachable',
        version: process.env.npm_package_version ?? 'dev',
        time: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
