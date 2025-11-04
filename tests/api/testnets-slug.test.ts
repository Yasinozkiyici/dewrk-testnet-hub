import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/testnets/[slug]/route';
import { expectApiResponse, expectErrorResponse } from './helpers';

const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    testnet: {
      findUnique: findUniqueMock
    }
  }
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn)
}));

describe('API: /api/testnets/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUniqueMock.mockReset();
  });

  describe('GET /api/testnets/[slug]', () => {
    it('should return testnet detail with all required fields', async () => {
      findUniqueMock.mockResolvedValueOnce({
        id: '1',
        slug: 'test-testnet',
        name: 'Test Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        difficulty: 'MEDIUM',
        shortDescription: 'Demo testnet',
        tags: [],
        highlights: [],
        prerequisites: [],
        gettingStarted: [],
        discordRoles: [],
        totalRaisedUSD: 25000000,
        estTimeMinutes: 45,
        updatedAt: new Date('2024-01-01T00:00:00Z')
      } as any);

      const params = { slug: 'test-testnet' };
      const response = await GET(new Request('http://localhost/api/testnets/test-testnet'), { params });
      const data = await expectApiResponse(response, 200);

      expect(data.slug).toBe('test-testnet');
      expect(data.name).toBe('Test Testnet');
      expect(data).toHaveProperty('network');
      expect(data).toHaveProperty('status');
      expect(Array.isArray(data.tags)).toBe(true);
    });

    it('should return 404 for non-existent testnet', async () => {
      findUniqueMock.mockResolvedValueOnce(null);

      const params = { slug: 'non-existent' };
      const response = await GET(new Request('http://localhost/api/testnets/non-existent'), { params });

      await expectErrorResponse(response, 404, 'TestnetNotFound');
    });

    it('should handle database errors gracefully', async () => {
      findUniqueMock.mockRejectedValueOnce(new Error('Database error'));

      const params = { slug: 'test-testnet' };
      const response = await GET(new Request('http://localhost/api/testnets/test-testnet'), { params });

      await expectErrorResponse(response, 500, 'Database error');
    });
  });
});
