'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Reusable Form Section Component
 * 
 * Usage:
 * ```tsx
 * <FormSection title="Basics" description="Primary metadata">
 *   <Field label="Name" error={errors.name?.message}>
 *     <Input {...register('name')} />
 *   </Field>
 * </FormSection>
 * ```
 */

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}: FormSectionProps) {
  // TODO: Add collapsible state management if needed
  // const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <section
      className={cn(
        'rounded-2xl border border-white/40 bg-white/80 p-6 shadow-glass',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--ink-1)]">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-[var(--ink-2)]">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label label={label} required={required} />
      {children}
      {error && <FieldError message={error} />}
      {!error && hint && <FieldHint message={hint} />}
    </div>
  );
}

interface LabelProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
}

export function Label({ label, required, htmlFor }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold uppercase tracking-wide text-[var(--ink-1)]"
    >
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

interface FieldErrorProps {
  message: string;
}

export function FieldError({ message }: FieldErrorProps) {
  return <p className="text-xs text-red-600">{message}</p>;
}

interface FieldHintProps {
  message: string;
}

export function FieldHint({ message }: FieldHintProps) {
  return <p className="text-xs text-[var(--ink-3)]">{message}</p>;
}

