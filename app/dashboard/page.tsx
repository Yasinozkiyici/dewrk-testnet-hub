import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TasksWidget } from '@/components/dashboard/widgets/TasksWidget';
import { ApiKeyWidget } from '@/components/dashboard/widgets/ApiKeyWidget';
import { RecentActivityWidget } from '@/components/dashboard/widgets/RecentActivityWidget';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // TODO: Real auth check - redirect to login if not authenticated
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <DashboardLayout user={user}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<TasksWidgetSkeleton />}>
            <TasksWidget userId={user.id} />
          </Suspense>
        </div>
        
        <div className="space-y-6">
          <Suspense fallback={<ApiKeyWidgetSkeleton />}>
            <ApiKeyWidget userId={user.id} />
          </Suspense>
          
          <Suspense fallback={<RecentActivityWidgetSkeleton />}>
            <RecentActivityWidget userId={user.id} />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TasksWidgetSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

function ApiKeyWidgetSkeleton() {
  return (
    <div className="h-48 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

function RecentActivityWidgetSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

