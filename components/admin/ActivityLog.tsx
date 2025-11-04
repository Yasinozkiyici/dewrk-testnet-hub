'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Activity, User, FileText, Trash2, Edit, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityLogEntry {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changes?: Record<string, { old: any; new: any }>;
  createdAt: string;
}

interface ActivityLogProps {
  filters?: {
    userId?: string;
    resourceType?: string;
    action?: string;
    limit?: number;
    offset?: number;
  };
}

const ACTION_ICONS = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  publish: FileText,
  unpublish: FileText
};

const ACTION_COLORS = {
  create: 'text-green-600',
  update: 'text-blue-600',
  delete: 'text-red-600',
  publish: 'text-purple-600',
  unpublish: 'text-gray-600'
};

export function ActivityLog({ filters: initialFilters }: ActivityLogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    resourceType: initialFilters?.resourceType || searchParams.get('resourceType') || '',
    action: initialFilters?.action || searchParams.get('action') || '',
    search: ''
  });

  useEffect(() => {
    fetchActivities();
  }, [filters.resourceType, filters.action]);

  async function fetchActivities() {
    setIsLoading(true);
    try {
      // TODO: Fetch from API when implemented
      // const response = await fetch(`/api/admin/activity?${new URLSearchParams({
      //   resourceType: filters.resourceType,
      //   action: filters.action,
      //   limit: '50',
      //   offset: '0'
      // })}`);
      // const data = await response.json();
      // setActivities(data.items);

      // Mock data for now
      setActivities([]);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/activity?${params.toString()}`);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const filteredActivities = activities.filter((activity) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        activity.resourceName?.toLowerCase().includes(searchLower) ||
        activity.userName?.toLowerCase().includes(searchLower) ||
        activity.userEmail?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl border border-white/40 bg-white/80 p-4 shadow-glass">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Resource Type
            </label>
            <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange('resourceType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All resources</SelectItem>
                <SelectItem value="testnet">Testnets</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="guide">Guides</SelectItem>
                <SelectItem value="leaderboard">Leaderboards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Action
            </label>
            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="publish">Publish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-1)]">
              Search
            </label>
            <Input
              placeholder="Search by name, user..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="rounded-2xl border border-white/40 bg-white/80 shadow-glass">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--ink-2)]">Loading...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-[var(--ink-2)]">No activity found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredActivities.map((activity) => {
              const ActionIcon = ACTION_ICONS[activity.action] || Activity;
              const actionColor = ACTION_COLORS[activity.action] || 'text-gray-600';

              return (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 ${actionColor}`}>
                      <ActionIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--ink-1)]">
                          {activity.userName || activity.userEmail || 'Unknown User'}
                        </span>
                        <span className="text-xs text-[var(--ink-2)]">
                          {activity.action}ed{' '}
                          {activity.resourceType === 'testnet' ? 'testnet' : activity.resourceType}
                        </span>
                        {activity.resourceName && (
                          <span className="text-xs font-medium text-[var(--ink-1)]">
                            {activity.resourceName}
                          </span>
                        )}
                      </div>
                      {activity.changes && Object.keys(activity.changes).length > 0 && (
                        <div className="mt-2 text-xs text-[var(--ink-2)]">
                          Changed: {Object.keys(activity.changes).join(', ')}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-[var(--ink-3)]">{formatDate(activity.createdAt)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

