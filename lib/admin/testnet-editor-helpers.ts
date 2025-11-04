import type { AdminFormValues } from '@/components/admin/types';
import { normalizeDiscordRoles, normalizeGettingStarted, normalizeTasks } from '@/components/testnets/normalize';
import type { TestnetDetailRecord } from '@/components/testnets/types';
import { safeUrl } from '@/lib/format';

export const STATUS_OPTIONS = ['LIVE', 'TBA', 'ENDED', 'UPCOMING'] as const;
export const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'] as const;

export type AdminTaskRecord = {
  id?: string;
  title?: string;
  description?: string | null;
  url?: string | null;
  reward?: string | null;
  order?: number | null;
};

export type AdminTestnetRecord = {
  id?: string;
  slug?: string;
  name?: string;
  network?: string;
  status?: string | null;
  difficulty?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  heroImageUrl?: string | null;
  logoUrl?: string | null;
  estTimeMinutes?: number | null;
  rewardType?: string | null;
  rewardNote?: string | null;
  rewardCategory?: string | null;
  rewardRangeUSD?: number | null;
  totalRaisedUSD?: number | null;
  hasFaucet?: boolean | null;
  startDate?: string | Date | null;
  kycRequired?: boolean | null;
  requiresWallet?: boolean | null;
  hasDashboard?: boolean | null;
  dashboardUrl?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  tags?: unknown;
  categories?: unknown;
  highlights?: unknown;
  prerequisites?: unknown;
  gettingStarted?: unknown;
  discordRoles?: unknown;
  tasks?: AdminTaskRecord[];
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export type AdminTestnetUpdatePayload = ReturnType<typeof serializePayload>;

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

const toNumber = (input: string | number | null | undefined) => {
  if (typeof input === 'number' && Number.isFinite(input)) return input;
  if (typeof input === 'string' && input.trim().length) {
    const numeric = Number(input);
    return Number.isFinite(numeric) ? numeric : undefined;
  }
  return undefined;
};

const toISODate = (value: string | Date | null | undefined) => {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  } catch {
    return '';
  }
};

export function toAdminFormDefaults(testnet: AdminTestnetRecord | null): AdminFormValues {
  const tags = toStringArray(testnet?.tags as unknown[]);
  const categories = toStringArray(testnet?.categories as unknown[]);
  const highlights = toStringArray(testnet?.highlights as unknown[]);
  const prerequisites = toStringArray(testnet?.prerequisites as unknown[]);
  const gettingStarted = normalizeGettingStarted(testnet?.gettingStarted ?? []);
  const discordRoles = normalizeDiscordRoles(testnet?.discordRoles ?? []);
  const tasks = normalizeTasks(testnet?.tasks ?? []);

  return {
    name: testnet?.name ?? '',
    network: testnet?.network ?? '',
    status: (testnet?.status ?? 'UPCOMING').toUpperCase() as AdminFormValues['status'],
    difficulty: (testnet?.difficulty ?? 'MEDIUM').toUpperCase() as AdminFormValues['difficulty'],
    shortDescription: testnet?.shortDescription ?? '',
    description: testnet?.description ?? '',
    heroImageUrl: testnet?.heroImageUrl ?? '',
    logoUrl: testnet?.logoUrl ?? '',
    estTimeMinutes: testnet?.estTimeMinutes?.toString() ?? '',
    rewardType: testnet?.rewardType ?? '',
    rewardNote: testnet?.rewardNote ?? '',
    rewardCategory: testnet?.rewardCategory ?? '',
    rewardRangeUSD: testnet?.rewardRangeUSD?.toString() ?? '',
    totalRaisedUSD: testnet?.totalRaisedUSD?.toString() ?? '',
    hasFaucet: testnet?.hasFaucet ?? false,
    startDate: toISODate(testnet?.startDate ?? undefined),
    kycRequired: testnet?.kycRequired ?? false,
    requiresWallet: testnet?.requiresWallet ?? true,
    hasDashboard: testnet?.hasDashboard ?? false,
    dashboardUrl: testnet?.dashboardUrl ?? '',
    websiteUrl: testnet?.websiteUrl ?? '',
    githubUrl: testnet?.githubUrl ?? '',
    twitterUrl: testnet?.twitterUrl ?? '',
    discordUrl: testnet?.discordUrl ?? '',
    tags,
    categories,
    highlights,
    prerequisites,
    gettingStarted:
      gettingStarted.length > 0
        ? gettingStarted.map((step) => ({
            title: step.title ?? '',
            body: step.body ?? '',
            url: step.url ?? ''
          }))
        : [{ title: '', body: '', url: '' }],
    discordRoles:
      discordRoles.length > 0
        ? discordRoles.map((role) => ({
            role: role.role,
            requirement: role.requirement ?? '',
            perks: role.perks ?? ''
          }))
        : [{ role: '', requirement: '', perks: '' }],
    discordRolesJson: discordRoles.length ? JSON.stringify(discordRoles, null, 2) : '',
    tasks:
      tasks.length > 0
        ? tasks.map((task, index) => ({
            title: task.title ?? '',
            description: task.description ?? '',
            url: task.url ?? '',
            reward: task.reward ?? '',
            order: typeof task.order === 'number' ? task.order : index
          }))
        : [{ title: '', description: '', url: '', reward: '', order: 0 }]
  };
}

