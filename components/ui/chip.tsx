import React from 'react';
import { cn } from '@/lib/utils';

type ChipVariant = 'status-live' | 'status-beta' | 'status-paused' | 'status-ended' | 'status-upcoming' |
                   'difficulty-easy' | 'difficulty-medium' | 'difficulty-hard' |
                   'tag' | 'na';

const CHIP_VARIANTS: Record<ChipVariant, string> = {
  'status-live': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'status-beta': 'bg-blue-50 text-blue-700 border-blue-200',
  'status-paused': 'bg-amber-50 text-amber-700 border-amber-200',
  'status-ended': 'bg-gray-50 text-gray-600 border-gray-200',
  'status-upcoming': 'bg-purple-50 text-purple-700 border-purple-200',
  'difficulty-easy': 'bg-green-50 text-green-700 border-green-200',
  'difficulty-medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'difficulty-hard': 'bg-red-50 text-red-700 border-red-200',
  'tag': 'bg-gray-50 text-gray-700 border-gray-200',
  'na': 'bg-gray-50 text-gray-400 border-gray-100'
};

interface ChipProps {
  variant: ChipVariant;
  children: React.ReactNode;
  className?: string;
}

export function Chip({ variant, children, className }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-medium',
        CHIP_VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper functions for status and difficulty
export function getStatusVariant(status: string): ChipVariant {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'LIVE':
      return 'status-live';
    case 'BETA':
      return 'status-beta';
    case 'PAUSED':
      return 'status-paused';
    case 'ENDED':
      return 'status-ended';
    default:
      return 'status-upcoming';
  }
}

export function getDifficultyVariant(difficulty: string): ChipVariant {
  const normalized = difficulty.toUpperCase();
  switch (normalized) {
    case 'EASY':
      return 'difficulty-easy';
    case 'HARD':
      return 'difficulty-hard';
    default:
      return 'difficulty-medium';
  }
}

