import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { serializeDetail } from '@/lib/serializers/testnet';

export const revalidate = 60;
export const dynamic = 'force-static';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase.from('dewrk_v_testnet_detail').select('*').eq('slug', params.slug).single();
  if (error || !data) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
  return NextResponse.json(serializeDetail(data));
}
