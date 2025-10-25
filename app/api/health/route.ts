import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { error } = await supabase.rpc('now');
    if (error) throw error;
    return NextResponse.json({ ok: true, status: 'ok' });
  } catch (e: any) {
    console.error('[health]', e?.message);
    return NextResponse.json({ ok: false, status: 'db_unreachable' }, { status: 503 });
  }
}
