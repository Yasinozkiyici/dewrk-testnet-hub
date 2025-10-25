import type { Prisma } from '@prisma/client';
import { prune } from '@/lib/prune';

type JsonValue = Prisma.JsonValue | null | undefined;

const toStringArray = (value: JsonValue): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const toDiscordRoleArray = (
  value: JsonValue
): { role: string; requirement?: string | null; perks?: string | null }[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((role) => {
      if (!role || typeof role !== 'object') return null;
      const record = role as Record<string, unknown>;
      const roleName = typeof record.role === 'string' ? record.role : '';
      if (!roleName) return null;
      return {
        role: roleName,
        requirement: typeof record.requirement === 'string' ? record.requirement : null,
        perks: typeof record.perks === 'string' ? record.perks : null
      };
    })
    .filter((role): role is { role: string; requirement?: string | null; perks?: string | null } => Boolean(role));
};

const normalizeTasks = (tasks: unknown) => {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task) =>
    prune({
      ...(typeof task === 'object' && task !== null ? task : {}),
      updatedAt:
        task && typeof task === 'object' && 'updatedAt' in task && task.updatedAt instanceof Date
          ? task.updatedAt.toISOString()
          : task && typeof task === 'object' && 'updatedAt' in task
            ? task.updatedAt
            : undefined,
      createdAt:
        task && typeof task === 'object' && 'createdAt' in task && task.createdAt instanceof Date
          ? task.createdAt.toISOString()
          : task && typeof task === 'object' && 'createdAt' in task
            ? task.createdAt
            : undefined
    })
  );
};

interface BaseTestnetShape {
  updatedAt: Date | string;
  tags?: JsonValue;
  categories?: JsonValue;
  highlights?: JsonValue;
  prerequisites?: JsonValue;
  gettingStarted?: JsonValue;
  discordRoles?: JsonValue;
  [key: string]: unknown;
}

export function serializeTestnetListItem<T extends BaseTestnetShape>(testnet: T) {
  const updatedAt =
    testnet.updatedAt instanceof Date ? testnet.updatedAt.toISOString() : (testnet.updatedAt as string);

  return prune({
    ...testnet,
    tags: toStringArray(testnet.tags),
    updatedAt
  });
}

export function serializeTestnetDetail<T extends BaseTestnetShape & { tasks?: unknown }>(testnet: T) {
  const base = serializeTestnetListItem(testnet);
  const socials: Record<string, string> = {};
  if (typeof testnet.twitterUrl === 'string' && testnet.twitterUrl.length) {
    socials.twitter = testnet.twitterUrl;
  }
  if (typeof testnet.discordUrl === 'string' && testnet.discordUrl.length) {
    socials.discord = testnet.discordUrl;
  }

  return prune({
    ...base,
    socials,
    categories: toStringArray(testnet.categories),
    highlights: toStringArray(testnet.highlights),
    prerequisites: toStringArray(testnet.prerequisites),
    gettingStarted: toStringArray(testnet.gettingStarted),
    discordRoles: toDiscordRoleArray(testnet.discordRoles),
    tasks: normalizeTasks(testnet.tasks)
  });
}
