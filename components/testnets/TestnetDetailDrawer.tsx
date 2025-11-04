'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Github, Globe, X, ExternalLink, Rocket, MessageCircle, Trophy, CheckCircle2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestnetDetail } from './TestnetDetail';
import { normalizeTestnetDetail } from './normalize';
import type { TestnetDetailRecord } from './types';
import { ProjectLogo } from '@/components/testnets/ProjectLogo';

interface TestnetDetailDrawerProps {
  slug: string | null;
  open: boolean;
  onClose: () => void;
}

type DrawerState =
  | { status: 'idle'; detail: null; error: null }
  | { status: 'loading'; detail: TestnetDetailRecord | null; error: null }
  | { status: 'loaded'; detail: TestnetDetailRecord; error: null }
  | { status: 'error'; detail: TestnetDetailRecord | null; error: string };

const cache = new Map<string, TestnetDetailRecord>();

export function TestnetDetailDrawer({ slug, open, onClose }: TestnetDetailDrawerProps) {
  const [state, setState] = useState<DrawerState>({ status: 'idle', detail: null, error: null });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;

    if (cache.has(slug)) {
      setState({ status: 'loaded', detail: cache.get(slug)!, error: null });
      return;
    }

    setState((prev) => ({ status: 'loading', detail: prev.detail, error: null }));
    try {
      const response = await fetch(`/api/testnets/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to load testnet');
      }
      const json = await response.json();
      const detail = normalizeTestnetDetail(json);
      cache.set(slug, detail);
      setState({ status: 'loaded', detail, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setState({ status: 'error', detail: null, error: message });
    }
  }, [slug]);

  useEffect(() => {
    if (open && slug) {
      load();
    } else if (!open) {
      setState({ status: 'idle', detail: null, error: null });
    }
  }, [open, slug, load]);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement;
      // ROOT CAUSE FIX: Body scroll'u kapatarak background scroll'u engelliyoruz
      // Drawer içindeki scroll container (panelRef) kendi scroll'unu sağlayacak
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('drawer-open');
      setTimeout(() => {
        panelRef.current?.focus();
      }, 20);
    } else {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('drawer-open');
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('drawer-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const content = useMemo(() => {
    if (!slug) {
      return <div className="p-6 text-sm text-[var(--ink-3)]">Select a testnet to view details.</div>;
    }

    if (state.status === 'loading' && !state.detail) {
      return <DrawerSkeleton />;
    }

    if (state.status === 'error') {
      return (
        <div className="flex flex-col gap-4 p-6 text-sm text-[var(--ink-3)]">
          <p className="font-semibold text-[var(--ink-1)]">Unable to load details.</p>
          <p>{state.error}</p>
          <Button onClick={load} variant="outline" className="w-fit">
            Retry
          </Button>
        </div>
      );
    }

    const detail = state.detail ?? cache.get(slug);
    if (!detail) {
      return <DrawerSkeleton />;
    }

    // Tab-based professional drawer UI
    const websiteUrl = detail.websiteUrl || detail.socials?.website;
    const githubUrl = detail.githubUrl || detail.socials?.github;
    const discordUrl = detail.discordUrl || detail.socials?.discord;
    const dashboardUrl = detail.dashboardUrl;

    return (
      <div className="h-full w-[520px] border-l border-border/40 bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <ProjectLogo
              name={detail.name}
              slug={detail.slug}
              logoUrl={detail.logoUrl}
              websiteUrl={websiteUrl ?? undefined}
              githubUrl={githubUrl ?? undefined}
              size={48}
              roundedClassName="rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{detail.name}</h2>
              <p className="text-xs text-muted-foreground">{detail.network}</p>
            </div>
            {detail.status && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  detail.status === 'LIVE'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {detail.status}
              </span>
            )}
          </div>

          {/* Tabs Navigation */}
          <TabsList className="grid grid-cols-3 gap-2 bg-muted/30 rounded-xl p-1 w-full border-white/30 bg-white/60">
            <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-white/80 data-[state=active]:text-foreground">
              Overview
            </TabsTrigger>
            <TabsTrigger value="rewards" className="text-sm font-medium data-[state=active]:bg-white/80 data-[state=active]:text-foreground">
              Role Rewards
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm font-medium data-[state=active]:bg-white/80 data-[state=active]:text-foreground">
              Testnet Tasks
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0 border-0 bg-transparent p-0">
            <div className="rounded-2xl border border-border/30 bg-white/60 p-5 shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {detail.shortDescription || 'No description available for this testnet.'}
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Reward', detail.rewardType || 'Points'],
                  ['Estimated Time', detail.estTimeMinutes ? `${detail.estTimeMinutes} min` : 'N/A'],
                  ['Tasks', detail.tasksCount ?? 0],
                  ['Faucet', detail.hasFaucet ? 'Available' : 'N/A'],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/20 bg-muted/20 p-4 flex flex-col"
                  >
                    <span className="text-xs uppercase text-muted-foreground tracking-wide mb-1">
                      {label}
                    </span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/20 pt-4 mt-4 flex items-center justify-between">
                <div className="text-sm font-medium">
                  Total Raised:{' '}
                  <span className="ml-1 text-muted-foreground">
                    ${typeof detail.totalRaisedUSD === 'number'
                      ? detail.totalRaisedUSD.toLocaleString()
                      : Number(detail.totalRaisedUSD ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noreferrer" aria-label="Website">
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                  {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                  {dashboardUrl && (
                    <a href={dashboardUrl} target="_blank" rel="noreferrer" aria-label="Dashboard">
                      <Rocket className="h-4 w-4" />
                    </a>
                  )}
                  {discordUrl && (
                    <a href={discordUrl} target="_blank" rel="noreferrer" aria-label="Discord">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Getting Started */}
            {detail.gettingStarted && detail.gettingStarted.length > 0 && (
              <div className="rounded-2xl border border-border/30 bg-gradient-to-b from-white/70 to-white/40 p-5 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">Getting Started</h3>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-muted-foreground">
                  {detail.gettingStarted.map((step, i) => (
                    <li key={i} className="leading-relaxed">
                      {typeof step === 'string' ? step : step.title || step.body || ''}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-4 mt-0 border-0 bg-transparent p-0">
            {detail.discordRoles && detail.discordRoles.length > 0 ? (
              <div className="space-y-3">
                {detail.discordRoles.map((role, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/30 bg-white/60 p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{role.role}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{role.requirement}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">{role.perks}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/30 bg-white/60 p-8 text-center shadow-sm">
                <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No Discord roles found for this testnet.</p>
              </div>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4 mt-0 border-0 bg-transparent p-0">
            {detail.tasks && detail.tasks.length > 0 ? (
              <div className="space-y-3">
                {detail.tasks.map((task, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border/30 bg-white/60 p-4 flex items-start justify-between shadow-sm hover:bg-white/80 transition-all"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      {task.url ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Open
                          </a>
                        </>
                      ) : (
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/30 bg-white/60 p-8 text-center shadow-sm">
                <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No tasks found for this testnet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }, [slug, state, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex" role="dialog" aria-modal="true" style={{ zIndex: 'var(--z-drawer)' }}>
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        style={{ zIndex: 'var(--z-backdrop)' }}
      />
      {/* ROOT CAUSE FIX: Scroll sorunu düzeltildi.
          1. Çift scroll container sorunu: Sadece ana panel'de overflow-y-auto var
          2. Flex scroll sorunu: flex-1 olan içerik div'ine min-h-0 eklenerek flexbox'ın scroll'a izin vermesi sağlandı
          Flexbox'ta flex-1 kullanıldığında, child'ın min-height: 0 olması gerekir ki overflow çalışsın. */}
      <div
        ref={panelRef}
        className="relative ml-auto flex h-full w-full max-w-[520px] max-h-[90vh] flex-col bg-white shadow-2xl focus-visible:outline-none"
        tabIndex={-1}
        style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">Testnet Details</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{content}</div>
      </div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
