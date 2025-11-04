'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Editor } from '@/app/admin/Editor';
import type { AdminTestnetRecord, AdminTestnetUpdatePayload } from '@/lib/admin/testnet-editor-helpers';
import { useRouter } from 'next/navigation';

type TestnetSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  rewardType: string | null;
  totalRaisedUSD: number | null;
};

type EcosystemSummary = {
  id: string;
  name: string;
  slug: string;
  networkType: string | null;
  totalFunding: number | null;
  totalTestnets: number;
  activeTestnets: number;
};

type LeaderboardSummary = {
  leaderboardSlug: string;
  entityId: string;
  entityName: string;
  metricValue: number;
  rank: number;
  source?: string | null;
};

type GuideSummary = {
  slug: string;
  title: string;
};

type MetricsSummary = {
  testnets: number;
  ecosystems: number;
  leaderboardUsers: number;
  lastSync: string | null;
  lastJobDurationMs: number | null;
};

type HealthSnapshot = {
  ok: boolean;
  status: string;
  lastSync: string | null;
  testnets: number;
  ecosystems: number;
  leaderboardUsers: number;
  timestamp: string;
  lastJobDurationMs: number | null;
};

type GrowthMetrics = {
  dailyActiveUsers: number | null;
  newsletterSubscribers: number | null;
  discordReferrals: number | null;
  conversionRate: number | null;
  fetchedAt: string | null;
};

type AiInsightsPayload = {
  topCategory: string | null;
  emergingProjects: Array<{ name: string; category?: string | null; summary?: string | null; slug?: string; sourceUrl?: string | null }>;
  userCorrelation: Array<{ source: string; related: string[] }>;
  forYou: Array<{ name: string; slug: string; reason: string }>;
  timestamp: string;
};

type AiDiscoveryItem = {
  name: string;
  slug: string;
  category?: string | null;
  summary?: string | null;
  sourceUrl?: string | null;
  createdAt: string;
};

interface AdminControlPanelProps {
  currentTab: string;
  role?: 'admin' | 'editor' | 'viewer';
  metrics: MetricsSummary;
  testnets: TestnetSummary[];
  ecosystems: EcosystemSummary[];
  leaderboard: LeaderboardSummary[];
  guides: GuideSummary[];
  lastLog: { timestamp: string; durationMs: number | null } | null;
}