const sanitizeUrl = (input: string) => {
  const trimmed = input.trim();
  return safeUrl(trimmed) ?? undefined;
};

export function serializePayload(values: AdminFormValues, slug?: string) {
  const gettingStarted = values.gettingStarted
    .map((step, index) => {
      const title = step.title.trim();
      const body = step.body.trim();
      const url = sanitizeUrl(step.url);
      if (!title && !body && !url) return null;
      return {
        title: title || `Step ${index + 1}`,
        body: body || undefined,
        url
      };
    })
    .filter((item): item is Exclude<typeof item, null> => item !== null);

  const discordRoles = values.discordRoles
    .map((role) => {
      const roleName = role.role.trim();
      if (!roleName) return null;
      return {
        role: roleName,
        requirement: role.requirement.trim() || undefined,
        perks: role.perks.trim() || undefined
      };
    })
    .filter((role): role is Exclude<typeof role, null> => role !== null);

  const tasks = values.tasks
    .map((task, index) => {
      const title = task.title.trim();
      if (!title) return null;
      return {
        title,
        description: task.description.trim() || undefined,
        url: sanitizeUrl(task.url),
        reward: task.reward.trim() || undefined,
        order: Number.isFinite(task.order) ? task.order : index
      };
    })
    .filter((task): task is Exclude<typeof task, null> => task !== null);

  return {
    slug,
    name: values.name.trim(),
    network: values.network.trim(),
    status: values.status,
    difficulty: values.difficulty,
    shortDescription: values.shortDescription.trim() || undefined,
    description: values.description.trim() || undefined,
    heroImageUrl: values.heroImageUrl.trim() || undefined,
    logoUrl: values.logoUrl.trim() || undefined,
    estTimeMinutes: toNumber(values.estTimeMinutes),
    rewardType: values.rewardType.trim() || undefined,
    rewardNote: values.rewardNote.trim() || undefined,
    rewardCategory: values.rewardCategory.trim() || undefined,
    rewardRangeUSD: values.rewardRangeUSD.trim() ? toNumber(values.rewardRangeUSD) : undefined,
    startDate: values.startDate ? new Date(values.startDate).toISOString() : undefined,
    hasFaucet: values.hasFaucet,
    kycRequired: values.kycRequired,
    requiresWallet: values.requiresWallet,
    tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
    categories: values.categories.map((category) => category.trim()).filter(Boolean),
    highlights: values.highlights.map((item) => item.trim()).filter(Boolean),
    prerequisites: values.prerequisites.map((item) => item.trim()).filter(Boolean),
    gettingStarted,
    websiteUrl: sanitizeUrl(values.websiteUrl),
    githubUrl: sanitizeUrl(values.githubUrl),
    twitterUrl: sanitizeUrl(values.twitterUrl),
    discordUrl: sanitizeUrl(values.discordUrl),
    dashboardUrl: sanitizeUrl(values.dashboardUrl),
    hasDashboard: values.hasDashboard,
    totalRaisedUSD: toNumber(values.totalRaisedUSD),
    discordRoles:
      values.discordRolesJson && values.discordRolesJson.trim().length
        ? ((): any => {
            try {
              return JSON.parse(values.discordRolesJson!);
            } catch {
              return discordRoles;
            }
          })()
        : discordRoles,
    tasks
  };
}

