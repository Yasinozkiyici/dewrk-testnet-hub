import { formatDistanceToNow, formatISO9075 } from 'date-fns';

export function formatUSD(value?: number | string | null) {
  if (value == null || value === '') {
    return '—';
  }

  const numeric = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return '—';
  }

  if (numeric >= 1_000_000_000) {
    return `$${(numeric / 1_000_000_000).toFixed(1)}B`;
  }

  if (numeric >= 1_000_000) {
    return `$${(numeric / 1_000_000).toFixed(1)}M`;
  }

  if (numeric >= 1_000) {
    return `$${(numeric / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numeric);
}

export function formatEstTime(minutes?: number | null) {
  if (!minutes) {
    return '—';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`;
  }

  const days = hours / 24;
  return `${days.toFixed(days % 1 === 0 ? 0 : 1)}d`;
}

export function formatRelative(date?: Date | string | null) {
  if (!date) {
    return { relative: '—', iso: undefined } as const;
  }

  const instance = date instanceof Date ? date : new Date(date);
  return {
    relative: formatDistanceToNow(instance, { addSuffix: true }),
    iso: formatISO9075(instance)
  } as const;
}
