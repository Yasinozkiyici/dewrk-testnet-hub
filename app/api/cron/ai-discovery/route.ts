import { NextResponse } from 'next/server';
import { runAiDiscovery } from '@/app/api/ai-discovery/route';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = await runAiDiscovery();
  return NextResponse.json(result);
}

export async function GET() {
  return POST();
}
