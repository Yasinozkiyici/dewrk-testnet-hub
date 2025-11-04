import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ActivityLog } from '@/components/admin/ActivityLog';

/**
 * Admin Activity Log Page
 * 
 * Shows audit trail of all admin actions with filters and search.
 */

async function checkAdminAuth() {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  const headersList = headers();
  const adminKey = headersList.get('x-admin-key');
  return adminKey && adminKey === process.env.ADMIN_KEY;
}

function ActivityLogContent({ filters }: { filters: any }) {
  return <ActivityLog filters={filters} />;
}

export default async function ActivityLogPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (!(await checkAdminAuth())) {
    redirect('/');
  }

  const filters = {
    userId: typeof searchParams.userId === 'string' ? searchParams.userId : undefined,
    resourceType: typeof searchParams.resourceType === 'string' ? searchParams.resourceType : undefined,
    action: typeof searchParams.action === 'string' ? searchParams.action : undefined,
    limit: typeof searchParams.limit === 'string' ? parseInt(searchParams.limit, 10) : 50,
    offset: typeof searchParams.offset === 'string' ? parseInt(searchParams.offset, 10) : 0
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink-1)]">Activity Log</h1>
        <p className="mt-1 text-sm text-[var(--ink-2)]">
          Audit trail of all admin actions and changes
        </p>
      </div>

      <Suspense fallback={<div className="text-[var(--ink-2)]">Loading activity log...</div>}>
        <ActivityLogContent filters={filters} />
      </Suspense>
    </div>
  );
}

