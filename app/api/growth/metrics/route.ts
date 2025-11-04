import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchGaDailyActiveUsers, fetchMailchimpSubscriberCount } from '@/lib/growth/analytics';

export async function GET() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [activeUsers, mailchimpSubscribers, referralsCount, fallbackSubscribers] = await Promise.all([
      fetchGaDailyActiveUsers(),
      fetchMailchimpSubscriberCount(),
      prisma.referral.count({ where: { code: 'discord', createdAt: { gte: sevenDaysAgo } } }),
      prisma.newsletterSubscription.count()
    ]);

    const subscriberCount = mailchimpSubscribers ?? fallbackSubscribers;
    const conversionRate = activeUsers && activeUsers > 0
      ? Number((((referralsCount ?? 0) / activeUsers) * 100).toFixed(1))
      : null;

    return NextResponse.json({
      dailyActiveUsers: activeUsers,
      newsletterSubscribers: subscriberCount,
      discordReferrals: referralsCount,
      conversionRate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/growth/metrics]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
