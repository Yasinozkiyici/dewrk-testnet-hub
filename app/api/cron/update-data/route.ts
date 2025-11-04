import { NextResponse } from 'next/server';
import { runDataRefresh } from '@/app/api/jobs/refresh/route';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await runDataRefresh();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}

export async function GET() {
  return POST();
}
