'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatEstTime, formatRelative, formatUSD } from '@/lib/formatting';
import { useActivateOnEnter } from '@/lib/a11y';
import { cn } from '@/lib/utils';

export interface TestnetListItem {
  id: string;
  name: string;
  slug: string;
  network: string;
  status: 'LIVE' | 'PAUSED' | 'ENDED' | 'UPCOMING';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  shortDescription?: string | null;
  logoUrl?: string | null;
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  kycRequired: boolean;
  requiresWallet: boolean;
  tags: string[];
  tasksCount: number;
  updatedAt: string;
  hasDashboard: boolean;
  totalRaisedUSD?: number | string | null;
  dashboardUrl?: string | null;
}

interface TestnetsTableProps {
  testnets: TestnetListItem[];
}

const statusMap: Record<TestnetListItem['status'], string> = {
  LIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  ENDED: 'bg-gray-200 text-gray-600',
  UPCOMING: 'bg-sky-100 text-sky-700'
};

const difficultyMap: Record<TestnetListItem['difficulty'], string> = {
  EASY: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-orange-100 text-orange-700',
  HARD: 'bg-rose-100 text-rose-700'
};

export function TestnetsTable({ testnets }: TestnetsTableProps) {
  const rows = useMemo(() => testnets, [testnets]);

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-white/40 bg-white/70 p-10 text-center text-sm text-[var(--ink-3)]">
        No testnets found. Adjust filters or try a new query.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-glass">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[220px]">Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Est. Time</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>KYC</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Funding (USD)</TableHead>
            <TableHead>Dashboard</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((testnet) => (
            <TestnetRow key={testnet.id} testnet={testnet} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function TestnetRow({ testnet }: { testnet: TestnetListItem }) {
  const router = useRouter();
  const handleOpen = () => router.push(`/testnets/${testnet.slug}`);
  const handleKey = useActivateOnEnter(handleOpen);
  const { relative, iso } = formatRelative(testnet.updatedAt);

  return (
    <TableRow
      tabIndex={0}
      role="link"
      aria-label={`View ${testnet.name}`}
      onClick={handleOpen}
      onKeyDown={handleKey}
      className="cursor-pointer transition hover:bg-white/60 focus-visible:bg-white/70"
    >
      <TableCell>
        <div className="flex items-center gap-3">
          {testnet.logoUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-sm">
              <Image src={testnet.logoUrl} alt="" fill className="object-contain" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-white/50 text-xs text-[var(--ink-3)]">
              {testnet.network.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-[var(--ink-1)]">{testnet.name}</div>
            <div className="text-xs text-[var(--ink-3)]">{testnet.network}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('px-3 py-1 text-xs font-semibold', statusMap[testnet.status])}>
          {testnet.status}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={cn('px-3 py-1 text-xs font-semibold', difficultyMap[testnet.difficulty])}>
          {testnet.difficulty}
        </Badge>
      </TableCell>
      <TableCell>{formatEstTime(testnet.estTimeMinutes)}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-xs text-[var(--ink-2)]">
          <span>{testnet.rewardType ?? '—'}</span>
          {testnet.rewardNote && <span className="text-[var(--ink-3)]">{testnet.rewardNote}</span>}
        </div>
      </TableCell>
      <TableCell>{testnet.kycRequired ? 'Yes' : 'No'}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {testnet.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-[var(--ink-3)]">
              {tag}
            </span>
          ))}
          {testnet.tags.length > 4 && (
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-[var(--ink-3)]">
              +{testnet.tags.length - 4}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{testnet.tasksCount}</TableCell>
      <TableCell>
        <time dateTime={iso} title={iso ?? undefined} className="text-xs text-[var(--ink-2)]">
          {relative}
        </time>
      </TableCell>
      <TableCell>{formatUSD(testnet.totalRaisedUSD)}</TableCell>
      <TableCell>
        {testnet.hasDashboard ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--mint)]/80 px-3 py-1 text-xs font-semibold text-[var(--ink-1)]">
            Open <ExternalLink className="h-3.5 w-3.5" />
          </span>
        ) : (
          <span className="text-xs text-[var(--ink-3)]">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
