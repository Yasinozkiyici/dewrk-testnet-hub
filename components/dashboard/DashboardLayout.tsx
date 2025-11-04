'use client';

import React from 'react';
import { LayoutDashboard, Settings, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth';

interface DashboardLayoutProps {
  user: AuthUser;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--ink-3)]">
              Welcome back, {user.email || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold',
                user.role === 'admin'
                  ? 'bg-red-500/20 text-red-700'
                  : user.role === 'contributor'
                    ? 'bg-blue-500/20 text-blue-700'
                    : 'bg-gray-500/20 text-gray-700'
              )}
            >
              {user.role.toUpperCase()}
            </span>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav className="space-y-1 rounded-2xl border border-white/40 bg-white/70 p-4 shadow-glass">
            <NavLink href="/dashboard" icon={LayoutDashboard} label="Overview" />
            <NavLink href="/dashboard/tasks" icon={LayoutDashboard} label="My Tasks" />
            {user.role === 'admin' && (
              <NavLink href="/admin" icon={User} label="Admin Panel" />
            )}
            <NavLink href="/dashboard/settings" icon={Settings} label="Settings" />
            <NavLink href="/logout" icon={LogOut} label="Logout" />
          </nav>
        </aside>

        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href as Route}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--ink-2)] transition hover:bg-white/60 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