export function buildPreviewRecord(values: AdminFormValues, slug: string): TestnetDetailRecord {
  const tags = values.tags.map((tag) => tag.trim()).filter(Boolean);
  const highlights = values.highlights.map((item) => item.trim()).filter(Boolean);
  const prerequisites = values.prerequisites.map((item) => item.trim()).filter(Boolean);
  const totalRaised = toNumber(values.totalRaisedUSD);
  const estTime = toNumber(values.estTimeMinutes);

  const gettingStarted = values.gettingStarted
    .map((step, index) => {
      const title = step.title.trim();
      const body = step.body.trim();
      const url = sanitizeUrl(step.url);
      if (!title && !body && !url) return null;
      return {
        title: title || `Step ${index + 1}`,
        body: body || undefined,
        url
      };
    })
    .filter((item): item is Exclude<typeof item, null> => item !== null);

  const discordRoles = values.discordRoles
    .map((role) => {
      const roleName = role.role.trim();
      if (!roleName) return null;
      return {
        role: roleName,
        requirement: role.requirement.trim() || undefined,
        perks: role.perks.trim() || undefined
      };
    })
    .filter((role): role is Exclude<typeof role, null> => role !== null);

  const tasks = values.tasks
    .map((task, index) => {
      const title = task.title.trim();
      if (!title) return null;
      return {
        title,
        description: task.description.trim() || undefined,
        url: sanitizeUrl(task.url),
        reward: task.reward.trim() || undefined,
        order: Number.isFinite(task.order) ? task.order : index
      };
    })
    .filter((task): task is Exclude<typeof task, null> => task !== null);

  return {
    id: undefined,
    slug,
    name: values.name || 'Testnet Name',
    network: values.network || 'Network',
    status: values.status,
    difficulty: values.difficulty,
    shortDescription: values.shortDescription || 'Short description will appear here.',
    description: values.description || undefined,
    tags,
    categories: values.categories,
    highlights,
    prerequisites,
    estTimeMinutes: estTime,
    rewardType: values.rewardType || undefined,
    rewardNote: values.rewardNote || undefined,
    rewardCategory: values.rewardCategory || undefined,
    rewardRangeUSD: values.rewardRangeUSD || undefined,
    hasFaucet: values.hasFaucet,
    startDate: values.startDate || undefined,
    kycRequired: values.kycRequired,
    requiresWallet: values.requiresWallet,
    totalRaisedUSD: totalRaised,
    hasDashboard: values.hasDashboard,
    dashboardUrl: values.dashboardUrl || undefined,
    logoUrl: values.logoUrl || undefined,
    heroImageUrl: values.heroImageUrl || undefined,
    tasksCount: values.tasks.filter((task) => task.title.trim()).length,
    updatedAt: undefined,
    socials: {
      website: sanitizeUrl(values.websiteUrl),
      github: sanitizeUrl(values.githubUrl),
      twitter: sanitizeUrl(values.twitterUrl),
      discord: sanitizeUrl(values.discordUrl)
    },
    gettingStarted,
    discordRoles,
    tasks
  };
}
