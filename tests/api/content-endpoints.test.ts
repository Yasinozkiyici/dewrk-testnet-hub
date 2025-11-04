import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getLeaderboards } from '@/app/api/leaderboards/route';
import { GET as getEcosystems } from '@/app/api/ecosystems/route';
import { GET as getGuides } from '@/app/api/guides/route';
import { GET as getApiEndpoints } from '@/app/api/api-endpoints/route';
import { expectApiResponse } from './helpers';

const mocks = vi.hoisted(() => ({
  leaderboardFindMany: vi.fn(),
  ecosystemFindMany: vi.fn(),
  guideFindMany: vi.fn(),
  apiEndpointFindMany: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    leaderboard: {
      findMany: mocks.leaderboardFindMany
    },
    ecosystem: {
      findMany: mocks.ecosystemFindMany
    },
    guide: {
      findMany: mocks.guideFindMany
    },
    apiEndpoint: {
      findMany: mocks.apiEndpointFindMany
    }
  }
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn)
}));

describe('API: Content Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.leaderboardFindMany.mockReset();
    mocks.ecosystemFindMany.mockReset();
    mocks.guideFindMany.mockReset();
    mocks.apiEndpointFindMany.mockReset();
  });

  it('returns leaderboards from Prisma when available', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    mocks.leaderboardFindMany.mockResolvedValueOnce([
      {
        id: '1',
        slug: 'top-contributors',
        title: 'Top Contributors',
        category: 'contributors',
        metricType: 'tasks_completed',
        period: 'all_time',
        isActive: true,
        displayOrder: 0,
        updatedAt: now,
        entries: [
          {
            id: 'entry-1',
            leaderboardId: '1',
            rank: 1,
            entityId: '0x123',
            entityName: 'Builder One',
            metricValue: 120,
            change: 5,
            metadata: null,
            createdAt: now,
            updatedAt: now
          }
        ]
      }
    ] as any);

    const response = await getLeaderboards();
    const data = await expectApiResponse(response, 200);

    expect(data.source).toBe('prisma');
    expect(data.items.length).toBe(1);
  });

  it('falls back to seed leaderboards when Prisma errors', async () => {
    mocks.leaderboardFindMany.mockRejectedValueOnce(new Error('relation "Leaderboard" does not exist'));

    const response = await getLeaderboards();
    const data = await expectApiResponse(response, 200, { allowError: true });

    expect(data.source).toBe('seed');
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.error).toContain('relation');
  });

  it('returns ecosystems from Prisma when available', async () => {
    mocks.ecosystemFindMany.mockResolvedValueOnce([
      {
        id: 'eco-1',
        slug: 'ethereum',
        name: 'Ethereum L2',
        shortDescription: 'Layer 2 ecosystems',
        description: null,
        networkType: 'Layer2',
        totalTestnets: 12,
        totalFunding: 5000000000,
        activeTestnets: 8,
        featured: true,
        displayOrder: 0,
        metadata: null,
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
    ] as any);

    const response = await getEcosystems();
    const data = await expectApiResponse(response, 200);

    expect(data.source).toBe('prisma');
    expect(data.items.length).toBe(1);
  });

  it('falls back to seed ecosystems when Prisma errors', async () => {
    mocks.ecosystemFindMany.mockRejectedValueOnce(new Error('relation "Ecosystem" does not exist'));

    const response = await getEcosystems();
    const data = await expectApiResponse(response, 200, { allowError: true });

    expect(data.source).toBe('seed');
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.error).toContain('relation');
  });

  it('returns guides from Prisma when available', async () => {
    mocks.guideFindMany.mockResolvedValueOnce([
      {
        id: 'guide-1',
        slug: 'getting-started',
        title: 'Getting Started',
        excerpt: 'Quickstart',
        content: '## Intro',
        author: 'Dewrk',
        category: 'getting_started',
        tags: [],
        featured: false,
        published: true,
        publishedAt: new Date('2024-01-01T00:00:00Z'),
        views: 100,
        readingTime: 6,
        coverImageUrl: null,
        seoTitle: null,
        seoDescription: null,
        displayOrder: 0,
        createdAt: new Date('2023-12-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
    ] as any);

    const response = await getGuides();
    const data = await expectApiResponse(response, 200);

    expect(data.source).toBe('prisma');
    expect(data.items.length).toBe(1);
  });

  it('falls back to markdown guides when Prisma errors', async () => {
    mocks.guideFindMany.mockRejectedValueOnce(new Error('relation "Guide" does not exist'));

    const response = await getGuides();
    const data = await expectApiResponse(response, 200, { allowError: true });

    expect(data.source === 'markdown' || data.source === 'seed').toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
    expect(data.error).toContain('relation');
  });

  it('returns API endpoint metadata from Prisma', async () => {
    mocks.apiEndpointFindMany.mockResolvedValueOnce([
      {
        id: 'api-1',
        path: '/api/testnets',
        method: 'GET',
        title: 'Testnets API',
        description: 'List testnets',
        category: 'testnets',
        authRequired: false,
        rateLimit: 120,
        exampleRequest: 'curl /api/testnets',
        exampleResponse: '{}',
        parameters: null,
        responseSchema: null,
        version: 'v1',
        deprecated: false,
        displayOrder: 0,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      }
    ] as any);

    const response = await getApiEndpoints();
    const data = await expectApiResponse(response, 200);

    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBe(1);
  });

  it('falls back to seed API endpoints when Prisma errors', async () => {
    mocks.apiEndpointFindMany.mockRejectedValueOnce(new Error('relation "ApiEndpoint" does not exist'));

    const response = await getApiEndpoints();
    const data = await expectApiResponse(response, 200);

    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBeGreaterThan(0);
  });
});
