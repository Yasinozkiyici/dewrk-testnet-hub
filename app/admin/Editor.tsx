'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import type { Prisma } from '@prisma/client';
import { useDebounce } from '@/hooks/useDebounce';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { TestnetPreview } from '@/components/admin/TestnetPreview';
import { TestnetForm } from '@/components/admin/TestnetForm';
import type { AdminFormValues } from '@/components/admin/types';
import { normalizeDiscordRoles, normalizeGettingStarted, normalizeTasks } from '@/components/testnets/normalize';
import type { TestnetDetailRecord } from '@/components/testnets/types';
import { safeUrl } from '@/lib/format';

const statusOptions = ['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'] as const;
const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'] as const;

type PrismaTestnet = Prisma.TestnetGetPayload<{ include: { tasks: true } }>;

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

function mapDefaultValues(testnet: PrismaTestnet | null): AdminFormValues {
  const tags = toStringArray(testnet?.tags);
  const categories = toStringArray(testnet?.categories);
  const highlights = toStringArray(testnet?.highlights);
  const prerequisites = toStringArray(testnet?.prerequisites);
  const gettingStarted = normalizeGettingStarted(testnet?.gettingStarted ?? []);
  const discordRoles = normalizeDiscordRoles(testnet?.discordRoles ?? []);
  const tasks = normalizeTasks(testnet?.tasks ?? []);

  return {
    name: testnet?.name ?? '',
    network: testnet?.network ?? '',
    status: (testnet?.status ?? 'UPCOMING') as AdminFormValues['status'],
    difficulty: (testnet?.difficulty ?? 'MEDIUM') as AdminFormValues['difficulty'],
    shortDescription: testnet?.shortDescription ?? '',
    description: (testnet?.description as string) ?? '',
    heroImageUrl: testnet?.heroImageUrl ?? '',
    logoUrl: testnet?.logoUrl ?? '',
    estTimeMinutes: testnet?.estTimeMinutes?.toString() ?? '',
    rewardType: testnet?.rewardType ?? '',
    rewardNote: testnet?.rewardNote ?? '',
    totalRaisedUSD: testnet?.totalRaisedUSD?.toString() ?? '',
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
    tasks:
      tasks.length > 0
        ? tasks.map((task, index) => ({
            title: task.title,
            description: task.description ?? '',
            url: task.url ?? '',
            reward: task.reward ?? '',
            order: typeof task.order === 'number' ? task.order : index
          }))
        : [{ title: '', description: '', url: '', reward: '', order: 0 }]
  };
}

function toNumber(input: string) {
  const numeric = Number(input);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function sanitizeUrl(input: string) {
  const trimmed = input.trim();
  return safeUrl(trimmed) ?? undefined;
}

function serializePayload(values: AdminFormValues, slug?: string) {
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
    discordRoles,
    tasks
  };
}

function buildPreviewRecord(values: AdminFormValues, slug: string): TestnetDetailRecord {
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

export function Editor({ initialTestnet }: { initialTestnet: PrismaTestnet | null }) {
  const router = useRouter();
  const { success, error, toasts, removeToast } = useToast();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const defaultValues = useMemo(() => mapDefaultValues(initialTestnet), [initialTestnet]);

  const form = useForm<AdminFormValues>({
    mode: 'onBlur',
    defaultValues
  });

  const discordRolesArray = useFieldArray({ control: form.control, name: 'discordRoles' });
  const gettingStartedArray = useFieldArray({ control: form.control, name: 'gettingStarted' });
  const tasksArray = useFieldArray({ control: form.control, name: 'tasks' });

  const watchedValues = form.watch();
  const debouncedValues = useDebounce(watchedValues, 150);
  const previewRecord = useMemo(
    () => buildPreviewRecord(debouncedValues, initialTestnet?.slug ?? 'preview'),
    [debouncedValues, initialTestnet?.slug]
  );

  const onSubmit = async (values: AdminFormValues) => {
    setStatus('saving');
    try {
      const payload = serializePayload(values, initialTestnet?.slug);
      const response = await fetch('/api/admin/testnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? 'Request failed');
      }

      const json = await response.json();
      setStatus('success');
      success('Changes saved', 'The testnet has been updated successfully.');

      if (!initialTestnet && json?.slug) {
        router.replace(`/admin?slug=${json.slug}`);
      }
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please review the inputs.';
      setStatus('error');
      error('Failed to save changes', message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <TestnetForm
          form={form}
          status={status}
          statusOptions={statusOptions}
          difficultyOptions={difficultyOptions}
          onSubmit={onSubmit}
          discordRolesArray={discordRolesArray}
          gettingStartedArray={gettingStartedArray}
          tasksArray={tasksArray}
        />
        <TestnetPreview data={previewRecord} isSaving={status === 'saving'} />
      </div>
    </div>
  );
}
