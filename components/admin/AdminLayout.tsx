'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Activity, 
  Settings, 
  ChevronRight,
  Home,
  Trophy,
  Globe,
  BookOpen,
  Code,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Admin Navigation Structure
 * 
 * Wireframe Notes:
 * - Vertical sidebar (left): Collapsible sections, icons + labels
 * - Breadcrumbs (top): Shows current path hierarchy
 * - Main content (center): Form/table views
 * - Preview panel (right, optional): Live preview for content editors
 */

interface NavSection {
  id: string;
  label: string;
  icon: typeof Home;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: typeof Home;
  badge?: number;
}

const TAB_ITEMS: NavItem[] = [
  { id: 'testnets', label: 'Testnets', href: '/admin?tab=testnets', icon: List },
  { id: 'ecosystems', label: 'Ecosystems', href: '/admin?tab=ecosystems', icon: Globe },
  { id: 'leaderboard', label: 'Leaderboards', href: '/admin?tab=leaderboard', icon: Trophy },
  { id: 'ai-insights', label: 'AI Insights', href: '/admin?tab=ai-insights', icon: Code },
  { id: 'growth', label: 'Growth', href: '/admin?tab=growth', icon: Activity },
  { id: 'guides', label: 'Guides', href: '/admin?tab=guides', icon: BookOpen },
  { id: 'system', label: 'System', href: '/admin?tab=system', icon: Settings },
  { id: 'health', label: 'Health', href: '/admin?tab=health', icon: Users }
];

const NAV_SECTIONS: NavSection[] = [
  {
    id: 'management',
    label: 'Management',
    icon: FileText,
    items: TAB_ITEMS
  }
];

const TAB_LABELS: Record<string, string> = {
  testnets: 'Testnets',
  ecosystems: 'Ecosystems',
  leaderboard: 'Leaderboards',
  'ai-insights': 'AI Insights',
  growth: 'Growth',
  guides: 'Guides',
  system: 'System',
  health: 'Health'
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function generateBreadcrumbs(searchParams: URLSearchParams): BreadcrumbItem[] {
  const tab = searchParams.get('tab') ?? 'testnets';
  const label = TAB_LABELS[tab] ?? 'Dashboard';
  return [{ label: 'Admin', href: '/admin' }, { label }];
}

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<string[]>(['management']);

  const breadcrumbs = generateBreadcrumbs(searchParams);
  const currentTab = searchParams.get('tab') ?? 'testnets';

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    try {
      const url = new URL(href, 'https://dewrk.local');
      const tabParam = url.searchParams.get('tab');
      if (tabParam) {
        return tabParam === currentTab;
      }
    } catch (error) {
      // ignore malformed href
    }
    return false;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-gray-200 bg-white shadow-sm">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-4">
            <Link href="/admin" className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-[var(--mint)]" />
              <span className="text-lg font-bold text-[var(--ink-1)]">Dewrk Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {/* Dashboard Link */}
            <Link
              href="/admin"
              className={cn(
                'mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                pathname === '/admin' || pathname === '/admin/dashboard'
                  ? 'bg-[var(--mint)]/10 text-[var(--ink-1)]'
                  : 'text-[var(--ink-2)] hover:bg-gray-100 hover:text-[var(--ink-1)]'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            {/* Sections */}
            <div className="space-y-1">
              {NAV_SECTIONS.map((section) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections.includes(section.id);
                const hasActiveChild = section.items.some((item) => isActive(item.href));

                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        'w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition',
                        hasActiveChild
                          ? 'bg-[var(--mint)]/10 text-[var(--ink-1)]'
                          : 'text-[var(--ink-2)] hover:bg-gray-100 hover:text-[var(--ink-1)]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className="h-4 w-4" />
                        {section.label}
                      </div>
                      <ChevronRight
                        className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                      />
                    </button>

                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
                        {section.items.map((item) => {
                          const ItemIcon = item.icon;
                          const active = isActive(item.href);

                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              prefetch={false}
                              className={cn(
                                'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition',
                                active
                                  ? 'bg-[var(--mint)]/10 font-medium text-[var(--ink-1)]'
                                  : 'text-[var(--ink-2)] hover:bg-gray-100 hover:text-[var(--ink-1)]'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {ItemIcon && <ItemIcon className="h-3.5 w-3.5" />}
                                {item.label}
                              </div>
                              {item.badge !== undefined && (
                                <span className="rounded-full bg-[var(--mint)]/20 px-2 py-0.5 text-xs font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Breadcrumbs */}
        <div className="border-b border-gray-200 bg-white px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {item.href ? (
                  <Link href={item.href} className="text-[var(--ink-2)] hover:text-[var(--ink-1)]">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-[var(--ink-1)]">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
