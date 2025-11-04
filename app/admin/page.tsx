import { prisma } from '@/lib/prisma';
import { AdminControlPanel } from '@/components/admin/AdminControlPanel';
import { listGuideSummaries } from '@/lib/content/guides';
import { readLatestRefreshLog } from '@/lib/jobs/refresh';
import NewsletterForm from '@/components/newsletter-form';
import { serverGuard } from '@/lib/auth-guards';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const VALID_TABS = new Set([
  'testnets',
  'ecosystems',
  'leaderboard',
  'ai-insights',
  'growth',
  'guides',
  'system',
  'health'
]);

export default async function AdminPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const guard = await serverGuard('admin');
  if (guard.redirect) {
    const target = guard.redirect === '/login'
      ? `/login?redirect=${encodeURIComponent('/admin')}`
      : guard.redirect;
    redirect(target);
  }

  const tabParam = typeof searchParams?.tab === 'string' ? searchParams.tab : undefined;
  const currentTab = tabParam && VALID_TABS.has(tabParam) ? tabParam : 'testnets';
  const safeEcosystems = prisma.ecosystem
    .findMany({
      select: { id: true, name: true, slug: true, networkType: true, totalFunding: true, totalTestnets: true, activeTestnets: true },
      orderBy: { displayOrder: 'asc' }
    })
    .catch(() => [] as any[]);

  const safeLeaderboard = prisma.leaderboard
    .findUnique({
      where: { slug: 'builder-points-all-time' },
      include: { entries: { orderBy: { rank: 'asc' }, take: 12 } }
    })
    .catch(() => null);

  const safeCounts = Promise.all([
    prisma.testnet.count().catch(() => 0),
    prisma.ecosystem.count().catch(() => 0),
    prisma.leaderboardEntry.count().catch(() => 0)
  ]);

  const [testnets, ecosystems, leaderboard, guides, lastLog, metrics] = await Promise.all([
    prisma.testnet.findMany({
      select: { id: true, name: true, slug: true, status: true, rewardType: true, totalRaisedUSD: true },
      orderBy: { updatedAt: 'desc' }
    }),
    safeEcosystems,
    safeLeaderboard,
    listGuideSummaries(),
    readLatestRefreshLog(),
    safeCounts
  ]);

  const metricsSummary = {
    testnets: metrics[0],
    ecosystems: metrics[1],
    leaderboardUsers: metrics[2],
    lastSync: lastLog?.timestamp ?? null,
    lastJobDurationMs: lastLog?.durationMs ?? null
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
      <h1 className="text-2xl font-semibold text-[var(--ink-1)]">Admin Control Center</h1>
      <p className="mt-2 text-sm text-[var(--ink-2)]">
        Manage live datasets, guides, and weekly automation for Dewrk.
      </p>
      <div className="mt-8">
        <AdminControlPanel
          currentTab={currentTab}
          role="admin"
          metrics={metricsSummary}
          testnets={testnets}
          ecosystems={ecosystems}
          leaderboard={(leaderboard?.entries ?? []).map((entry) => ({
            leaderboardSlug: 'builder-points-all-time',
            entityId: entry.entityId,
            entityName: entry.entityName,
            metricValue: Number(entry.metricValue),
            rank: entry.rank,
            source: (entry.metadata as { source?: string })?.source ?? null
          }))}
          guides={guides.map((guide) => ({ slug: guide.slug, title: guide.title }))}
          lastLog={lastLog}
        />
        <div className="mt-8">
          <NewsletterForm
            title="Admin Updates"
            description="Receive internal release notes, incident reviews, and growth experiments."
            buttonLabel="Join Admin List"
            successMessage="You're on the admin update list."
          />
        </div>
      </div>
    </div>
  );
}
