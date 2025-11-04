export type AdminTestnetRecord = {
  id: string;
  name: string;
  slug: string;
  network: string;
  status: string;
  difficulty: string;
  shortDescription: string;
  description: string;
  heroImageUrl: string | null;
  logoUrl: string | null;
  estTimeMinutes: number | null;
  rewardType: string | null;
  rewardNote: string | null;
  rewardCategory: string | null;
  rewardRangeUSD: number | null;
  totalRaisedUSD: number | null;
  hasFaucet: boolean;
  startDate: string | null;
  kycRequired: boolean;
  requiresWallet: boolean;
  hasDashboard: boolean;
  dashboardUrl: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  discordUrl: string | null;
  tags: string[];
  categories: string[];
  highlights: string[];
  prerequisites: string[];
  gettingStarted: string[];
  discordRoles: Array<Record<string, unknown>>;
};

const toArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item == null) return '';
        return String(item).trim();
      })
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object' && value !== null && 'toNumber' in value && typeof (value as any).toNumber === 'function') {
    const num = (value as any).toNumber();
    return Number.isFinite(num) ? num : null;
  }
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

export function normaliseAdminTestnet(record: any): AdminTestnetRecord {
  const startDate = record?.startDate ? new Date(record.startDate).toISOString().split('T')[0] : null;

  return {
    id: record.id,
    name: record.name ?? '',
    slug: record.slug ?? '',
    network: record.network ?? '',
    status: record.status ?? 'LIVE',
    difficulty: record.difficulty ?? 'MEDIUM',
    shortDescription: record.shortDescription ?? '',
    description: record.description ?? '',
    heroImageUrl: record.heroImageUrl ?? null,
    logoUrl: record.logoUrl ?? null,
    estTimeMinutes: toNumberOrNull(record.estTimeMinutes),
    rewardType: record.rewardType ?? null,
    rewardNote: record.rewardNote ?? null,
    rewardCategory: record.rewardCategory ?? null,
    rewardRangeUSD: toNumberOrNull(record.rewardRangeUSD),
    totalRaisedUSD: toNumberOrNull(record.totalRaisedUSD),
    hasFaucet: Boolean(record.hasFaucet),
    startDate,
    kycRequired: Boolean(record.kycRequired),
    requiresWallet: record.requiresWallet === undefined ? true : Boolean(record.requiresWallet),
    hasDashboard: Boolean(record.hasDashboard),
    dashboardUrl: record.dashboardUrl ?? null,
    websiteUrl: record.websiteUrl ?? null,
    githubUrl: record.githubUrl ?? null,
    twitterUrl: record.twitterUrl ?? null,
    discordUrl: record.discordUrl ?? null,
    tags: toArray(record.tags),
    categories: toArray(record.categories),
    highlights: toArray(record.highlights),
    prerequisites: toArray(record.prerequisites),
    gettingStarted: toArray(record.gettingStarted),
    discordRoles: Array.isArray(record.discordRoles) ? record.discordRoles : []
  };
}
