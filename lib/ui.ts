export { cn } from './utils';

export const CHIP_BASE =
  'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition';

export const STATUS_VARIANTS: Record<string, string> = {
  LIVE: `${CHIP_BASE} border-emerald-200 bg-emerald-100 text-emerald-700`,
  PAUSED: `${CHIP_BASE} border-amber-200 bg-amber-100 text-amber-700`,
  ENDED: `${CHIP_BASE} border-slate-200 bg-slate-100 text-slate-600`,
  UPCOMING: `${CHIP_BASE} border-sky-200 bg-sky-100 text-sky-700`
};

export const DIFFICULTY_VARIANTS: Record<string, string> = {
  EASY: `${CHIP_BASE} border-emerald-200 bg-emerald-50 text-emerald-700`,
  MEDIUM: `${CHIP_BASE} border-amber-200 bg-amber-50 text-amber-700`,
  HARD: `${CHIP_BASE} border-rose-200 bg-rose-50 text-rose-700`
};

export const TAG_CHIP_CLASS =
  'inline-flex items-center rounded-full border border-white/50 bg-white/70 px-2 py-0.5 text-xs font-medium text-[var(--ink-2)]';

export const NA_CHIP_CLASS =
  'inline-flex items-center rounded-full border border-white/40 bg-white/50 px-2 py-0.5 text-xs font-medium text-[var(--ink-3)]';
