import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/testnets/upsert/route';
import { createMockRequest, expectApiResponse, expectErrorResponse } from './helpers';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    testnet: {
      upsert: vi.fn(),
      findUnique: vi.fn()
    }
  }
}));

vi.mock('next/cache', () => ({
  revalidateTag: vi.fn()
}));

describe('API: /api/admin/testnets/upsert', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/admin/testnets/upsert', () => {
    it('should create new testnet with all fields', async () => {
      const { prisma } = await import('@/lib/prisma');
      const mockTestnet = {
        id: 'test-id',
        slug: 'new-testnet',
        name: 'New Testnet',
        network: 'Ethereum',
        status: 'LIVE',
        totalRaisedUSD: 100000
      };
      vi.mocked(prisma.testnet.upsert).mockResolvedValue(mockTestnet as any);

      const request = createMockRequest('http://localhost/api/admin/testnets/upsert', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Testnet',
          network: 'Ethereum',
          status: 'LIVE',
          totalRaisedUSD: 100000
        })
      });

      const response = await POST(request);
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('slug');
      expect(prisma.testnet.upsert).toHaveBeenCalled();
    });

    it('should update existing testnet', async () => {
      const { prisma } = await import('@/lib/prisma');
      const mockTestnet = {
        id: 'existing-id',
        slug: 'existing-testnet',
        name: 'Updated Testnet',
        network: 'Polygon'
      };
      vi.mocked(prisma.testnet.findUnique).mockResolvedValue(mockTestnet as any);
      vi.mocked(prisma.testnet.upsert).mockResolvedValue(mockTestnet as any);

      const request = createMockRequest('http://localhost/api/admin/testnets/upsert', {
        method: 'POST',
        body: JSON.stringify({
          slug: 'existing-testnet',
          name: 'Updated Testnet',
          network: 'Polygon'
        })
      });

      const response = await POST(request);
      const data = await expectApiResponse(response, 200);

      expect(data.name).toBe('Updated Testnet');
    });

    it('should validate required fields', async () => {
      const request = createMockRequest('http://localhost/api/admin/testnets/upsert', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        })
      });

      const response = await POST(request);
      
      // Should return validation error
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should revalidate cache tags after upsert', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { revalidateTag } = await import('next/cache');
      const mockTestnet = {
        id: 'test-id',
        slug: 'test-testnet',
        name: 'Test Testnet'
      };
      vi.mocked(prisma.testnet.upsert).mockResolvedValue(mockTestnet as any);

      const request = createMockRequest('http://localhost/api/admin/testnets/upsert', {
        method: 'POST',
        body: JSON.stringify({
          slug: 'test-testnet',
          name: 'Test Testnet'
        })
      });

      await POST(request);

      expect(revalidateTag).toHaveBeenCalledWith('testnets');
      expect(revalidateTag).toHaveBeenCalledWith('testnet:test-testnet');
    });

    it('should handle database errors with context', async () => {
      const { prisma } = await import('@/lib/prisma');
      vi.mocked(prisma.testnet.upsert).mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest('http://localhost/api/admin/testnets/upsert', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Testnet',
          network: 'Ethereum'
        })
      });

      const response = await POST(request);
      await expectErrorResponse(response, 500);
    });
  });
});

