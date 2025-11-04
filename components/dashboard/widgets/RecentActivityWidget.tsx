'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Clock, User, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'task_completed' | 'task_started' | 'api_call' | 'login';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface RecentActivityWidgetProps {
  userId: string;
}

export function RecentActivityWidget({ userId }: RecentActivityWidgetProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        // TODO: Real API call - GET /api/dashboard/activity
        // const res = await fetch(`/api/dashboard/activity?userId=${userId}&limit=10`);
        // const data = await res.json();
        // setActivities(data.items || []);

        // MOCK DATA - Remove when real API is ready
        await new Promise((resolve) => setTimeout(resolve, 400));
        setActivities(getMockActivities());
      } catch (error) {
        console.error('[RecentActivityWidget] Failed to load activities:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadActivities();
  }, [userId]);

  if (isLoading) {
    return <RecentActivityWidgetSkeleton />;
  }

  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--ink-1)]">Recent Activity</h2>
        <p className="mt-0.5 text-xs text-[var(--ink-3)]">Your latest actions</p>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="mx-auto h-8 w-8 text-[var(--ink-3)]" />
          <p className="mt-2 text-sm text-[var(--ink-3)]">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      {/* TODO: Add "View all activity" link */}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'task_started':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'api_call':
        return <ExternalLink className="h-4 w-4 text-blue-600" />;
      case 'login':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-[var(--ink-3)]" />;
    }
  };

  const getTypeLabel = () => {
    switch (activity.type) {
      case 'task_completed':
        return 'Task completed';
      case 'task_started':
        return 'Task started';
      case 'api_call':
        return 'API call';
      case 'login':
        return 'Login';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/40 bg-white/60 p-3 transition hover:border-white/60 hover:bg-white">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--ink-1)]">{activity.title}</p>
        {activity.description && (
          <p className="mt-0.5 text-[10px] text-[var(--ink-3)]">{activity.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[10px] text-[var(--ink-3)]">{getTypeLabel()}</span>
          <span className="text-[10px] text-[var(--ink-3)]">•</span>
          <span className="text-[10px] text-[var(--ink-3)]">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

function RecentActivityWidgetSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

// TODO: Remove when real API is ready
function getMockActivities(): Activity[] {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'task_completed',
      title: 'Completed "Deploy first contract"',
      description: 'zkSync Era testnet',
      timestamp: new Date(now - 3600000).toISOString(),
      metadata: { testnetSlug: 'zksync-era' }
    },
    {
      id: '2',
      type: 'api_call',
      title: 'API request: GET /api/testnets',
      timestamp: new Date(now - 7200000).toISOString(),
      metadata: { endpoint: '/api/testnets', method: 'GET' }
    },
    {
      id: '3',
      type: 'task_started',
      title: 'Started "Bridge testnet tokens"',
      description: 'Arbitrum Nova testnet',
      timestamp: new Date(now - 10800000).toISOString(),
      metadata: { testnetSlug: 'arbitrum-nova' }
    },
    {
      id: '4',
      type: 'login',
      title: 'Logged in',
      timestamp: new Date(now - 86400000).toISOString()
    }
  ];
}

