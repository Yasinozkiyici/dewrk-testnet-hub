'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, User, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '../search/GlobalSearch';

type LinkNavItem = { label: string; href: string; requiresAdmin?: boolean };
type PlaceholderNavItem = { label: string; comingSoon: true };

type NavItem = LinkNavItem | PlaceholderNavItem;

const NAV_ITEMS: NavItem[] = [
  { label: 'Testnets', href: '/testnets' },
  { label: 'Ecosystems', href: '/ecosystems' },
  { label: 'Leaderboards', comingSoon: true },
  { label: 'Learn', href: '/learn' },
  { label: 'API', href: '/api' }
];

const isLinkItem = (item: NavItem): item is LinkNavItem => Object.prototype.hasOwnProperty.call(item, 'href');

export function MainHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const activeHref = useMemo(() => {
    if (!pathname) return '';
    if (pathname === '/') return '/testnets';
    if (pathname.startsWith('/testnets')) return '/testnets';
    if (pathname.startsWith('/ecosystems')) return '/ecosystems';
    if (pathname.startsWith('/learn')) return '/learn';
    if (pathname.startsWith('/api')) return '/api';
    return pathname;
  }, [pathname]);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/30 bg-white transition-all" data-compact={false}>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 transition-all" style={{ height: '3.5rem' }}>
          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          >
            <Image src="/logo.svg" alt="Dewrk" width={100} height={32} className="h-8 w-auto" priority />
          </Link>

          {/* Primary Nav */}
          <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              if (!isLinkItem(item)) {
                return (
                  <span
                    key={item.label}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-[var(--text-3)] cursor-not-allowed"
                  >
                    {item.label}
                    <span className="ml-2 text-[10px] font-medium text-[var(--text-3)] opacity-50">Soon</span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-[var(--mint)] after:transition-transform after:duration-150 after:ease-out',
                    activeHref.startsWith(item.href)
                      ? 'text-[var(--ink-1)] after:scale-x-100'
                      : 'text-[var(--ink-2)] hover:bg-white/90 hover:text-[var(--ink-1)] after:scale-x-0'
                  )}
                  aria-current={activeHref.startsWith(item.href) ? 'page' : undefined}
                  data-active={activeHref.startsWith(item.href)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-white/40 bg-white/80 px-3 text-sm font-medium text-[var(--ink-2)] transition hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-white px-1.5 text-[10px] font-medium text-[var(--text-3)]">
                <Command className="h-3 w-3" />
                K
              </kbd>
            </button>

            {/* Notifications */}
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-white/80 text-[var(--ink-2)] transition hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Profile Menu */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/40 bg-white/80 text-[var(--ink-2)] transition hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                aria-label="Profile menu"
              >
                <User className="h-4 w-4" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/40 bg-white shadow-lg backdrop-blur-sm">
                  <Link
                    href="/dashboard"
                    className="block rounded-t-lg px-4 py-2 text-sm text-[var(--ink-2)] transition hover:bg-white/80 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)]"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-[var(--ink-2)] transition hover:bg-white/80 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)]"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="border-t border-white/30" />
                  <button
                    className="block w-full rounded-b-lg px-4 py-2 text-left text-sm text-[var(--ink-2)] transition hover:bg-white/80 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)]"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Overlay */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

