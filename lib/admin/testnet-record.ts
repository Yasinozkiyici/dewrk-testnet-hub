import type { Task, Testnet } from '@prisma/client';
import type { AdminTestnetRecord, AdminTaskRecord } from './testnet-editor-helpers';

type PrismaTestnetWithTasks = Testnet & {
  tasks?: Task[] | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  startDate?: Date | string | null;
};

const serializeTasks = (tasks: Task[] | null | undefined): AdminTaskRecord[] =>
  Array.isArray(tasks)
    ? tasks
        .map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          url: task.url,
          reward: task.reward,
          order: task.order
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [];

const toIsoStringOrNull = (value: Date | string | null | undefined) => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return null;
};

const toIsoStringOrUndefined = (value: Date | string | null | undefined) => {
  if (value == null) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return undefined;
};

export function toAdminTestnetRecord(testnet: PrismaTestnetWithTasks): AdminTestnetRecord {
  return {
    id: testnet.id,
    slug: testnet.slug,
    name: testnet.name,
    network: testnet.network,
    status: testnet.status,
    difficulty: testnet.difficulty,
    shortDescription: testnet.shortDescription,
    description: testnet.description,
    heroImageUrl: testnet.heroImageUrl,
    logoUrl: testnet.logoUrl,
    estTimeMinutes: testnet.estTimeMinutes ?? null,
    rewardType: testnet.rewardType,
    rewardNote: testnet.rewardNote,
    rewardCategory: (testnet as any)?.rewardCategory ?? null,
    rewardRangeUSD: testnet.rewardRangeUSD ? Number(testnet.rewardRangeUSD) : null,
    totalRaisedUSD: testnet.totalRaisedUSD ?? null,
    hasFaucet: (testnet as any)?.hasFaucet ?? null,
    startDate: toIsoStringOrNull(testnet.startDate),
    kycRequired: testnet.kycRequired,
    requiresWallet: testnet.requiresWallet,
    hasDashboard: testnet.hasDashboard,
    dashboardUrl: testnet.dashboardUrl,
    websiteUrl: testnet.websiteUrl,
    githubUrl: testnet.githubUrl,
    twitterUrl: testnet.twitterUrl,
    discordUrl: testnet.discordUrl,
    tags: testnet.tags ?? [],
    categories: testnet.categories ?? [],
    highlights: testnet.highlights ?? [],
    prerequisites: testnet.prerequisites ?? [],
    gettingStarted: testnet.gettingStarted ?? [],
    discordRoles: testnet.discordRoles ?? [],
    tasks: serializeTasks(testnet.tasks),
    createdAt: toIsoStringOrUndefined(testnet.createdAt) ?? undefined,
    updatedAt: toIsoStringOrUndefined(testnet.updatedAt) ?? undefined
  };
}
