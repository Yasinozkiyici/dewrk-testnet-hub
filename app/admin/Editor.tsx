'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDebounce } from '@/hooks/useDebounce';
import { ToastContainer, useToast } from '@/components/ui/toast';
import { TestnetPreview } from '@/components/admin/TestnetPreview';
import { TestnetForm } from '@/components/admin/TestnetForm';
import type { AdminFormValues } from '@/components/admin/types';
import {
  STATUS_OPTIONS,
  DIFFICULTY_OPTIONS,
  buildPreviewRecord,
  serializePayload,
  toAdminFormDefaults,
  type AdminTestnetRecord,
  type AdminTestnetUpdatePayload
} from '@/lib/admin/testnet-editor-helpers';

interface EditorProps {
  initialTestnet: AdminTestnetRecord | null;
  onSaved?: (result: {
    slug: string;
    name: string;
    payload: AdminTestnetUpdatePayload;
    response: any;
    previousSlug: string | null;
  }) => void;
}

export function Editor({ initialTestnet, onSaved }: EditorProps) {
  const router = useRouter();
  const { success, error, toasts, removeToast } = useToast();
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const defaultValues = useMemo(() => toAdminFormDefaults(initialTestnet), [initialTestnet]);

  const form = useForm<AdminFormValues>({
    mode: 'onBlur',
    defaultValues
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

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
      
      // TODO: Track changes for activity log
      const changes = initialTestnet
        ? Object.keys(payload).reduce((acc, key) => {
            const oldValue = (initialTestnet as any)[key];
            const newValue = payload[key as keyof typeof payload];
            if (oldValue !== newValue) {
              acc[key] = { old: oldValue, new: newValue };
            }
            return acc;
          }, {} as Record<string, { old: any; new: any }>)
        : undefined;

      const response = await fetch('/api/admin/testnets/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error ?? 'Request failed');
      }

      const json = await response.json();
      setStatus('success');
      success('Changes saved', 'The testnet has been updated successfully.');
      onSaved?.({
        slug: json?.slug ?? payload.slug ?? initialTestnet?.slug ?? '',
        name: json?.name ?? payload.name,
        payload,
        response: json,
        previousSlug: initialTestnet?.slug ?? payload.slug ?? null
      });

      // TODO: Log activity
      // await logActivity(
      //   currentUser.id,
      //   initialTestnet ? 'update' : 'create',
      //   'testnet',
      //   initialTestnet?.id ?? json.id,
      //   {
      //     resourceName: payload.name,
      //     changes,
      //     userName: currentUser.name,
      //     userEmail: currentUser.email
      //   }
      // );

      if (!onSaved && !initialTestnet && json?.slug) {
        router.replace(`/admin/content/testnets?slug=${json.slug}`);
      }
      if (!onSaved) {
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please review the inputs.';
      setStatus('error');
      error('Failed to save changes', message);
    } finally {
      // Reset status after a delay for better UX
      setTimeout(() => {
        if (status === 'success' || status === 'error') {
          setStatus('idle');
        }
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <TestnetForm
          form={form}
          status={status}
          statusOptions={STATUS_OPTIONS}
          difficultyOptions={DIFFICULTY_OPTIONS}
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
