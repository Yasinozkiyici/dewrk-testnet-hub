// @ts-nocheck
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { ChipInput } from '@/components/ui/chip-input';
import { MultiField } from '@/components/ui/multi-field';
import { testnetCreateSchema, testnetUpdateSchema } from '@/lib/zod';
import type { Prisma } from '@prisma/client';
import { cn } from '@/lib/utils';

const statusOptions = ['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'] as const;
const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'] as const;

const createResolver = zodResolver(testnetCreateSchema);
const updateResolver = zodResolver(testnetUpdateSchema);

type PrismaTestnet = Prisma.TestnetGetPayload<{ include: { tasks: true } }>;

type FormValues = {
  // Required fields
  name: string;
  network: string;
  status: (typeof statusOptions)[number];
  difficulty: (typeof difficultyOptions)[number];
  estTimeMinutes: string;
  
  // Optional reward fields
  rewardType: string;
  rewardNote: string;
  
  // Boolean flags
  kycRequired: boolean;
  requiresWallet: boolean;
  
  // Image URLs
  logoUrl: string;
  heroImageUrl: string;
  
  // Social links
  websiteUrl: string;
  githubUrl: string;
  twitterUrl: string;
  discordUrl: string;
  
  // Dashboard
  dashboardUrl: string;
  hasDashboard: boolean;
  
  // Funding
  totalRaisedUSD: string;
  
  // Array fields (as strings for form input)
  tags: string;
  categories: string;
  highlights: string;
  prerequisites: string;
  gettingStarted: string;
  
  // Complex array fields
  discordRoles: { role: string; requirement?: string; perks?: string }[];
  tasks: { title: string; description?: string; url?: string; reward?: string; order?: number }[];
  
  // Optional description
  shortDescription: string;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
};

