import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/testnets/route';
import { createMockRequest, expectApiResponse, expectErrorResponse } from './helpers';

const { findManyMock, countMock } = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  countMock: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    testnet: {
      findMany: findManyMock,
      count: countMock
    }
  }
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn)
}));

describe('API: /api/testnets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findManyMock.mockReset();
    countMock.mockReset();
  });

  describe('GET /api/testnets', () => {
    it('should return testnets list with correct structure', async () => {
      findManyMock.mockResolvedValueOnce([
        {
          id: '1',
          slug: 'test-testnet',
          name: 'Test Testnet',
          network: 'Ethereum',
          status: 'LIVE',
          difficulty: 'MEDIUM',
          shortDescription: 'Demo testnet',
          logoUrl: '/logos/test.png',
          estTimeMinutes: 30,
          rewardType: 'Points',
          rewardNote: null,
          kycRequired: false,
          requiresWallet: true,
          tags: [],
          tasksCount: 0,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          hasDashboard: false,
          totalRaisedUSD: 1000000,
          dashboardUrl: null,
          websiteUrl: 'https://example.com',
          githubUrl: null,
          twitterUrl: null,
          discordUrl: null,
          startDate: null,
          hasFaucet: false,
          rewardCategory: null,
          rewardRangeUSD: null,
          discordRoles: []
        }
      ]);
      countMock.mockResolvedValueOnce(1);

      const request = createMockRequest('http://localhost/api/testnets?page=1&pageSize=40');
      const response = await GET(request);
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.items.length).toBeGreaterThan(0);
      expect(data).toHaveProperty('pagination');
      expect(data.pagination.total).toBe(1);
      expect(findManyMock).toHaveBeenCalledWith({
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 40
      });
    });

    it('should handle empty results gracefully', async () => {
      findManyMock.mockResolvedValueOnce([]);
      countMock.mockResolvedValueOnce(0);

      const request = createMockRequest('http://localhost/api/testnets');
      const response = await GET(request);
      const data = await expectApiResponse(response, 200);

      expect(data.source).toBe('mock');
      expect(data.pagination.total).toBe(0);
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should handle database errors with proper error response', async () => {
      findManyMock.mockRejectedValueOnce(new Error('Database connection failed'));
      countMock.mockResolvedValueOnce(0);

      const request = createMockRequest('http://localhost/api/testnets');
      const response = await GET(request);
      
      await expectErrorResponse(response, 500, 'Database connection failed');
    });
  });
});
