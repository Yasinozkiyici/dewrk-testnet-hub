import { safeUrl } from '@/lib/format';
import type {
  DetailTask,
  DiscordRoleItem,
  GettingStartedItem,
  TestnetDetailRecord
} from './types';

const STEP_FALLBACK_TITLE = (index: number) => `Step ${index + 1}`;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

export function normalizeGettingStarted(value: unknown): GettingStartedItem[] {
  let source = value;

  if (!Array.isArray(source)) {
    if (typeof source === 'string') {
      try {
        const parsed = JSON.parse(source);
        source = Array.isArray(parsed) ? parsed : [];
      } catch (_error) {
        source = [];
      }
    } else {
      source = [];
    }
  }

  const steps: GettingStartedItem[] = [];

  (source as unknown[]).forEach((entry, index) => {
    if (typeof entry === 'string') {
      const body = entry.trim();
      if (!body) return;
      steps.push({ title: STEP_FALLBACK_TITLE(index), body });
      return;
    }

    if (entry && typeof entry === 'object') {
      const record = entry as Record<string, unknown>;
      const rawTitle = typeof record.title === 'string' ? record.title : undefined;
      const rawBody = typeof record.body === 'string' ? record.body : undefined;
      const rawDescription = typeof record.description === 'string' ? record.description : undefined;
      const rawUrl = typeof record.url === 'string' ? record.url : undefined;

      const title = rawTitle?.trim() || STEP_FALLBACK_TITLE(index);
      const body = rawBody?.trim() || rawDescription?.trim();
      const url = safeUrl(rawUrl);

      steps.push({
        title,
        body: body && body.length ? body : undefined,
        url
      });
    }
  });

  return steps.map((item, index) => ({ ...item, title: item.title || STEP_FALLBACK_TITLE(index) }));
}

export function normalizeDiscordRoles(value: unknown): DiscordRoleItem[] {
  if (!Array.isArray(value)) return [];
  const roles: DiscordRoleItem[] = [];
  (value as unknown[]).forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const record = entry as Record<string, unknown>;
    const role = typeof record.role === 'string' ? record.role.trim() : '';
    if (!role) return;
    const requirement = typeof record.requirement === 'string' ? record.requirement.trim() : undefined;
    const perks = typeof record.perks === 'string' ? record.perks.trim() : undefined;
    roles.push({ role, requirement, perks });
  });
  return roles;
}

export function normalizeTasks(value: unknown): DetailTask[] {
  if (!Array.isArray(value)) return [];
  const tasks: DetailTask[] = [];
  (value as unknown[]).forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const record = entry as Record<string, unknown>;
    const title = typeof record.title === 'string' ? record.title.trim() : '';
    if (!title) return;
    const description = typeof record.description === 'string' ? record.description.trim() : undefined;
    const reward = typeof record.reward === 'string' ? record.reward.trim() : undefined;
    const url = safeUrl(typeof record.url === 'string' ? record.url : undefined);
    const id = typeof record.id === 'string' ? record.id : undefined;
    const orderValue = record.order;
    const order =
      typeof orderValue === 'number'
        ? orderValue
        : typeof orderValue === 'string' && Number.isFinite(Number(orderValue))
          ? Number(orderValue)
          : index;
    tasks.push({ id, title, description, reward, url, order });
  });
  return tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function normaliseSocials(value: unknown, fallback: Record<string, unknown>): TestnetDetailRecord['socials'] {
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return {
      website: safeUrl(typeof record.websiteUrl === 'string' ? record.websiteUrl : (record.website as string | undefined)),
      github: safeUrl(typeof record.githubUrl === 'string' ? record.githubUrl : (record.github as string | undefined)),
      twitter: safeUrl(typeof record.twitterUrl === 'string' ? record.twitterUrl : (record.twitter as string | undefined)),
      discord: safeUrl(typeof record.discordUrl === 'string' ? record.discordUrl : (record.discord as string | undefined))
    };
  }

  return {
    website: safeUrl(typeof fallback.websiteUrl === 'string' ? fallback.websiteUrl : undefined),
    github: safeUrl(typeof fallback.githubUrl === 'string' ? fallback.githubUrl : undefined),
    twitter: safeUrl(typeof fallback.twitterUrl === 'string' ? fallback.twitterUrl : undefined),
    discord: safeUrl(typeof fallback.discordUrl === 'string' ? fallback.discordUrl : undefined)
  };
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

