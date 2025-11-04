import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchGaActiveUsers, fetchMailchimpSubscriberCount } from '@/lib/growth/analytics';

async function sendReportEmail(subject: string, textContent: string) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.SENDGRID_FROM_EMAIL ?? to;

  if (!apiKey || !to || !from) {
    console.warn('[growth-report] Missing SendGrid configuration, skipping email send');
    return { delivered: false, reason: 'missing_config' as const };
  }

  const body = {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject,
    content: [{ type: 'text/plain', value: textContent }]
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[growth-report] Failed to send email', response.status, errorText);
    return { delivered: false, reason: 'sendgrid_error' as const };
  }

  return { delivered: true as const };
}

function formatPercentage(value: number | null | undefined) {
  if (typeof value !== 'number') return 'n/a';
  return `${value.toFixed(1)}%`;
}

export async function POST() {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const [currentActiveUsers, previousActiveUsers, mailchimpSubscribers, weeklySubscribers, previousSubscribers] = await Promise.all([
      fetchGaActiveUsers({ startDate: '7daysAgo', endDate: 'today' }),
      fetchGaActiveUsers({ startDate: '14daysAgo', endDate: '7daysAgo' }),
      fetchMailchimpSubscriberCount(),
      prisma.newsletterSubscription.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.newsletterSubscription.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } })
    ]);

    const topReferral = await prisma.referral.groupBy({
      by: ['code'],
      _count: { code: true },
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { _count: { code: 'desc' } },
      take: 1
    });

    const discordReferrals = await prisma.referral.count({
      where: { code: 'discord', createdAt: { gte: sevenDaysAgo } }
    });

    const totalVisits = currentActiveUsers ?? 0;
    const conversionRate = totalVisits > 0 ? Number(((discordReferrals / totalVisits) * 100).toFixed(1)) : null;

    const woWActiveUsers = previousActiveUsers && previousActiveUsers > 0 && typeof currentActiveUsers === 'number'
      ? ((currentActiveUsers - previousActiveUsers) / previousActiveUsers) * 100
      : null;

    const woWSubscribers = previousSubscribers > 0
      ? ((weeklySubscribers - previousSubscribers) / previousSubscribers) * 100
      : null;

    const summaryLines = [
      `📈 Active Users: ${currentActiveUsers ?? 'n/a'} (${formatPercentage(woWActiveUsers)})`,
      `💌 New Subscribers: ${weeklySubscribers} (${formatPercentage(woWSubscribers)})`,
      `🔗 Top Source: ${topReferral[0]?.code ?? 'n/a'} (${topReferral[0]?._count.code ?? 0})`,
      `⚙️ Conversion Rate: ${formatPercentage(conversionRate)}`
    ];

    const emailContent = [
      'Dewrk Weekly Growth Report',
      '',
      ...summaryLines,
      '',
      `Total subscribers: ${mailchimpSubscribers ?? 'n/a'}`,
      `Discord referrals (7d): ${discordReferrals}`,
      '',
      `Generated at: ${now.toISOString()}`
    ].join('\n');

    const emailResult = await sendReportEmail('Dewrk Weekly Growth Report', emailContent);

    return NextResponse.json({
      ok: true,
      dailyActiveUsers: currentActiveUsers,
      newsletterSubscribers: mailchimpSubscribers,
      weeklyNewSubscribers: weeklySubscribers,
      topReferral: topReferral[0]?.code ?? null,
      conversionRate,
      emailDelivered: emailResult.delivered
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/growth-report]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
