'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  testnetName: string;
  testnetSlug: string;
  title: string;
  status: 'completed' | 'pending' | 'failed';
  completedAt?: string;
  dueDate?: string;
  reward?: string;
}

interface TasksWidgetProps {
  userId: string;
}

export function TasksWidget({ userId }: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        // TODO: Real API call - GET /api/dashboard/tasks
        // const res = await fetch(`/api/dashboard/tasks?userId=${userId}`);
        // const data = await res.json();
        // setTasks(data.items || []);

        // MOCK DATA - Remove when real API is ready
        await new Promise((resolve) => setTimeout(resolve, 500));
        setTasks(getMockTasks());
      } catch (error) {
        console.error('[TasksWidget] Failed to load tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTasks();
  }, [userId]);

  if (isLoading) {
    return <TasksWidgetSkeleton />;
  }

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">My Tasks</h2>
          <p className="mt-1 text-xs text-[var(--ink-3)]">
            {completedCount} completed • {pendingCount} pending
          </p>
        </div>
        {/* TODO: Add filter/sort dropdown */}
      </div>

      {tasks.length === 0 ? (
        <div className="py-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--ink-3)]" />
          <p className="mt-4 text-sm text-[var(--ink-3)]">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* TODO: Add pagination when task count > 10 */}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return 'border-green-500/30 bg-green-50';
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-50';
      case 'failed':
        return 'border-red-500/30 bg-red-50';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition hover:border-white/60 hover:shadow-sm',
        getStatusColor()
      )}
    >
      <div className="flex items-start gap-3 flex-1">
        {getStatusIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--ink-1)]">{task.title}</p>
          <p className="mt-0.5 text-xs text-[var(--ink-3)]">{task.testnetName}</p>
          {task.dueDate && (
            <p className="mt-1 text-[10px] text-[var(--ink-3)]">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {task.reward && (
          <span className="text-xs font-semibold text-[var(--ink-2)]">{task.reward}</span>
        )}
        <a
          href={`/testnets/${task.testnetSlug}`}
          className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/70 px-2 py-1 text-[10px] font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function TasksWidgetSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

// TODO: Remove when real API is ready
function getMockTasks(): Task[] {
  return [
    {
      id: '1',
      testnetName: 'LayerZero Testnet',
      testnetSlug: 'layerzero-testnet',
      title: 'Complete onboarding',
      status: 'completed',
      completedAt: new Date(Date.now() - 86400000).toISOString(),
      reward: '100 Points'
    },
    {
      id: '2',
      testnetName: 'zkSync Era',
      testnetSlug: 'zksync-era',
      title: 'Deploy first contract',
      status: 'pending',
      dueDate: new Date(Date.now() + 259200000).toISOString(),
      reward: '250 Points'
    },
    {
      id: '3',
      testnetName: 'Arbitrum Nova',
      testnetSlug: 'arbitrum-nova',
      title: 'Bridge testnet tokens',
      status: 'pending',
      dueDate: new Date(Date.now() + 604800000).toISOString(),
      reward: '50 Points'
    }
  ];
}

