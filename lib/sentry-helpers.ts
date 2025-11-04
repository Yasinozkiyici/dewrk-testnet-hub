/**
 * Sentry Helper Functions
 * 
 * Bu dosya Sentry logging için helper fonksiyonlar içerir.
 * Context-rich error logging için kullanılır.
 */

import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  endpoint?: string;
  method?: string;
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Log error to Sentry with rich context
 */
export function logErrorWithContext(
  error: Error | unknown,
  context: ErrorContext = {}
) {
  if (typeof window !== 'undefined') {
    // Client-side - use client Sentry
    return;
  }

  if (!process.env.SENTRY_DSN) {
    // Sentry not configured, just log to console
    console.error('[Sentry] Error (Sentry not configured):', error, context);
    return;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  Sentry.captureException(error, {
    tags: {
      endpoint: context.endpoint || 'unknown',
      method: context.method || 'unknown',
      action: context.action || 'unknown',
      environment: process.env.NODE_ENV || 'development'
    },
    extra: {
      ...context.metadata,
      errorMessage,
      errorStack
    },
    user: context.userId ? { id: context.userId } : undefined
  });
}

/**
 * Log API error with request context
 */
export function logApiError(
  error: Error | unknown,
  endpoint: string,
  method: string = 'GET',
  additionalContext?: Record<string, any>
) {
  logErrorWithContext(error, {
    endpoint,
    method,
    ...additionalContext
  });
}

/**
 * Log admin action error
 */
export function logAdminError(
  error: Error | unknown,
  action: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  logErrorWithContext(error, {
    endpoint: '/api/admin',
    action,
    userId,
    metadata
  });
}

/**
 * Log database error
 */
export function logDatabaseError(
  error: Error | unknown,
  operation: string,
  table?: string,
  metadata?: Record<string, any>
) {
  logErrorWithContext(error, {
    endpoint: 'database',
    action: operation,
    metadata: {
      table,
      operation,
      ...metadata
    }
  });
}

