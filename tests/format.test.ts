import { describe, expect, it, vi } from 'vitest';
import { formatTimeMinutes, formatUSD, formatUpdatedAt } from '@/lib/format';

describe('format helpers', () => {
  describe('formatUSD', () => {
    it('returns compact notation for thousands', () => {
      const { display, isEmpty } = formatUSD(12_400);
      expect(isEmpty).toBe(false);
      expect(display).toMatch(/\$?12(\.\d)?K/i);
    });

    it('returns dash for invalid values', () => {
      const result = formatUSD('not-a-number');
      expect(result.isEmpty).toBe(true);
      expect(result.display).toBe('N/A');
    });
  });

  describe('formatTimeMinutes', () => {
    it('formats minutes under an hour', () => {
      expect(formatTimeMinutes(45)).toBe('45m');
    });

    it('formats hours and days correctly', () => {
      expect(formatTimeMinutes(120)).toBe('2h');
      expect(formatTimeMinutes(135)).toBe('2h 15m');
      expect(formatTimeMinutes(1500)).toBe('1d 1h');
    });
  });

  describe('formatUpdatedAt', () => {
    it('returns N/A for invalid date', () => {
      const result = formatUpdatedAt('not-a-date');
      expect(result.relative).toBe('N/A');
      expect(result.iso).toBeUndefined();
    });

    it('returns relative and iso values for valid dates', () => {
      vi.useFakeTimers();
      const now = new Date();
      vi.setSystemTime(now.getTime());
      const past = new Date(now.getTime() - 60 * 60 * 1000);
      const result = formatUpdatedAt(past);
      expect(result.relative).toContain('ago');
      expect(result.iso).toBeDefined();
      vi.useRealTimers();
    });
  });
});
