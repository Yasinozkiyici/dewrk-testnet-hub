import { Suspense } from 'react';
import { ApiSection } from '@/components/api/ApiSection';

export default function ApiPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-soft)]">
      <Suspense fallback={<div className="h-64 animate-pulse bg-white/60" />}>
        <ApiSection />
      </Suspense>
    </main>
  );
}

