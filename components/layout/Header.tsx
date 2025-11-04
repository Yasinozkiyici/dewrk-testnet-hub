'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, User, Menu, LogOut, LogIn } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useStickyHeader } from '@/hooks/useStickyHeader';
import { UtilityStrip } from './UtilityStrip';
import { GlobalSearch } from './GlobalSearch';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

type NavItem = {
  label: string;
  href: Route | string;
  comingSoon?: boolean;
  requiresAdmin?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Testnets', href: '/testnets' as Route },
  { label: 'Ecosystems', href: '/ecosystems' as Route },
  { label: 'Leaderboards', href: '/leaderboards' as Route },
  { label: 'Guides', href: '/guides' as Route },
  { label: 'API', href: '/api' as Route }
];

export function Header() {
  const pathname = usePathname();
  const { isScrolled, isCompact } = useStickyHeader();

  const activeHref = useMemo(() => {
    if (!pathname) return '';
    if (pathname === '/') return '/testnets';
    if (pathname.startsWith('/testnets')) return '/testnets';
    if (pathname.startsWith('/admin')) return '/admin';
    return pathname;
  }, [pathname]);

  const visibleNavItems = useMemo(() => NAV_ITEMS, []);

  return (
    <>
      <UtilityStrip isCompact={isCompact} />
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-white/30 backdrop-blur-sm transition-all duration-150 ease-out',
          isScrolled ? 'shadow-[0_20px_30px_-24px_rgba(15,23,42,0.35)]' : 'shadow-none',
          isCompact ? 'h-[52px]' : 'h-16'
        )}
        style={{ 
          zIndex: 'var(--z-header)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.047) 0%, rgba(255,255,255,0.104) 100%)'
        }}
        data-scrolled={isScrolled ? 'true' : 'false'}
        data-compact={isCompact ? 'true' : 'false'}
      >
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex flex-1 items-center gap-6">
            <Link
              href="/"
              className="inline-flex items-center text-[var(--ink-1)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              aria-label="Dewrk home"
            >
              <Image
                src="/logo.svg"
                alt="Dewrk"
                width={128}
                height={64}
                className={cn('transition-all duration-200 ease-out', isCompact ? 'h-8 w-16' : 'h-10 w-20')}
                priority
              />
            </Link>

            <nav
              aria-label="Primary navigation"
              className={cn('hidden items-center gap-1 lg:flex', isCompact && 'gap-0.5')}
            >
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  isActive={!item.comingSoon && activeHref.startsWith(item.href)}
                />
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <GlobalSearch onResultSelect={() => {}} />

            <div className="hidden items-center gap-2 sm:flex">
              <UserActions />
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-[var(--ink-2)] transition hover:bg-white/70 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const baseClasses =
    'relative inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]';

  if (item.comingSoon) {
    return (
      <span
        className={cn(
          baseClasses,
          'cursor-not-allowed text-[var(--ink-3)] opacity-70',
          'before:absolute before:bottom-1 before:left-1/2 before:h-0.5 before:w-6 before:-translate-x-1/2',
          'before:bg-gradient-to-r before:from-[var(--mint)]/60 before:via-[var(--aqua)]/60 before:to-[var(--lilac)]/60'
        )}
        aria-disabled="true"
        title="Coming soon"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href as Route}
      className={cn(
        baseClasses,
        'after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:-translate-x-1/2',
        'after:bg-[var(--mint)] after:transition-all after:duration-150 after:ease-out',
        isActive
          ? 'text-[var(--ink-1)] after:w-full after:scale-x-100'
          : 'text-[var(--ink-2)] hover:bg-white/70 hover:text-[var(--ink-1)] after:scale-x-0'
      )}
      data-active={isActive}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );
}

function UserActions() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';
  const user = session?.user;
  const isAuthenticated = status === 'authenticated' && Boolean(user);
  const isAdmin = user?.role === 'admin';

  const handleLogin = () => {
    void signIn('google', { callbackUrl: '/dashboard' });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    router.replace('/');
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      {isAuthenticated ? (
        <>
          <Link
            href={('/dashboard' as Route)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white/70 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          >
            <User className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{user?.name ?? 'Dashboard'}</span>
          </Link>
          {isAdmin && (
            <Link
              href={('/admin' as Route)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white/70 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white/70 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white/70 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)] disabled:opacity-60"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign in with Google</span>
        </button>
      )}
    </TooltipProvider>
  );
}
