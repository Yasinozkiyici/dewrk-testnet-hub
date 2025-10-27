'use client';

import { Fragment, type ReactNode } from 'react';
import {
  Controller,
  type UseFieldArrayReturn,
  type UseFormReturn
} from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChipInput } from '@/components/ui/chip-input';
import { MultiField } from '@/components/ui/multi-field';
import type { AdminFormValues } from '@/components/admin/types';
import { cn } from '@/lib/utils';

interface TestnetFormProps {
  form: UseFormReturn<AdminFormValues>;
  status: 'idle' | 'saving' | 'success' | 'error';
  statusOptions: readonly ['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'];
  difficultyOptions: readonly ['EASY', 'MEDIUM', 'HARD'];
  onSubmit: (values: AdminFormValues) => void;
  discordRolesArray: UseFieldArrayReturn<AdminFormValues, 'discordRoles'>;
  gettingStartedArray: UseFieldArrayReturn<AdminFormValues, 'gettingStarted'>;
  tasksArray: UseFieldArrayReturn<AdminFormValues, 'tasks'>;
}

export function TestnetForm({
  form,
  status,
  statusOptions,
  difficultyOptions,
  onSubmit,
  discordRolesArray,
  gettingStartedArray,
  tasksArray
}: TestnetFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = form;

  const tags = watch('tags') ?? [];
  const categories = watch('categories') ?? [];
  const highlights = watch('highlights') ?? [];
  const prerequisites = watch('prerequisites') ?? [];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glass"
    >
      <Section title="Basics" description="Primary metadata shown on listings and detail views.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" error={errors.name?.message}>
            <Input data-testid="name-input" {...register('name')} placeholder="Testnet name" />
          </Field>
          <Field label="Network" error={errors.network?.message}>
            <Input data-testid="network-input" {...register('network')} placeholder="Underlying network" />
          </Field>
          <Field label="Status">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="status-select">
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
              )}
            />
          </Field>
          <Field label="Difficulty">
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="difficulty-select">
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
              )}
            />
          </Field>
        </div>
        <Field label="Short description" error={errors.shortDescription?.message}>
          <Textarea
            {...register('shortDescription')}
            placeholder="One or two sentences summarising the programme"
            rows={3}
          />
        </Field>
        <Field label="Detailed description" error={errors.description?.message}>
          <Textarea
            {...register('description')}
            placeholder="Longer narrative used on the detail page"
            rows={4}
          />
        </Field>
      </Section>

      <Section title="Media" description="Logos and hero visuals power the preview.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Logo URL" error={errors.logoUrl?.message}>
            <Input {...register('logoUrl')} placeholder="https://..." />
          </Field>
          <Field label="Hero image URL" error={errors.heroImageUrl?.message}>
            <Input {...register('heroImageUrl')} placeholder="https://..." />
          </Field>
        </div>
      </Section>

      <Section title="Programme metrics" description="Reward expectations and time investment.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Estimated time (minutes)" error={errors.estTimeMinutes?.message}>
            <Input {...register('estTimeMinutes')} placeholder="120" inputMode="numeric" />
          </Field>
          <Field label="Reward type" error={errors.rewardType?.message}>
            <Input {...register('rewardType')} placeholder="Token, points, etc." />
          </Field>
          <Field label="Reward note" error={errors.rewardNote?.message}>
            <Input {...register('rewardNote')} placeholder="Additional context" />
          </Field>
        </div>
        <Field label="Total funding (USD)" error={errors.totalRaisedUSD?.message}>
          <Input {...register('totalRaisedUSD')} placeholder="500000" inputMode="decimal" />
        </Field>
      </Section>

      <Section title="Access requirements" description="Control what contributors need before joining.">
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="kycRequired"
            control={control}
            render={({ field }) => (
              <ToggleField label="KYC required" description="Mark if KYC or identity verification is mandatory.">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </ToggleField>
            )}
          />
          <Controller
            name="requiresWallet"
            control={control}
            render={({ field }) => (
              <ToggleField label="Wallet required" description="Mark if contributors must connect a wallet.">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </ToggleField>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="hasDashboard"
            control={control}
            render={({ field }) => (
              <ToggleField label="Dashboard available" description="Show the dashboard CTA on listings.">
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </ToggleField>
            )}
          />
          <Field label="Dashboard URL" error={errors.dashboardUrl?.message}>
            <Input {...register('dashboardUrl')} placeholder="https://dashboard..." />
          </Field>
        </div>
      </Section>

      <Section title="Taxonomy" description="Tags and categories improve discoverability.">
        <div className="grid gap-4 md:grid-cols-2">
          <ChipInput
            label="Tags"
            value={tags}
            onChange={(value) => setValue('tags', value, { shouldDirty: true })}
          />
          <ChipInput
            label="Categories"
            value={categories}
            onChange={(value) => setValue('categories', value, { shouldDirty: true })}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <MultiField
            label="Highlights"
            value={highlights}
            onChange={(value) => setValue('highlights', value, { shouldDirty: true })}
            placeholder="Add highlight"
          />
          <MultiField
            label="Prerequisites"
            value={prerequisites}
            onChange={(value) => setValue('prerequisites', value, { shouldDirty: true })}
            placeholder="Add prerequisite"
          />
        </div>
      </Section>

      <Section title="Getting started" description="Outline the onboarding journey with actionable steps.">
        <div className="space-y-4">
          {gettingStartedArray.fields.map((field, index) => (
            <Fragment key={field.id}>
              <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                    Step {index + 1}
                  </h3>
                  {gettingStartedArray.fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => gettingStartedArray.remove(index)}
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-3 grid gap-3">
                  <Field label="Title">
                    <Input
                      {...register(`gettingStarted.${index}.title` as const)}
                      placeholder="Step title"
                    />
                  </Field>
                  <Field label="Body">
                    <Textarea
                      {...register(`gettingStarted.${index}.body` as const)}
                      rows={3}
                      placeholder="Explain what contributors should do"
                    />
                  </Field>
                  <Field label="Link">
                    <Input
                      {...register(`gettingStarted.${index}.url` as const)}
                      placeholder="https://guide..."
                    />
                  </Field>
                </div>
              </div>
            </Fragment>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => gettingStartedArray.append({ title: '', body: '', url: '' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add step
          </Button>
        </div>
      </Section>

      <Section title="Discord roles" description="Document community roles and unlock criteria.">
        <div className="space-y-4">
          {discordRolesArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                  Role {index + 1}
                </h3>
                {discordRolesArray.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => discordRolesArray.remove(index)}
                    aria-label="Remove role"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Field label="Role">
                  <Input {...register(`discordRoles.${index}.role` as const)} placeholder="Contributor" />
                </Field>
                <Field label="Requirement">
                  <Input
                    {...register(`discordRoles.${index}.requirement` as const)}
                    placeholder="eg. Submit 3 tasks"
                  />
                </Field>
                <Field label="Perks">
                  <Input
                    {...register(`discordRoles.${index}.perks` as const)}
                    placeholder="eg. Private channels"
                  />
                </Field>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => discordRolesArray.append({ role: '', requirement: '', perks: '' })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add role
          </Button>
        </div>
      </Section>

      <Section title="Social links" description="Direct contributors to official resources.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Website" error={errors.websiteUrl?.message}>
            <Input {...register('websiteUrl')} placeholder="https://..." />
          </Field>
          <Field label="GitHub" error={errors.githubUrl?.message}>
            <Input {...register('githubUrl')} placeholder="https://github.com/..." />
          </Field>
          <Field label="Twitter" error={errors.twitterUrl?.message}>
            <Input {...register('twitterUrl')} placeholder="https://twitter.com/..." />
          </Field>
          <Field label="Discord" error={errors.discordUrl?.message}>
            <Input {...register('discordUrl')} placeholder="https://discord.gg/..." />
          </Field>
        </div>
      </Section>

      <Section title="Tasks" description="Optional list of quests or actions for contributors.">
        <div className="space-y-4">
          {tasksArray.fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                  Task {index + 1}
                </h3>
                {tasksArray.fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => tasksArray.remove(index)}
                    aria-label="Remove task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <Field label="Title">
                  <Input {...register(`tasks.${index}.title` as const)} placeholder="Task title" />
                </Field>
                <Field label="Reward">
                  <Input {...register(`tasks.${index}.reward` as const)} placeholder="Optional reward" />
                </Field>
                <Field label="Description" className="lg:col-span-2">
                  <Textarea
                    {...register(`tasks.${index}.description` as const)}
                    rows={3}
                    placeholder="What should contributors do?"
                  />
                </Field>
                <Field label="Link">
                  <Input {...register(`tasks.${index}.url` as const)} placeholder="https://guide..." />
                </Field>
                <Field label="Order">
                  <Input
                    {...register(`tasks.${index}.order` as const, { valueAsNumber: true })}
                    placeholder="0"
                    inputMode="numeric"
                  />
                </Field>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => tasksArray.append({ title: '', description: '', url: '', reward: '', order: tasksArray.fields.length })}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add task
          </Button>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-[var(--ink-1)]">{title}</h2>
        <p className="text-xs text-[var(--ink-3)]">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  error,
  className
}: {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ToggleField({
  label,
  description,
  children
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 p-4">
      {children}
      <div>
        <p className="text-sm font-semibold text-[var(--ink-1)]">{label}</p>
        <p className="text-xs text-[var(--ink-3)]">{description}</p>
      </div>
    </div>
  );
}
