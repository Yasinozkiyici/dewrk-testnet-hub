'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackNewsletterSignup } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface NewsletterFormProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  className?: string;
}

export default function NewsletterForm({
  title = 'Join the Dewrk Newsletter',
  description = 'Weekly updates on new testnets and community rewards.',
  buttonLabel = 'Subscribe',
  successMessage = 'Subscribed!',
  errorMessage = 'Something went wrong. Try again.',
  className
}: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const subscribe = async () => {
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setStatus('success');
      trackNewsletterSignup(email);
      setEmail('');
    } catch (error) {
      console.error('[newsletter] subscription failed', error);
      setStatus('error');
    }
  };

  return (
    <div className={cn('rounded-xl border border-white/40 bg-white/30 p-6 backdrop-blur-md shadow-glass', className)}>
      <h3 className="text-lg font-semibold text-[var(--ink-1)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-2)]">{description}</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1"
          type="email"
          aria-label="Email address"
          disabled={status === 'loading'}
        />
        <Button onClick={subscribe} disabled={!email || status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : buttonLabel}
        </Button>
      </div>
      {status === 'success' && <p className="mt-2 text-sm text-emerald-600">{successMessage}</p>}
      {status === 'error' && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
}
