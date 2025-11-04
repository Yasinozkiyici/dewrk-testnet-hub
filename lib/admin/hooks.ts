/**
 * Admin CRUD Hooks
 * 
 * Supabase-backed data fetching and mutations for admin panel.
 * Includes optimistic updates and error handling.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UseCrudOptions<TData = any> {
  endpoint: string;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  optimisticUpdate?: (data: Partial<TData>) => TData;
}

export interface UseCrudResult<TData = any, TPayload = any> {
  create: (payload: TPayload) => Promise<TData | null>;
  update: (id: string, payload: Partial<TPayload>) => Promise<TData | null>;
  delete: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Generic CRUD hook for Supabase-backed admin operations
 * 
 * Usage:
 * ```tsx
 * const { create, update, delete: deleteItem, isLoading } = useCrud({
 *   endpoint: '/api/admin/testnets',
 *   onSuccess: (data) => router.refresh()
 * });
 * ```
 */
export function useCrud<TData = any, TPayload = any>(
  options: UseCrudOptions<TData>
): UseCrudResult<TData, TPayload> {
  const { endpoint, onSuccess, onError, optimisticUpdate } = options;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(
    async (payload: TPayload): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error ?? 'Failed to create');
        }

        const data = await response.json();
        onSuccess?.(data);
        router.refresh();
        return data as TData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, onSuccess, onError, router]
  );

  const update = useCallback(
    async (id: string, payload: Partial<TPayload>): Promise<TData | null> => {
      setIsLoading(true);
      setError(null);
      try {
        // Optimistic update if provided
        if (optimisticUpdate) {
          // TODO: Apply optimistic update to local state
        }

        const response = await fetch(`${endpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error ?? 'Failed to update');
        }

        const data = await response.json();
        onSuccess?.(data);
        router.refresh();
        return data as TData;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, onSuccess, onError, optimisticUpdate, router]
  );

  const deleteItem = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${endpoint}/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          const json = await response.json().catch(() => ({}));
          throw new Error(json.error ?? 'Failed to delete');
        }

        onSuccess?.(null as any);
        router.refresh();
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [endpoint, onSuccess, onError, router]
  );

  return {
    create,
    update,
    delete: deleteItem,
    isLoading,
    error
  };
}

/**
 * Hook for fetching a single item by ID
 */
export function useItem<TData = any>(endpoint: string, id: string | null) {
  const [data, setData] = useState<TData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchItem = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${endpoint}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const json = await response.json();
      setData(json as TData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, id]);

  // TODO: Add useEffect to auto-fetch when id changes

  return { data, isLoading, error, refetch: fetchItem };
}

/**
 * Hook for testnet CRUD operations
 */
export function useTestnetCrud() {
  return useCrud({
    endpoint: '/api/admin/testnets/upsert',
    onSuccess: (data) => {
      // TODO: Add toast notification
      console.log('Testnet saved:', data);
    },
    onError: (error) => {
      console.error('Failed to save testnet:', error);
      // TODO: Show error toast
    }
  });
}

