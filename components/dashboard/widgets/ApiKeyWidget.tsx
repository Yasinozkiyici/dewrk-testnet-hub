'use client';

import React, { useEffect, useState } from 'react';
import { Key, Copy, Check, Eye, EyeOff, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  rateLimit: number;
  requestsUsed: number;
  isActive: boolean;
}

interface ApiKeyWidgetProps {
  userId: string;
}

export function ApiKeyWidget({ userId }: ApiKeyWidgetProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadApiKeys() {
      try {
        // TODO: Real API call - GET /api/dashboard/api-keys
        // const res = await fetch(`/api/dashboard/api-keys?userId=${userId}`);
        // const data = await res.json();
        // setApiKeys(data.items || []);

        // MOCK DATA - Remove when real API is ready
        await new Promise((resolve) => setTimeout(resolve, 300));
        setApiKeys(getMockApiKeys());
      } catch (error) {
        console.error('[ApiKeyWidget] Failed to load API keys:', error);
        setApiKeys([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadApiKeys();
  }, [userId]);

  const handleCopy = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return <ApiKeyWidgetSkeleton />;
  }

  const activeKey = apiKeys.find((k) => k.isActive);

  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">API Keys</h2>
          <p className="mt-0.5 text-xs text-[var(--ink-3)]">Manage your API access</p>
        </div>
        <button
          className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/70 px-2 py-1 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          onClick={() => {
            // TODO: Open create API key modal
            alert('Create API key - TODO: Implement modal');
          }}
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </div>

      {!activeKey ? (
        <div className="py-8 text-center">
          <Key className="mx-auto h-8 w-8 text-[var(--ink-3)]" />
          <p className="mt-2 text-sm text-[var(--ink-3)]">No API keys</p>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/70 px-4 py-2 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            onClick={() => {
              // TODO: Open create API key modal
              alert('Create API key - TODO: Implement modal');
            }}
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-white/40 bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-[var(--ink-3)]" />
                <span className="text-sm font-medium text-[var(--ink-1)]">{activeKey.name}</span>
              </div>
              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                Active
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-[var(--ink-1)]/5 p-2">
              <code className="flex-1 font-mono text-xs text-[var(--ink-2)]">
                {revealedIds.has(activeKey.id)
                  ? activeKey.key
                  : activeKey.key.slice(0, 8) + '•'.repeat(20) + activeKey.key.slice(-8)}
              </code>
              <button
                onClick={() => toggleReveal(activeKey.id)}
                className="inline-flex items-center justify-center rounded p-1 text-[var(--ink-3)] transition hover:bg-white/60 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                aria-label={revealedIds.has(activeKey.id) ? 'Hide key' : 'Reveal key'}
              >
                {revealedIds.has(activeKey.id) ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleCopy(activeKey.key, activeKey.id)}
                className="inline-flex items-center justify-center rounded p-1 text-[var(--ink-3)] transition hover:bg-white/60 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                aria-label="Copy key"
              >
                {copiedId === activeKey.id ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[var(--ink-3)]">Rate Limit</p>
                <p className="font-semibold text-[var(--ink-1)]">{activeKey.rateLimit}/min</p>
              </div>
              <div>
                <p className="text-[var(--ink-3)]">Usage</p>
                <p className="font-semibold text-[var(--ink-1)]">
                  {activeKey.requestsUsed}/{activeKey.rateLimit}
                </p>
              </div>
            </div>

            {activeKey.lastUsed && (
              <p className="mt-2 text-[10px] text-[var(--ink-3)]">
                Last used: {new Date(activeKey.lastUsed).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TODO: Add API key management (revoke, regenerate) */}
    </div>
  );
}

function ApiKeyWidgetSkeleton() {
  return (
    <div className="h-48 animate-pulse rounded-2xl border border-white/40 bg-white/60" />
  );
}

// TODO: Remove when real API is ready
function getMockApiKeys(): ApiKey[] {
  return [
    {
      id: '1',
      name: 'Production Key',
      key: 'dewrk_live_1234567890abcdefghijklmnopqrstuvwxyz',
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      rateLimit: 100,
      requestsUsed: 42,
      isActive: true
    }
  ];
}