export function normalizeTestnetDetail(raw: unknown): TestnetDetailRecord {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid detail payload');
  }

  const record = raw as Record<string, unknown>;

  const slug = typeof record.slug === 'string' ? record.slug : '';
  const name = typeof record.name === 'string' ? record.name : slug || 'Unknown';
  const status = typeof record.status === 'string' ? record.status.toUpperCase() : undefined;
  const difficulty = typeof record.difficulty === 'string' ? record.difficulty.toUpperCase() : undefined;
  const tags = toStringArray(record.tags ?? record.tagList);
  const highlights = toStringArray(record.highlights);
  const prerequisites = toStringArray(record.prerequisites);
  const categories = toStringArray(record.categories);
  const estTime = toNumber(record.estTimeMinutes ?? record.est_time_minutes);
  const totalRaised = record.totalRaisedUSD ?? record.total_raised_usd;
  const updatedAt = (record.updatedAt ?? record.updated_at) as string | null | undefined;
  const startDate = (record.startDate ?? record.start_date) as string | null | undefined;
  const hasFaucet = (record.hasFaucet ?? record.has_faucet) as boolean | null | undefined;
  const rewardCategory = (record.rewardCategory ?? record.reward_category) as string | null | undefined;
  const rewardRangeUSD = record.rewardRangeUSD ?? record.reward_range_usd;

  const socials = normaliseSocials(record.socials, record);
  const gettingStarted = normalizeGettingStarted(record.gettingStarted ?? record.getting_started);
  const discordRoles = normalizeDiscordRoles(record.discordRoles ?? record.discord_roles);
  const tasks = normalizeTasks(record.tasks);

  return {
    id: typeof record.id === 'string' ? record.id : undefined,
    slug,
    name,
    network: typeof record.network === 'string' ? record.network : (record.chain as string | undefined),
    status: status as TestnetDetailRecord['status'],
    difficulty: difficulty as TestnetDetailRecord['difficulty'],
    shortDescription: (record.shortDescription ?? record.short_description) as string | null | undefined,
    description: (record.description as string | null | undefined) ?? undefined,
    tags,
    categories,
    highlights,
    prerequisites,
    estTimeMinutes: estTime ?? undefined,
    rewardType: (record.rewardType ?? record.reward_type) as string | null | undefined,
    rewardNote: (record.rewardNote ?? record.reward_note) as string | null | undefined,
    rewardCategory: rewardCategory ?? undefined,
    rewardRangeUSD: (typeof rewardRangeUSD === 'number' || typeof rewardRangeUSD === 'string') ? rewardRangeUSD : undefined,
    hasFaucet: typeof hasFaucet === 'boolean' ? hasFaucet : undefined,
    startDate: typeof startDate === 'string' ? startDate : undefined,
    kycRequired: typeof record.kycRequired === 'boolean' ? record.kycRequired : (record.kyc_required as boolean | undefined),
    requiresWallet:
      typeof record.requiresWallet === 'boolean'
        ? record.requiresWallet
        : (record.requires_wallet as boolean | undefined),
    totalRaisedUSD:
      typeof totalRaised === 'number' || typeof totalRaised === 'string' ? totalRaised : undefined,
    hasDashboard:
      typeof record.hasDashboard === 'boolean'
        ? record.hasDashboard
        : (record.has_dashboard as boolean | undefined),
    dashboardUrl: (record.dashboardUrl ?? record.dashboard_url) as string | null | undefined,
    logoUrl: (record.logoUrl ?? record.logo_url) as string | null | undefined,
    heroImageUrl: (record.heroImageUrl ?? record.hero_image_url) as string | null | undefined,
    tasksCount:
      typeof record.tasksCount === 'number'
        ? record.tasksCount
        : (Number.isFinite(record.tasks_count) ? Number(record.tasks_count) : undefined),
    updatedAt: typeof updatedAt === 'string' ? updatedAt : undefined,
    socials,
    gettingStarted,
    discordRoles,
    tasks
  };
}
