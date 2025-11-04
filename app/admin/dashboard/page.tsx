import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

/**
 * Admin Dashboard Overview
 * 
 * Shows:
 * - Recent activity
 * - Statistics
 * - Quick actions
 */

async function checkAdminAuth() {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  const headersList = headers();
  const adminKey = headersList.get('x-admin-key');
  return adminKey && adminKey === process.env.ADMIN_KEY;
}

export default async function AdminDashboardPage() {
  if (!(await checkAdminAuth())) {
    redirect('/');
  }

  // Fetch dashboard stats
  const [testnetsCount, recentTestnets, recentActivity] = await Promise.all([
    prisma.testnet.count(),
    prisma.testnet.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, slug: true, updatedAt: true }
    }),
    // TODO: Fetch from activity log when implemented
    Promise.resolve([])
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-1)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--ink-2)]">Overview of your admin activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-glass">
          <div className="text-sm font-medium text-[var(--ink-2)]">Total Testnets</div>
          <div className="mt-2 text-3xl font-bold text-[var(--ink-1)]">{testnetsCount}</div>
        </div>
        {/* TODO: Add more stats (users, activity, etc.) */}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-glass">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-1)]">
          Recent Testnets
        </h2>
        <div className="mt-4 space-y-2">
          {recentTestnets.map((testnet) => (
            <div
              key={testnet.id}
              className="flex items-center justify-between rounded-lg border border-white/40 bg-white/60 px-4 py-3"
            >
              <div>
                <div className="font-medium text-[var(--ink-1)]">{testnet.name}</div>
                <div className="text-xs text-[var(--ink-2)]">
                  Updated {new Date(testnet.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <a
                href={`/admin/content/testnets?slug=${testnet.slug}`}
                className="text-sm font-medium text-[var(--mint)] hover:underline"
              >
                Edit →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

