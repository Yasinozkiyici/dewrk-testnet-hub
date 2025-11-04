import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function LeaderboardsOgImage() {
  let leaderboards: Awaited<ReturnType<typeof prisma.leaderboard.findMany>> = [];
  
  try {
    leaderboards = await prisma.leaderboard.findMany({
      where: { isActive: true },
      include: {
        entries: {
          orderBy: { rank: 'asc' },
          take: 3
        }
      },
      orderBy: { displayOrder: 'asc' },
      take: 1
    });
  } catch (error) {
    console.error('[leaderboards/opengraph-image] Failed to fetch leaderboards:', error);
    // Use empty array as fallback
  }

  const board = leaderboards[0];
  const entries = board?.entries ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: '#111827',
          color: '#F9FAFB',
          fontFamily: 'Inter'
        }}
      >
        <div style={{ textTransform: 'uppercase', letterSpacing: 8, fontSize: 18, color: '#38BDF8' }}>Leaderboards</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 70, fontWeight: 600 }}>Top Builders</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entries.length > 0 ? entries.map((entry, index) => (
              <div key={entry.entityId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 30 }}>
                <span style={{ display: 'flex', gap: 16 }}>
                  <span style={{ opacity: 0.6 }}>{index + 1}</span>
                  <span>{entry.entityName}</span>
                </span>
                <span style={{ fontWeight: 600 }}>{Number(entry.metricValue).toLocaleString('en-US')}</span>
              </div>
            )) : (
              <div style={{ fontSize: 30, opacity: 0.7 }}>Leaderboard data coming soon</div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <span style={{ fontWeight: 600 }}>dewrk.com</span>
          <span style={{ opacity: 0.7 }}>Live campaign stats</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