export function AdminControlPanel({
  currentTab,
  role = 'admin',
  metrics,
  testnets: initialTestnets,
  ecosystems: initialEcosystems,
  leaderboard: initialLeaderboard,
  guides,
  lastLog
}: AdminControlPanelProps) {
  const { toasts, removeToast, success, error } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(currentTab);
  const [testnets, setTestnets] = useState<TestnetSummary[]>(initialTestnets);
  const [ecosystems, setEcosystems] = useState<EcosystemSummary[]>(initialEcosystems);
  const [leaderboard, setLeaderboard] = useState<LeaderboardSummary[]>(initialLeaderboard);
  const [selectedTestnetSlug, setSelectedTestnetSlug] = useState<string | null>(null);
  const [editorData, setEditorData] = useState<AdminTestnetRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemSummary | null>(initialEcosystems[0] ?? null);
  const [editEcosystem, setEditEcosystem] = useState(() =>
    initialEcosystems[0] ? { ...initialEcosystems[0] } : null
  );
  const [selectedGuide, setSelectedGuide] = useState<string | null>(guides[0]?.slug ?? null);
  const [guideContent, setGuideContent] = useState<string>('');
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [isGrowthLoading, setIsGrowthLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<AiInsightsPayload | null>(null);
  const [aiDiscoveries, setAiDiscoveries] = useState<AiDiscoveryItem[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDiscoveryRunning, setIsDiscoveryRunning] = useState(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);
  const [isSavingGuide, setIsSavingGuide] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as HealthSnapshot;
        setHealth(data);
      }
    } catch (err) {
      console.warn('Failed to load health status', err);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const loadGuide = useCallback(async (slug: string) => {
    setIsGuideLoading(true);
    try {
      const res = await fetch(`/api/admin/guides/${slug}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setGuideContent(data.content ?? '');
      } else {
        setGuideContent('');
        error('Failed to load guide', `${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load guide');
    } finally {
      setIsGuideLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (selectedGuide) {
      void loadGuide(selectedGuide);
    }
  }, [selectedGuide, loadGuide]);

  const fetchGrowth = useCallback(async () => {
    setIsGrowthLoading(true);
    try {
      const res = await fetch('/api/growth/metrics', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const payload = await res.json();
        setGrowthMetrics({
          dailyActiveUsers: typeof payload.dailyActiveUsers === 'number' ? payload.dailyActiveUsers : null,
          newsletterSubscribers: typeof payload.newsletterSubscribers === 'number' ? payload.newsletterSubscribers : null,
          discordReferrals: typeof payload.discordReferrals === 'number' ? payload.discordReferrals : null,
          conversionRate: typeof payload.conversionRate === 'number' ? payload.conversionRate : null,
          fetchedAt: typeof payload.timestamp === 'string' ? payload.timestamp : null
        });
      }
    } catch (err) {
      console.warn('Failed to load growth metrics', err);
    } finally {
      setIsGrowthLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrowth();
    const interval = setInterval(fetchGrowth, 60000);
    return () => clearInterval(interval);
  }, [fetchGrowth]);

  const fetchAiInsights = useCallback(async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/insights', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const payload = (await res.json()) as AiInsightsPayload;
        setAiInsights(payload);
      }
    } catch (err) {
      console.warn('Failed to load AI insights', err);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const fetchAiDiscoveries = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-discovery', { cache: 'no-store', credentials: 'include' });
      if (res.ok) {
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : [];
        setAiDiscoveries(
          items.map((item: any) => ({
            name: item.name,
            slug: item.slug,
            category: item.category ?? null,
            summary: item.summary ?? item.metadata?.description ?? null,
            sourceUrl: item.sourceUrl ?? item.metadata?.sourceUrl ?? null,
            createdAt: item.createdAt ?? new Date().toISOString()
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to load AI discoveries', err);
    }
  }, []);

  useEffect(() => {
    fetchAiInsights();
    fetchAiDiscoveries();
    const interval = setInterval(fetchAiInsights, 60000);
    return () => clearInterval(interval);
  }, [fetchAiInsights, fetchAiDiscoveries]);

  const loadTestnetDetail = useCallback(
    async (slug: string) => {
      setIsEditorLoading(true);
      setEditorError(null);
       setEditorData(null);
      try {
        const res = await fetch(`/api/admin/testnets/${slug}`, {
          cache: 'no-store',
          credentials: 'include'
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Failed to load ${slug}`);
        }
        const payload = await res.json();
        setEditorData(payload.testnet as AdminTestnetRecord);
      } catch (err) {
        console.error(err);
        setEditorError(err instanceof Error ? err.message : 'Failed to load testnet');
        error('Testnet detayları yüklenemedi', err instanceof Error ? err.message : undefined);
      } finally {
        setIsEditorLoading(false);
      }
    },
    [error]
  );

  const handleTestnetEdit = useCallback(
    (slug: string) => {
      const summary = testnets.find((entry) => entry.slug === slug) ?? null;
      setSelectedTestnetSlug(slug);
      setIsEditorOpen(true);
      void loadTestnetDetail(slug);
    },
    [loadTestnetDetail, testnets]
  );

  const handleCreateTestnet = useCallback(() => {
    setSelectedTestnetSlug(null);
    setEditorData(null);
    setEditorError(null);
    setIsEditorLoading(false);
    setIsEditorOpen(true);
  }, []);

  const handleTestnetSaved = useCallback(
    ({
      slug,
      payload,
      response,
      previousSlug
    }: {
      slug: string;
      payload: AdminTestnetUpdatePayload;
      response: any;
      previousSlug: string | null;
    }) => {
      const nextSlug = typeof response?.slug === 'string' ? response.slug : slug;
      const nextName = typeof response?.name === 'string' ? response.name : payload.name;
      const summary: TestnetSummary = {
        id: typeof response?.id === 'string' ? response.id : nextSlug,
        name: nextName,
        slug: nextSlug,
        status: (response?.status ?? payload.status ?? 'UPCOMING') as string,
        rewardType: typeof response?.rewardType === 'string' ? response.rewardType : payload.rewardType ?? null,
        totalRaisedUSD:
          typeof response?.totalRaisedUSD === 'number'
            ? response.totalRaisedUSD
            : typeof payload.totalRaisedUSD === 'number'
              ? payload.totalRaisedUSD
              : null
      };

      setTestnets((prev) => {
        const targetSlug = previousSlug ?? summary.slug;
        const oldIndex = prev.findIndex((item) => item.slug === targetSlug);
        const filtered = prev.filter(
          (item) => item.slug !== targetSlug && item.slug !== summary.slug
        );
        if (oldIndex >= 0) {
          const copy = [...filtered];
          copy.splice(Math.min(oldIndex, copy.length), 0, summary);
          return copy;
        }
        return [summary, ...filtered];
      });

      setSelectedTestnetSlug(summary.slug);
      setIsEditorOpen(true);
      void loadTestnetDetail(summary.slug);
    },
    [loadTestnetDetail, setTestnets]
  );

  const handleEcosystemSelect = (slug: string) => {
    const match = ecosystems.find((entry) => entry.slug === slug) ?? null;
    setSelectedEcosystem(match);
    setEditEcosystem(match ? { ...match } : null);
  };

  const handleEcosystemSave = async () => {
    if (!editEcosystem) return;
    startTransition(async () => {
      try {
        const payload = {
          slug: editEcosystem.slug,
          name: editEcosystem.name,
          networkType: editEcosystem.networkType,
          totalFunding: Number(editEcosystem.totalFunding ?? 0),
          totalTestnets: Number(editEcosystem.totalTestnets ?? 0),
          activeTestnets: Number(editEcosystem.activeTestnets ?? 0)
        };
        const res = await fetch('/api/admin/ecosystems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Unknown error');
        }
        const updated = await res.json();
        setEcosystems((prev) =>
          prev.map((item) => (item.slug === updated.slug ? {
            id: item.id,
            name: updated.name,
            slug: updated.slug,
            networkType: updated.networkType,
            totalFunding: updated.totalFunding,
            totalTestnets: updated.totalTestnets,
            activeTestnets: updated.activeTestnets
          } : item))
        );
        success('Ecosystem saved', `${updated.name} updated successfully`);
      } catch (err) {
        console.error(err);
        error('Failed to save ecosystem', err instanceof Error ? err.message : undefined);
      }
    });
  };

  const handleRunAiDiscovery = async () => {
    setIsDiscoveryRunning(true);
    try {
      const res = await fetch('/api/ai-discovery', { method: 'POST', credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Discovery failed');
      }
      success('AI discovery completed', `${data.added ?? 0} new projects queued`);
      fetchAiDiscoveries();
      fetchAiInsights();
    } catch (err) {
      console.error(err);
      error('Failed to run AI discovery', err instanceof Error ? err.message : undefined);
    } finally {
      setIsDiscoveryRunning(false);
    }
  };

  const handleRefreshInsights = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/insights', { method: 'POST', credentials: 'include' });
      const payload = (await res.json().catch(() => ({}))) as Partial<AiInsightsPayload> & { error?: string };
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Insight refresh failed');
      }
      setAiInsights(payload as AiInsightsPayload);
      success('Insights refreshed');
    } catch (err) {
      console.error(err);
      error('Failed to refresh insights', err instanceof Error ? err.message : undefined);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCronInsightRefresh = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/cron/insight-refresh', { method: 'POST', credentials: 'include' });
      const payload = (await res.json().catch(() => ({}))) as Partial<AiInsightsPayload> & { error?: string };
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Cron refresh failed');
      }
      setAiInsights(payload as AiInsightsPayload);
      success('Cron insights run complete');
    } catch (err) {
      console.error(err);
      error('Failed to trigger insight cron', err instanceof Error ? err.message : undefined);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLeaderboardSave = async (entry: LeaderboardSummary, metricValue: number) => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/leaderboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leaderboardSlug: entry.leaderboardSlug,
            entityId: entry.entityId,
            entityName: entry.entityName,
            metricValue,
            rank: entry.rank
          }),
          credentials: 'include'
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? 'Unknown error');
        }
        setLeaderboard((prev) =>
          prev.map((item) =>
            item.entityId === entry.entityId
              ? { ...item, metricValue }
              : item
          )
        );
        success('Leaderboard updated', `${entry.entityName} now has ${metricValue} pts`);
      } catch (err) {
        console.error(err);
        error('Failed to update leaderboard', err instanceof Error ? err.message : undefined);
      }
    });
  };

  const handleCronTrigger = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/cron/update-data', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? 'Unknown error');
      }
      success('Refresh job triggered', `${data.testnetsUpdated} testnets processed`);
      fetchHealth();
    } catch (err) {
      console.error(err);
      error('Failed to trigger refresh', err instanceof Error ? err.message : undefined);
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleGuideSave = async () => {
    if (!selectedGuide) return;
    setIsSavingGuide(true);
    try {
      const res = await fetch(`/api/admin/guides/${selectedGuide}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: guideContent }),
        credentials: 'include'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Unknown error');
      }
      success('Guide saved', `${selectedGuide} updated successfully`);
    } catch (err) {
      console.error(err);
      error('Failed to save guide', err instanceof Error ? err.message : undefined);
    } finally {
      setIsSavingGuide(false);
    }
  };

  const lastSyncLabel = useMemo(() => {
    const ts = health?.lastSync ?? metrics.lastSync ?? lastLog?.timestamp;
    if (!ts) return 'n/a';
    return new Date(ts).toLocaleString();
  }, [health?.lastSync, metrics.lastSync, lastLog?.timestamp]);

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      router.replace(`/admin?tab=${value}`, { scroll: false });
    },
    [router]
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total Testnets" value={metrics.testnets} caption="Live records" />
        <MetricCard label="Ecosystems" value={metrics.ecosystems} caption="Tracked verticals" />
        <MetricCard label="Leaderboard Users" value={metrics.leaderboardUsers} caption="Active contributors" />
        <MetricCard label="Last Sync" value={lastSyncLabel} caption={metrics.lastJobDurationMs ? `Cron ${metrics.lastJobDurationMs}ms` : 'Cron window'} large />
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="rounded-3xl border border-white/30 bg-white/60 p-6 shadow-glass">
        <TabsList className="mb-6 grid w-full grid-cols-3 sm:grid-cols-8 gap-2">
          <TabsTrigger value="testnets">Testnets</TabsTrigger>
          <TabsTrigger value="ecosystems">Ecosystems</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="guides">Guides</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="testnets" className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Testnet Yönetimi</h3>
              <p className="text-xs text-[var(--ink-2)]">Kayıtları düzenleyin veya yeni testnet ekleyin.</p>
            </div>
            <Button onClick={handleCreateTestnet} variant="outline" size="sm">
              + Yeni Testnet
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Funding (USD)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testnets.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    'hover:bg-white/70 transition cursor-pointer',
                    selectedTestnetSlug === item.slug && 'bg-[var(--mint)]/10'
                  )}
                  onClick={() => handleTestnetEdit(item.slug)}
                >
                  <TableCell className="font-medium text-[var(--ink-1)]">{item.name}</TableCell>
                  <TableCell className="uppercase tracking-wide text-xs text-[var(--ink-3)]">{item.status}</TableCell>
                  <TableCell>{item.rewardType ?? '—'}</TableCell>
                  <TableCell>${Number(item.totalRaisedUSD ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleTestnetEdit(item.slug);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isEditorOpen ? (
            <div className="space-y-6">
              {isEditorLoading ? (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                  <Skeleton className="h-[720px] rounded-3xl" />
                  <Skeleton className="h-[720px] rounded-3xl" />
                </div>
              ) : editorError ? (
                <div className="rounded-3xl border border-red-200 bg-red-50/80 p-6 text-sm text-red-700">
                  {editorError}
                </div>
              ) : (
                <Editor initialTestnet={editorData} onSaved={handleTestnetSaved} />
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center text-sm text-[var(--ink-3)]">
              Düzenlemek için bir testnet seçin veya yeni bir testnet oluşturun.
            </div>
          )}
        </TabsContent>

        <TabsContent value="ecosystems" className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Funding</TableHead>
                <TableHead>Active / Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ecosystems.map((item) => (
                <TableRow key={item.id} className={cn('hover:bg-white/70 transition', selectedEcosystem?.slug === item.slug && 'bg-[var(--mint)]/10')}>
                  <TableCell className="font-medium text-[var(--ink-1)]">{item.name}</TableCell>
                  <TableCell>{item.networkType ?? '—'}</TableCell>
                  <TableCell>${Number(item.totalFunding ?? 0).toLocaleString()}</TableCell>
                  <TableCell>{item.activeTestnets} / {item.totalTestnets}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleEcosystemSelect(item.slug)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editEcosystem ? (
            <div className="grid gap-4 md:grid-cols-5">
              <Input
                value={editEcosystem.name}
                onChange={(e) => setEditEcosystem({ ...editEcosystem, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={editEcosystem.networkType ?? ''}
                onChange={(e) => setEditEcosystem({ ...editEcosystem, networkType: e.target.value })}
                placeholder="Network type"
              />
              <Input
                type="number"
                value={editEcosystem.totalFunding ?? 0}
                onChange={(e) => setEditEcosystem({ ...editEcosystem, totalFunding: Number(e.target.value) })}
                placeholder="Funding"
              />
              <Input
                type="number"
                value={editEcosystem.totalTestnets}
                onChange={(e) => setEditEcosystem({ ...editEcosystem, totalTestnets: Number(e.target.value) })}
                placeholder="Total"
              />
              <Input
                type="number"
                value={editEcosystem.activeTestnets}
                onChange={(e) => setEditEcosystem({ ...editEcosystem, activeTestnets: Number(e.target.value) })}
                placeholder="Active"
              />
              <div className="md:col-span-5 flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => setEditEcosystem(selectedEcosystem ? { ...selectedEcosystem } : null)} disabled={isPending}>
                  Reset
                </Button>
                <Button onClick={handleEcosystemSave} disabled={isPending || role === 'viewer'}>
                  {isPending ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Contributor</TableHead>
                <TableHead>Metric</TableHead>
                <TableHead className="text-right">Adjust</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((item) => (
                <TableRow key={`${item.leaderboardSlug}-${item.entityId}`}>
                  <TableCell>{item.rank}</TableCell>
                  <TableCell>
                    <div className="font-medium text-[var(--ink-1)]">{item.entityName}</div>
                    <div className="text-[10px] uppercase tracking-wide text-[var(--ink-3)]">{item.source ?? item.leaderboardSlug}</div>
                  </TableCell>
                  <TableCell>{item.metricValue}</TableCell>
                  <TableCell className="text-right">
                    <LeaderboardEditor entry={item} onSave={handleLeaderboardSave} disabled={isPending || role === 'viewer'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">AI Insights</h3>
              <p className="mt-1 text-xs text-[var(--ink-2)]">Trend detection, new testnets, and behavioural correlations.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleRunAiDiscovery} disabled={isDiscoveryRunning || role === 'viewer'}>
                {isDiscoveryRunning ? 'Discovering…' : 'Run Discovery'}
              </Button>
              <Button size="sm" onClick={handleRefreshInsights} disabled={isAiLoading || role === 'viewer'}>
                {isAiLoading ? 'Refreshing…' : 'Refresh Insights'}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border border-white/30 bg-white/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[var(--ink-2)]">Trending Category</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-[var(--ink-1)]">{aiInsights?.topCategory ?? '—'}</p>
                <p className="mt-1 text-xs text-[var(--ink-3)]">Most joined in the last 14 days</p>
              </CardContent>
            </Card>

            <Card className="border border-white/30 bg-white/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[var(--ink-2)]">New Testnets Detected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiDiscoveries.slice(0, 3).map((item) => (
                  <div key={item.slug} className="text-sm">
                    <p className="font-semibold text-[var(--ink-1)]">{item.name}</p>
                    <p className="text-xs text-[var(--ink-3)]">{item.category ?? 'Uncategorised'}</p>
                  </div>
                ))}
                {aiDiscoveries.length === 0 && <p className="text-sm text-[var(--ink-3)]">No new candidates yet.</p>}
              </CardContent>
            </Card>

            <Card className="border border-white/30 bg-white/70 md:col-span-2 xl:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[var(--ink-2)]">User Correlations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(aiInsights?.userCorrelation ?? []).slice(0, 3).map((item) => (
                  <div key={item.source} className="text-sm">
                    <p className="font-semibold text-[var(--ink-1)]">{item.source}</p>
                    <p className="text-xs text-[var(--ink-3)]">Also viewed: {item.related.join(', ') || '—'}</p>
                  </div>
                ))}
                {!aiInsights?.userCorrelation?.length && <p className="text-sm text-[var(--ink-3)]">Not enough event data yet.</p>}
              </CardContent>
            </Card>

            <Card className="border border-white/30 bg-white/70 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-[var(--ink-2)]">Suggested Additions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(aiInsights?.forYou ?? []).slice(0, 4).map((item) => (
                  <div key={item.slug} className="rounded-xl border border-white/40 bg-white/70 p-3 text-sm">
                    <p className="font-semibold text-[var(--ink-1)]">{item.name}</p>
                    <p className="text-xs text-[var(--ink-3)]">{item.reason}</p>
                  </div>
                ))}
                {!aiInsights?.forYou?.length && <p className="text-sm text-[var(--ink-3)]">No personalised suggestions yet.</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Growth Overview</h3>
              <p className="mt-1 text-xs text-[var(--ink-2)]">
                Tracking social, referrals, and engagement across the Dewrk ecosystem.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={fetchGrowth} disabled={isGrowthLoading || role === 'viewer'}>
              {isGrowthLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <GrowthMetricCard title="Daily Active Users" value={growthMetrics?.dailyActiveUsers} suffix="users" loading={isGrowthLoading} helper="Google Analytics 4" />
            <GrowthMetricCard title="Newsletter Subscribers" value={growthMetrics?.newsletterSubscribers} suffix="users" loading={isGrowthLoading} helper="Mailchimp / Substack" />
            <GrowthMetricCard title="Discord Referrals" value={growthMetrics?.discordReferrals} suffix="referrals" loading={isGrowthLoading} helper="Last 7 days" />
            <GrowthMetricCard title="Conversion Rate" value={growthMetrics?.conversionRate} suffix="%" loading={isGrowthLoading} helper="Referrals / DAU" />
          </div>
          <p className="text-xs text-[var(--ink-3)]">
            Last updated:{' '}
            {growthMetrics?.fetchedAt
              ? new Date(growthMetrics.fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </p>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Select Guide</h3>
            </div>
            <Select value={selectedGuide ?? undefined} onValueChange={(value) => setSelectedGuide(value)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Choose guide" />
              </SelectTrigger>
              <SelectContent>
                {guides.map((guide) => (
                  <SelectItem key={guide.slug} value={guide.slug}>
                    {guide.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <textarea
              className="min-h-[360px] w-full rounded-2xl border border-white/40 bg-white/70 p-4 font-mono text-sm text-[var(--ink-1)] shadow-inner"
              value={guideContent}
              onChange={(event) => setGuideContent(event.target.value)}
              disabled={isGuideLoading}
            />
            <div className="prose prose-slate max-w-none rounded-2xl border border-white/40 bg-white/70 p-6 shadow-inner">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{guideContent}</ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => selectedGuide && loadGuide(selectedGuide)} disabled={isGuideLoading}>
              Reload
            </Button>
            <Button onClick={handleGuideSave} disabled={isGuideLoading || isSavingGuide || !selectedGuide || role === 'viewer'}>
              {isSavingGuide ? 'Saving…' : 'Save Guide'}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Maintenance</h3>
            <p className="mt-2 text-sm text-[var(--ink-2)]">
              Manually run scheduled jobs or force cache revalidation.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button onClick={handleCronTrigger} disabled={isCronRunning || role === 'viewer'}>
                {isCronRunning ? 'Triggering…' : '🔄 Refresh Data'}
              </Button>
              <Button onClick={handleRunAiDiscovery} disabled={isDiscoveryRunning || role === 'viewer'}>
                {isDiscoveryRunning ? 'Discovering…' : '🤖 Run AI Discovery'}
              </Button>
              <Button onClick={handleCronInsightRefresh} disabled={isAiLoading || role === 'viewer'}>
                {isAiLoading ? 'Refreshing…' : '🧠 Refresh Insights'}
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tags: ['testnets', 'ecosystems', 'leaderboards', 'metrics', 'guides'] }),
                    credentials: 'include'
                  })
                    .then(() => success('Caches revalidated'))
                    .catch((err) => error('Failed to revalidate', err instanceof Error ? err.message : undefined))
                }
                disabled={role === 'viewer'}
              >
                ♻️ Revalidate Cache
              </Button>
            </div>
            <div className="mt-6 text-xs text-[var(--ink-3)]">
              <p>Scheduled: update-data (Sun 02:00 UTC), growth-report (Mon 03:00 UTC), ai-discovery (Wed 01:00 UTC), insight-refresh (Daily 00:00 UTC).</p>
              {lastLog?.timestamp && (
                <p>
                  Last run: {new Date(lastLog.timestamp).toLocaleString()} ({lastLog.durationMs ?? 0} ms)
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Service Health</h3>
            {health ? (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Status</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{health.status}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Last Sync</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{lastSyncLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Testnets</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{health.testnets}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Ecosystems</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{health.ecosystems}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Leaderboard Users</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{health.leaderboardUsers}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Last Job Duration</dt>
                  <dd className="text-sm font-medium text-[var(--ink-1)]">{health.lastJobDurationMs ?? 0} ms</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-[var(--ink-2)]">Loading health snapshot…</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, caption, large }: { label: string; value: string | number; caption?: string; large?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/70 p-5 shadow-glass">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">{label}</div>
      <div className={cn('mt-2 font-semibold text-[var(--ink-1)]', large ? 'text-lg' : 'text-2xl')}>
        {value}
      </div>
      {caption && <div className="mt-1 text-xs text-[var(--ink-3)]">{caption}</div>}
    </div>
  );
}

function LeaderboardEditor({ entry, onSave, disabled }: { entry: LeaderboardSummary; onSave: (entry: LeaderboardSummary, metricValue: number) => void; disabled: boolean }) {
  const [value, setValue] = useState(entry.metricValue);
  useEffect(() => {
    setValue(entry.metricValue);
  }, [entry.metricValue]);
  return (
    <div className="flex items-center justify-end gap-2">
      <Input
        type="number"
        className="w-24"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <Button size="sm" onClick={() => onSave(entry, Number(value))} disabled={disabled}>
        Save
      </Button>
    </div>
  );
}

function GrowthMetricCard({
  title,
  value,
  suffix,
  helper,
  loading
}: {
  title: string;
  value: number | null | undefined;
  suffix?: string;
  helper?: string;
  loading: boolean;
}) {
  const displayValue = (() => {
    if (loading) return '—';
    if (value === null || typeof value === 'undefined') return '—';
    if (suffix === '%') {
      return `${value.toFixed(1)}%`;
    }
    const base = value.toLocaleString();
    return suffix ? `${base} ${suffix}` : base;
  })();

  return (
    <Card className="border border-white/30 bg-white/70">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[var(--ink-2)]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[var(--ink-1)]">{displayValue}</div>
        {helper && <p className="mt-1 text-xs text-[var(--ink-3)]">{helper}</p>}
      </CardContent>
    </Card>
  );
}
