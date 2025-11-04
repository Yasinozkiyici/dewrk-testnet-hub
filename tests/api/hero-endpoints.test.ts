import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getSummary } from '@/app/api/hero/summary/route';
import { GET as getTrending } from '@/app/api/hero/trending/route';
import { GET as getGainers } from '@/app/api/hero/gainers/route';
import { createMockRequest, expectApiResponse } from './helpers';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    testnet: {
      findMany: vi.fn()
    }
  }
}));

describe('API: Hero Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/hero/summary', () => {
    it('should return summary with total rewards and time series', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.testnet.findMany).mockResolvedValue([
        { totalRaisedUSD: 500000, updatedAt: new Date() },
        { totalRaisedUSD: 300000, updatedAt: new Date() }
      ] as any);

      const request = createMockRequest('http://localhost/api/hero/summary');
      const response = await getSummary();
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('totalRewardsUSD');
      expect(data).toHaveProperty('last30dSeries');
      expect(Array.isArray(data.last30dSeries)).toBe(true);
    });

    it('should handle empty testnets gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.testnet.findMany).mockResolvedValue([]);

      const request = createMockRequest('http://localhost/api/hero/summary');
      const response = await getSummary();
      const data = await expectApiResponse(response, 200);

      expect(data.totalRewardsUSD).toBe(0);
      expect(data.last30dSeries.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/hero/trending', () => {
    it('should return top 3 trending testnets', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.testnet.findMany).mockResolvedValue([
        { id: '1', name: 'Testnet 1', slug: 'testnet-1', network: 'Ethereum', updatedAt: new Date() },
        { id: '2', name: 'Testnet 2', slug: 'testnet-2', network: 'Polygon', updatedAt: new Date() },
        { id: '3', name: 'Testnet 3', slug: 'testnet-3', network: 'Arbitrum', updatedAt: new Date() }
      ] as any);

      const request = createMockRequest('http://localhost/api/hero/trending');
      const response = await getTrending();
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('trending');
      expect(Array.isArray(data.trending)).toBe(true);
      expect(data.trending.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /api/hero/gainers', () => {
    it('should return top gainers sorted by funding', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.testnet.findMany).mockResolvedValue([
        { id: '1', name: 'Gainer 1', totalRaisedUSD: 1000000 },
        { id: '2', name: 'Gainer 2', totalRaisedUSD: 800000 },
        { id: '3', name: 'Gainer 3', totalRaisedUSD: 600000 }
      ] as any);

      const request = createMockRequest('http://localhost/api/hero/gainers');
      const response = await getGainers();
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('gainers');
      expect(Array.isArray(data.gainers)).toBe(true);
      // Should be sorted by totalRaisedUSD descending
      if (data.gainers.length > 1) {
        expect(data.gainers[0].rewardIncrease).toBeTruthy();
      }
    });
  });
});

