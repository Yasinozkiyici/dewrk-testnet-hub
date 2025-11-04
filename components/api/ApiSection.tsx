'use client';

import React, { useEffect, useState } from 'react';
import { Code, ExternalLink, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  title: string;
  description?: string | null;
  category: string;
  authRequired: boolean;
  rateLimit?: number | null;
  deprecated: boolean;
  version: string;
  exampleRequest?: string | null;
  exampleResponse?: string | null;
}

export function ApiSection() {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEndpoints() {
      try {
        const res = await fetch('/api/api-endpoints', { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setEndpoints(data.items || []);
        }
      } catch (error) {
        console.warn('Failed to load API endpoints', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEndpoints();
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (endpoints.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-12 text-center shadow-glass">
          <Code className="mx-auto h-12 w-12 text-[var(--ink-3)]" />
          <p className="mt-4 text-sm text-[var(--ink-3)]">No API endpoints documented yet</p>
        </div>
      </section>
    );
  }

  const endpointsByCategory = endpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) acc[endpoint.category] = [];
    acc[endpoint.category].push(endpoint);
    return acc;
  }, {} as Record<string, ApiEndpoint[]>);

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">API Documentation</h2>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Access testnet data programmatically with our REST API
        </p>
      </div>

      {Object.entries(endpointsByCategory).map(([category, categoryEndpoints]) => (
        <div key={category} className="mb-12">
          <h3 className="mb-4 capitalize text-lg font-semibold text-[var(--ink-1)]">
            {category.replace('_', ' ')}
          </h3>
          <div className="space-y-4">
            {categoryEndpoints.map((endpoint) => (
              <ApiEndpointCard key={endpoint.id} endpoint={endpoint} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function ApiEndpointCard({ endpoint }: { endpoint: ApiEndpoint }) {
  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-green-500/20 text-green-700';
      case 'POST':
        return 'bg-blue-500/20 text-blue-700';
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-700';
      case 'DELETE':
        return 'bg-red-500/20 text-red-700';
      default:
        return 'bg-gray-500/20 text-gray-700';
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass transition-all duration-150 ease-out hover:border-white/60 hover:translate-y-[1px]',
        endpoint.deprecated && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide',
                getMethodColor(endpoint.method)
              )}
            >
              {endpoint.method}
            </span>
            <code className="text-sm font-mono font-semibold text-[var(--ink-1)]">
              {endpoint.path}
            </code>
            {endpoint.authRequired && (
              <span className="flex items-center gap-1 rounded-md bg-orange-500/20 px-2 py-1 text-[10px] font-medium text-orange-700">
                <Lock className="h-3 w-3" />
                Auth
              </span>
            )}
            {endpoint.deprecated && (
              <span className="rounded-md bg-red-500/20 px-2 py-1 text-[10px] font-medium text-red-700">
                Deprecated
              </span>
            )}
            {endpoint.version && (
              <span className="text-[10px] text-[var(--ink-3)]">v{endpoint.version}</span>
            )}
          </div>

          <h3 className="mt-2 text-sm font-semibold text-[var(--ink-1)]">{endpoint.title}</h3>
          {endpoint.description && (
            <p className="mt-1 text-xs text-[var(--ink-2)]">{endpoint.description}</p>
          )}

          {endpoint.rateLimit && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[var(--ink-3)]">
              <Clock className="h-3 w-3" />
              <span>Rate limit: {endpoint.rateLimit} req/min</span>
            </div>
          )}

          {endpoint.exampleRequest && (
            <div className="mt-4 rounded-lg bg-[var(--ink-1)]/5 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                Example Request
              </p>
              <pre className="overflow-x-auto text-xs text-[var(--ink-2)]">
                <code>{endpoint.exampleRequest}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

