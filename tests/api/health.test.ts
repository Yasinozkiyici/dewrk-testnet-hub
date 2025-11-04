import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/health/route';
import { expectApiResponse, expectErrorResponse } from './helpers';

const {
  testnetCountMock,
  ecosystemCountMock,
  leaderboardCountMock,
  testnetLatestMock,
  ecosystemLatestMock,
  leaderboardLatestMock,
  readLatestRefreshLogMock
} = vi.hoisted(() => ({
  testnetCountMock: vi.fn(),
  ecosystemCountMock: vi.fn(),
  leaderboardCountMock: vi.fn(),
  testnetLatestMock: vi.fn(),
  ecosystemLatestMock: vi.fn(),
  leaderboardLatestMock: vi.fn(),
  readLatestRefreshLogMock: vi.fn()
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    testnet: {
      count: testnetCountMock,
      findFirst: testnetLatestMock
    },
    ecosystem: {
      count: ecosystemCountMock,
      findFirst: ecosystemLatestMock
    },
    leaderboardEntry: {
      count: leaderboardCountMock,
      findFirst: leaderboardLatestMock
    }
  }
}));

vi.mock('@/lib/jobs/refresh', () => ({
  readLatestRefreshLog: readLatestRefreshLogMock
}));

vi.mock('next/cache', () => ({
  unstable_cache: vi.fn((fn) => fn)
}));

describe('API: /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    testnetCountMock.mockReset();
    ecosystemCountMock.mockReset();
    leaderboardCountMock.mockReset();
    testnetLatestMock.mockReset();
    ecosystemLatestMock.mockReset();
    leaderboardLatestMock.mockReset();
    readLatestRefreshLogMock.mockReset();
  });

  it('should return healthy status when dependencies resolve', async () => {
    const now = new Date('2024-01-01T00:00:00Z');
    testnetCountMock.mockResolvedValueOnce(100);
    ecosystemCountMock.mockResolvedValueOnce(20);
    leaderboardCountMock.mockResolvedValueOnce(500);
    testnetLatestMock.mockResolvedValueOnce({ updatedAt: now });
    ecosystemLatestMock.mockResolvedValueOnce({ updatedAt: now });
    leaderboardLatestMock.mockResolvedValueOnce({ updatedAt: now });
    readLatestRefreshLogMock.mockResolvedValueOnce({ timestamp: now.toISOString(), durationMs: 1200 });

    const response = await GET();
    const data = await expectApiResponse(response, 200);

    expect(data.ok).toBe(true);
    expect(data.status).toBe('healthy');
    expect(data.testnets).toBe(100);
    expect(data.ecosystems).toBe(20);
    expect(data.leaderboardUsers).toBe(500);
  });

  it('should return error state when database calls fail', async () => {
    testnetCountMock.mockRejectedValueOnce(new Error('Connection timeout'));

    const response = await GET();
    const data = await expectErrorResponse(response, 503);

    expect(data.ok).toBe(false);
    expect(data.status).toBe('error');
    expect(data.error).toContain('Connection timeout');
  });

  it('should handle exceptions gracefully', async () => {
    testnetCountMock.mockResolvedValueOnce(0);
    ecosystemCountMock.mockResolvedValueOnce(0);
    leaderboardCountMock.mockResolvedValueOnce(0);
    testnetLatestMock.mockImplementationOnce(() => { throw new Error('Unexpected failure'); });
    ecosystemLatestMock.mockResolvedValueOnce(null);
    leaderboardLatestMock.mockResolvedValueOnce(null);
    readLatestRefreshLogMock.mockResolvedValueOnce(null);

    const response = await GET();
    const data = await expectErrorResponse(response, 503);

    expect(data.status).toBe('error');
    expect(data.error).toContain('Unexpected failure');
  });
});
