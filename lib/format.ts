import { formatDistanceToNowStrict, formatISO9075 } from 'date-fns';

export function formatUSD(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return { display: 'N/A', isEmpty: true } as const;
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return { display: 'N/A', isEmpty: true } as const;
  }

  const absolute = Math.abs(numeric);
  const useCompact = absolute >= 1_000;
  const formatter = new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD',
    notation: useCompact ? 'compact' : 'standard',
    maximumFractionDigits: useCompact ? 1 : 0,
    minimumFractionDigits: 0
  });

  return {
    display: formatter.format(numeric),
    isEmpty: false
  } as const;
}

export function formatTimeMinutes(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return 'N/A';
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 'N/A';
  }

  if (numeric < 60) {
    return `${Math.round(numeric)}m`;
  }

  const hours = Math.floor(numeric / 60);
  const minutes = Math.round(numeric % 60);

  if (hours < 24) {
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours) {
    return `${days}d ${remainingHours}h`;
  }
  return `${days}d`;
}

export function formatUpdatedAt(value?: string | Date | null) {
  if (!value) {
    return { relative: 'N/A', iso: undefined } as const;
  }

  const instance = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(instance.getTime())) {
    return { relative: 'N/A', iso: undefined } as const;
  }

  try {
    return {
      relative: formatDistanceToNowStrict(instance, { addSuffix: true }),
      iso: formatISO9075(instance)
    } as const;
  } catch (_error) {
    return { relative: 'N/A', iso: undefined } as const;
  }
}

export function safeUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value, value.startsWith('http') ? undefined : 'https://');
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch (_error) {
    return undefined;
  }
  return undefined;
}
