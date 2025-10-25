import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

const getTestnets = unstable_cache(
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dewrk_v_testnets_list')
      .select('*')
      .order('updatedAt', { ascending: false, nullsFirst: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ['testnets'],
  { tags: ['testnets'] }
);

export async function GET() {
  try {
    const data = await getTestnets();
    return NextResponse.json({ items: data });
  } catch (error) {
    console.error('Failed to load testnets', error);
    return NextResponse.json({ error: 'Failed to load testnets' }, { status: 500 });
  }
}
