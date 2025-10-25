import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';

let lastCall = 0;
function rateLimit() {
  const now = Date.now();
  if (now - lastCall < 500) throw new Error('rate_limit');
  lastCall = now;
}

function normalise(p: any) {
  const diff = (p.difficulty || '').toLowerCase();
  const map: any = { easy: 'Easy', medium: 'Medium', intermediate: 'Medium', hard: 'Hard' };
  return { ...p, difficulty: map[diff] || p.difficulty, status: (p.status || 'active') };
}

export async function POST(req: Request) {
  try {
    rateLimit();
    const body = normalise(await req.json());
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data, error } = await supabase.from('dewrk_testnets').upsert(
      {
        id: body.id,
        slug: body.slug,
        name: body.name,
        short_description: body.shortDescription,
        network: body.network,
        difficulty: body.difficulty,
        est_time_minutes: body.estTimeMinutes ?? null,
        reward_type: body.rewardType,
        reward_note: body.rewardNote,
        kyc_required: body.kycRequired ?? false,
        requires_wallet: body.requiresWallet ?? true,
        tags: body.tags ?? [],
        categories: body.categories ?? [],
        highlights: body.highlights ?? [],
        prerequisites: body.prerequisites ?? [],
        getting_started: body.gettingStarted ?? [],
        website_url: body.websiteUrl,
        github_url: body.githubUrl,
        twitter_url: body.twitterUrl,
        discord_url: body.discordUrl,
        dashboard_url: body.dashboardUrl,
        has_dashboard: body.hasDashboard ?? false,
        total_raised_usd: body.totalRaisedUSD ? Number(body.totalRaisedUSD) : null,
        logo_url: body.logoUrl,
        hero_image_url: body.heroImageUrl,
        status: body.status ?? 'active'
      },
      { onConflict: 'id' }
    ).select('slug').single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    revalidateTag('testnets');
    revalidateTag(`testnet:${data!.slug}`);
    return NextResponse.json({ ok: true, slug: data!.slug });
  } catch (e: any) {
    if (e?.message === 'rate_limit') return NextResponse.json({ error: 'rate_limit' }, { status: 429 });
    return NextResponse.json({ error: e?.message ?? 'error' }, { status: 500 });
  }
}