const toDiscordRoleArray = (
  value: unknown
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

function mapDefaultValues(testnet: PrismaTestnet | null): FormValues {
  const tags = toStringArray(testnet?.tags);
  const categories = toStringArray(testnet?.categories);
  const highlights = toStringArray(testnet?.highlights);
  const prerequisites = toStringArray(testnet?.prerequisites);
  const gettingStarted = toStringArray(testnet?.gettingStarted);
  const discordRoles = toDiscordRoleArray(testnet?.discordRoles);

  return {
    name: testnet?.name ?? '',
    network: testnet?.network ?? '',
    status: (testnet?.status ?? 'UPCOMING') as FormValues['status'],
    difficulty: (testnet?.difficulty ?? 'MEDIUM') as FormValues['difficulty'],
    shortDescription: testnet?.shortDescription ?? '',
    description: testnet?.description as string ?? '',
    heroImageUrl: testnet?.heroImageUrl ?? '',
    logoUrl: testnet?.logoUrl ?? '',
    estTimeMinutes: testnet?.estTimeMinutes?.toString() ?? '',
    rewardType: testnet?.rewardType ?? '',
    rewardNote: testnet?.rewardNote ?? '',
    kycRequired: testnet?.kycRequired ?? false,
    requiresWallet: testnet?.requiresWallet ?? true,
    tags: tags.join(', '),
    categories: categories.join(', '),
    highlights: highlights.join('\n'),
    prerequisites: prerequisites.join('\n'),
    gettingStarted: gettingStarted.join('\n'),
    websiteUrl: testnet?.websiteUrl ?? '',
    githubUrl: testnet?.githubUrl ?? '',
    twitterUrl: testnet?.twitterUrl ?? '',
    discordUrl: testnet?.discordUrl ?? '',
    dashboardUrl: testnet?.dashboardUrl ?? '',
    hasDashboard: testnet?.hasDashboard ?? false,
    totalRaisedUSD: testnet?.totalRaisedUSD?.toString() ?? '',
    discordRoles: discordRoles?.length
      ? discordRoles.map((role) => ({
          role: role.role,
          requirement: role.requirement ?? '',
          perks: role.perks ?? ''
        }))
      : [{ role: '', requirement: '', perks: '' }],
    tasks: testnet?.tasks.length
      ? testnet.tasks.map((task) => ({
          title: task.title,
          description: task.description ?? '',
          url: task.url ?? '',
          reward: task.reward ?? '',
          order: task.order ?? 0
        }))
      : [{ title: '', description: '', url: '', reward: '', order: 0 }]
  };
}

function serializePayload(values: FormValues, slug?: string) {
  const totalRaisedRaw = values.totalRaisedUSD.trim();
  const parsed = {
    slug,
    name: values.name.trim(),
    network: values.network.trim(),
    status: values.status,
    difficulty: values.difficulty,
    shortDescription: values.shortDescription.trim() || undefined,
    description: values.description?.trim() || undefined,
    heroImageUrl: values.heroImageUrl.trim() || undefined,
    logoUrl: values.logoUrl.trim() || undefined,
    estTimeMinutes: values.estTimeMinutes ? Number(values.estTimeMinutes) : undefined,
    rewardType: values.rewardType.trim() || undefined,
    rewardNote: values.rewardNote.trim() || undefined,
    kycRequired: values.kycRequired,
    requiresWallet: values.requiresWallet,
    tags: values.tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    categories: values.categories
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    highlights: values.highlights
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    prerequisites: values.prerequisites
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    gettingStarted: values.gettingStarted
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    websiteUrl: values.websiteUrl.trim() || undefined,
    githubUrl: values.githubUrl.trim() || undefined,
    twitterUrl: values.twitterUrl.trim() || undefined,
    discordUrl: values.discordUrl.trim() || undefined,
    dashboardUrl: values.dashboardUrl.trim() || undefined,
    hasDashboard: values.hasDashboard,
    totalRaisedUSD: totalRaisedRaw ? Number(totalRaisedRaw) : undefined,
    discordRoles: values.discordRoles
      .map((role) => ({
        role: role.role.trim(),
        requirement: role.requirement?.trim() || undefined,
        perks: role.perks?.trim() || undefined
      }))
      .filter((role) => role.role.length),
    tasks: values.tasks
      .map((task, index) => {
        const normalizedOrder =
          typeof task.order === 'number' && Number.isFinite(task.order) ? task.order : index;
        return {
          title: task.title.trim(),
          description: task.description?.trim() || undefined,
          url: task.url?.trim() || undefined,
          reward: task.reward?.trim() || undefined,
          order: normalizedOrder
        };
      })
      .filter((task) => task.title.length)
  };

  return parsed;
}

export function Editor({ initialTestnet }: { initialTestnet: PrismaTestnet | null }) {
  const router = useRouter();
  const { toasts, removeToast, success, error } = useToast();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const defaultValues = useMemo(() => mapDefaultValues(initialTestnet), [initialTestnet]);

  const form = useForm<FormValues>({
    mode: 'onChange',
    defaultValues,
    resolver: initialTestnet ? updateResolver : createResolver
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isDirty }
  } = form;

  const rolesFieldArray = useFieldArray({ control, name: 'discordRoles' });
  const taskFieldArray = useFieldArray({ control, name: 'tasks' });

  // Watch all form values for live preview
  const watchedValues = watch();
  const debouncedValues = useDebounce(watchedValues, 300);

  const onSubmit = async (values: FormValues) => {
    setStatus('saving');
    try {
      const payload = serializePayload(values, initialTestnet?.slug);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (typeof window !== 'undefined') {
        const storedToken = window.localStorage.getItem('dewrk-admin-token');
        if (storedToken) {
          headers.Authorization = `Bearer ${storedToken}`;
        }
      }

      const response = await fetch('/api/admin/testnets', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }

      const json = await response.json();
      setStatus('success');
      success('Changes saved successfully', 'The testnet has been updated and is now live.');

      if (!initialTestnet && json?.slug) {
        router.replace(`/admin?slug=${json.slug}`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setStatus('error');
      error('Failed to save changes', err instanceof Error ? err.message : 'Something went wrong. Please review your inputs.');
    }
  };

  // Live preview data with debounce
  const previewData = {
    name: debouncedValues.name || 'Testnet Name',
    network: debouncedValues.network || 'Network',
    status: debouncedValues.status || 'UPCOMING',
    difficulty: debouncedValues.difficulty || 'MEDIUM',
    shortDescription: debouncedValues.shortDescription || 'Short description will appear here...',
    logoUrl: debouncedValues.logoUrl,
    estTimeMinutes: debouncedValues.estTimeMinutes,
    rewardType: debouncedValues.rewardType,
    kycRequired: debouncedValues.kycRequired,
    requiresWallet: debouncedValues.requiresWallet,
    tags: debouncedValues.tags ? debouncedValues.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    hasDashboard: debouncedValues.hasDashboard,
    totalRaisedUSD: debouncedValues.totalRaisedUSD,
    websiteUrl: debouncedValues.websiteUrl,
    githubUrl: debouncedValues.githubUrl,
    twitterUrl: debouncedValues.twitterUrl,
    discordUrl: debouncedValues.discordUrl,
    dashboardUrl: debouncedValues.dashboardUrl,
    highlights: debouncedValues.highlights ? debouncedValues.highlights.split('\n').filter(Boolean) : [],
    prerequisites: debouncedValues.prerequisites ? debouncedValues.prerequisites.split('\n').filter(Boolean) : [],
    gettingStarted: debouncedValues.gettingStarted ? debouncedValues.gettingStarted.split('\n').filter(Boolean) : [],
    discordRoles: debouncedValues.discordRoles.filter(role => role.role.trim()),
    tasks: debouncedValues.tasks.filter(task => task.title.trim())
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="flex gap-6">
        {/* Form Section */}
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                {initialTestnet ? `Edit ${initialTestnet.name}` : 'Create testnet'}
              </h1>
              <p className="text-sm text-gray-600">
                Fill out the metadata below. Fields feed directly into the public directory and API contract.
              </p>
            </div>

            <section className="grid gap-6">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Core Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Name *
                    </Label>
                    <Input 
                      id="name" 
                      data-testid="name-input"
                      {...register('name')} 
                      className="mt-1"
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600" data-testid="name-error">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="network" className="text-sm font-medium text-gray-700">
                      Network *
                    </Label>
                    <Input 
                      id="network" 
                      data-testid="network-input"
                      {...register('network')} 
                      className="mt-1"
                      aria-describedby={errors.network ? "network-error" : undefined}
                    />
                    {errors.network && (
                      <p id="network-error" className="mt-1 text-sm text-red-600" data-testid="network-error">
                        {errors.network.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status *</Label>
                      <Select 
                        value={watch('status')} 
                        onValueChange={(value) => form.setValue('status', value as FormValues['status'])}
                      >
                        <SelectTrigger className="mt-1" aria-label="Status" data-testid="status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Difficulty *</Label>
                      <Select 
                        value={watch('difficulty')} 
                        onValueChange={(value) => form.setValue('difficulty', value as FormValues['difficulty'])}
                      >
                        <SelectTrigger className="mt-1" aria-label="Difficulty" data-testid="difficulty-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estTimeMinutes" className="text-sm font-medium text-gray-700">
                        Est. Time (minutes)
                      </Label>
                      <Input 
                        id="estTimeMinutes" 
                        type="number" 
                        data-testid="est-time-input"
                        {...register('estTimeMinutes')} 
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="totalRaisedUSD" className="text-sm font-medium text-gray-700">
                        Funding (USD)
                      </Label>
                      <Input 
                        id="totalRaisedUSD" 
                        type="number" 
                        min="0"
                        step="0.01"
                        {...register('totalRaisedUSD')} 
                        className="mt-1"
                        aria-describedby={errors.totalRaisedUSD ? "totalRaisedUSD-error" : undefined}
                      />
                      {errors.totalRaisedUSD && (
                        <p id="totalRaisedUSD-error" className="mt-1 text-sm text-red-600" data-testid="total-raised-usd-error">
                          {errors.totalRaisedUSD.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="rewardType" className="text-sm font-medium text-gray-700">
                      Reward Type
                    </Label>
                    <Input 
                      id="rewardType" 
                      data-testid="reward-type-input"
                      {...register('rewardType')} 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rewardNote" className="text-sm font-medium text-gray-700">
                      Reward Note
                    </Label>
                    <Textarea 
                      id="rewardNote" 
                      rows={2} 
                      data-testid="reward-note-input"
                      {...register('rewardNote')} 
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox 
                      id="kycRequired" 
                      checked={watch('kycRequired')} 
                      onCheckedChange={(value) => form.setValue('kycRequired', Boolean(value))} 
                    />
                    <Label htmlFor="kycRequired" className="text-sm font-medium text-gray-700">
                      KYC Required
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="requiresWallet"
                      checked={watch('requiresWallet')}
                      onCheckedChange={(value) => form.setValue('requiresWallet', Boolean(value))}
                    />
                    <Label htmlFor="requiresWallet" className="text-sm font-medium text-gray-700">
                      Requires Wallet
                    </Label>
                  </div>

                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="hasDashboard"
                      checked={watch('hasDashboard')}
                      onCheckedChange={(value) => form.setValue('hasDashboard', Boolean(value))}
                    />
                    <Label htmlFor="hasDashboard" className="text-sm font-medium text-gray-700">
                      Dashboard Available
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="logoUrl" className="text-sm font-medium text-gray-700">
                      Logo URL
                    </Label>
                    <Input 
                      id="logoUrl" 
                      {...register('logoUrl')} 
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="heroImageUrl" className="text-sm font-medium text-gray-700">
                      Hero Image URL
                    </Label>
                    <Input 
                      id="heroImageUrl" 
                      {...register('heroImageUrl')} 
                      className="mt-1"
                    />
                  </div>

                  <ChipInput
                    id="tags"
                    label="Tags"
                    data-testid="tags-input"
                    value={watch('tags') ? watch('tags').split(',').map(t => t.trim()).filter(Boolean) : []}
                    onChange={(chips) => form.setValue('tags', chips.join(', '))}
                    placeholder="Type tag and press Enter"
                    error={errors.tags?.message}
                  />

                  <ChipInput
                    id="categories"
                    label="Categories"
                    value={watch('categories') ? watch('categories').split(',').map(t => t.trim()).filter(Boolean) : []}
                    onChange={(chips) => form.setValue('categories', chips.join(', '))}
                    placeholder="Type category and press Enter"
                    error={errors.categories?.message}
                  />
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="websiteUrl" className="text-sm font-medium text-gray-700">
                        Website
                      </Label>
                      <Input 
                        id="websiteUrl" 
                        data-testid="website-url-input"
                        {...register('websiteUrl')} 
                        className="mt-1"
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="githubUrl" className="text-sm font-medium text-gray-700">
                        GitHub
                      </Label>
                      <Input 
                        id="githubUrl" 
                        data-testid="github-url-input"
                        {...register('githubUrl')} 
                        className="mt-1"
                        placeholder="https://github.com/example"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="twitterUrl" className="text-sm font-medium text-gray-700">
                        Twitter
                      </Label>
                      <Input 
                        id="twitterUrl" 
                        data-testid="twitter-url-input"
                        {...register('twitterUrl')} 
                        className="mt-1"
                        placeholder="https://twitter.com/example"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="discordUrl" className="text-sm font-medium text-gray-700">
                        Discord
                      </Label>
                      <Input 
                        id="discordUrl" 
                        data-testid="discord-url-input"
                        {...register('discordUrl')} 
                        className="mt-1"
                        placeholder="https://discord.gg/example"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dashboardUrl" className="text-sm font-medium text-gray-700">
                      Dashboard URL
                    </Label>
                    <Input 
                      id="dashboardUrl" 
                      data-testid="dashboard-url-input"
                      {...register('dashboardUrl')} 
                      className="mt-1"
                      placeholder="https://dashboard.example.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shortDescription" className="text-sm font-medium text-gray-700">
                      Short Description
                    </Label>
                    <Textarea 
                      id="shortDescription" 
                      rows={3} 
                      data-testid="short-description-input"
                      {...register('shortDescription')} 
                      className="mt-1"
                      placeholder="Brief description of the testnet..."
                    />
                  </div>

                  <MultiField
                    id="highlights"
                    label="Highlights"
                    value={watch('highlights') ? watch('highlights').split('\n').filter(Boolean) : []}
                    onChange={(items) => form.setValue('highlights', items.join('\n'))}
                    placeholder="Enter highlight"
                    error={errors.highlights?.message}
                  />

                  <MultiField
                    id="prerequisites"
                    label="Prerequisites"
                    value={watch('prerequisites') ? watch('prerequisites').split('\n').filter(Boolean) : []}
                    onChange={(items) => form.setValue('prerequisites', items.join('\n'))}
                    placeholder="Enter prerequisite"
                    error={errors.prerequisites?.message}
                  />

                  <MultiField
                    id="gettingStarted"
                    label="Getting Started Steps"
                    value={watch('gettingStarted') ? watch('gettingStarted').split('\n').filter(Boolean) : []}
                    onChange={(items) => form.setValue('gettingStarted', items.join('\n'))}
                    placeholder="Enter step"
                    error={errors.gettingStarted?.message}
                  />
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Discord Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rolesFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Role</Label>
                          <Input {...register(`discordRoles.${index}.role` as const)} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Requirement</Label>
                          <Input {...register(`discordRoles.${index}.requirement` as const)} className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Perks</Label>
                          <Input {...register(`discordRoles.${index}.perks` as const)} className="mt-1" />
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => rolesFieldArray.remove(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => rolesFieldArray.append({ role: '', requirement: '', perks: '' })}
                  >
                    Add Role
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {taskFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Title</Label>
                          <Input {...register(`tasks.${index}.title` as const)} className="mt-1" data-testid={`task-title-${index}`} />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Reward</Label>
                          <Input {...register(`tasks.${index}.reward` as const)} className="mt-1" data-testid={`task-reward-${index}`} />
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Description</Label>
                          <Textarea 
                            rows={2} 
                            {...register(`tasks.${index}.description` as const)} 
                            className="mt-1"
                            data-testid={`task-description-${index}`}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">URL</Label>
                          <Input {...register(`tasks.${index}.url` as const)} className="mt-1" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Order</Label>
                          <Input 
                            type="number" 
                            className="w-24 mt-1" 
                            {...register(`tasks.${index}.order` as const, { valueAsNumber: true })} 
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => taskFieldArray.remove(index)}
                        >
                          Remove Task
                        </Button>
                      </div>
                    </div>
                  ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      data-testid="add-task-button"
                      onClick={() => taskFieldArray.append({ 
                        title: '', 
                        description: '', 
                        url: '', 
                        reward: '', 
                        order: taskFieldArray.fields.length 
                      })}
                    >
                      Add Task
                    </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button 
                  type="submit" 
                  disabled={status === 'saving' || !isDirty}
                  className="min-w-[120px]"
                  data-testid="save-button"
                >
                  {status === 'saving' ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </section>
          </form>
        </div>

        {/* Live Preview Section */}
        <div className="w-96 shrink-0">
          <Card className="border-gray-200 sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview content will be rendered here */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {previewData.logoUrl ? (
                      <img 
                        className="h-12 w-12 rounded-full object-cover" 
                        src={previewData.logoUrl} 
                        alt={`${previewData.network} logo`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-500">
                          {previewData.network.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900" data-testid="preview-name">{previewData.name}</h3>
                    <p className="text-sm text-gray-600" data-testid="preview-network">{previewData.network}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    previewData.status === 'LIVE' ? 'bg-green-100 text-green-800' :
                    previewData.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    previewData.status === 'ENDED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`} data-testid="preview-status">
                    {previewData.status}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    previewData.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    previewData.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`} data-testid="preview-difficulty">
                    {previewData.difficulty}
                  </span>
                </div>

                {previewData.shortDescription && (
                  <p className="text-sm text-gray-700" data-testid="preview-description">{previewData.shortDescription}</p>
                )}

                {previewData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {previewData.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded" data-testid={`preview-tag-${tag.toLowerCase()}`}>
                        {tag}
                      </span>
                    ))}
                    {previewData.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        +{previewData.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  {previewData.estTimeMinutes && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Est. Time:</span>
                      <span className="ml-2">{previewData.estTimeMinutes}m</span>
                    </div>
                  )}
                  {previewData.rewardType && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Reward:</span>
                      <span className="ml-2">{previewData.rewardType}</span>
                    </div>
                  )}
                  {previewData.totalRaisedUSD && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium">Funding:</span>
                      <span className="ml-2">${Number(previewData.totalRaisedUSD).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {previewData.highlights.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Highlights</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {previewData.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewData.tasks.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tasks ({previewData.tasks.length})</h4>
                    <div className="space-y-2">
                      {previewData.tasks.slice(0, 3).map((task, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">{task.title}</span>
                          {task.reward && (
                            <span className="ml-2 text-green-600">({task.reward})</span>
                          )}
                        </div>
                      ))}
                      {previewData.tasks.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{previewData.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
