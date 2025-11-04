import { NextResponse } from 'next/server';
import { generateInsights } from '@/app/api/insights/route';

export const dynamic = 'force-dynamic';

export async function POST() {
  const payload = await generateInsights();
  return NextResponse.json({ ok: true, ...payload });
}

export async function GET() {
  return POST();
}
