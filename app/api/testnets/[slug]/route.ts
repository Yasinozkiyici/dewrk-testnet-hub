import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { serializeDetail } from '@/lib/serializers/testnet';

function getTestnetDetail(slug: string) {
  return unstable_cache(
    async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('dewrk_v_testnet_detail')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) return null;
      return data;
    },
    ['testnet-detail', slug],
    { tags: [`testnet:${slug}`] }
  )();
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const row = await getTestnetDetail(params.slug);
  if (!row) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
  return NextResponse.json(serializeDetail(row));
}
