import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getTasks } from '@/app/api/dashboard/tasks/route';
import { GET as getApiKeys } from '@/app/api/dashboard/api-keys/route';
import { GET as getActivity } from '@/app/api/dashboard/activity/route';
import { createMockRequest, expectApiResponse } from './helpers';

// Mock auth guards
vi.mock('@/lib/auth-guards', () => ({
  withAuth: vi.fn((handler) => async (req: NextRequest) => {
    // Mock authenticated user
    const mockUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'contributor' as const
    };
    return handler(req, mockUser);
  })
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: { findMany: vi.fn() },
    apiKey: { findMany: vi.fn() },
    activityLog: { findMany: vi.fn() }
  }
}));

describe('API: Dashboard Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/dashboard/tasks', () => {
    it('should return tasks list for authenticated user', async () => {
      const request = createMockRequest('http://localhost/api/dashboard/tasks');
      const response = await getTasks(request);
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit');
      expect(data).toHaveProperty('offset');
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should handle query parameters', async () => {
      const request = createMockRequest('http://localhost/api/dashboard/tasks?status=completed&limit=5');
      const response = await getTasks(request);
      const data = await expectApiResponse(response, 200);

      expect(data.limit).toBe(5);
    });
  });

  describe('GET /api/dashboard/api-keys', () => {
    it('should return API keys list for authenticated user', async () => {
      const request = createMockRequest('http://localhost/api/dashboard/api-keys');
      const response = await getApiKeys(request);
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);
    });
  });

  describe('GET /api/dashboard/activity', () => {
    it('should return activity list for authenticated user', async () => {
      const request = createMockRequest('http://localhost/api/dashboard/activity');
      const response = await getActivity(request);
      const data = await expectApiResponse(response, 200);

      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      const request = createMockRequest('http://localhost/api/dashboard/activity?limit=20&offset=10');
      const response = await getActivity(request);
      const data = await expectApiResponse(response, 200);

      expect(data.limit).toBe(20);
      expect(data.offset).toBe(10);
    });
  });
});

