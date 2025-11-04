import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function EcosystemsOgImage() {
  const ecosystems = await prisma.ecosystem.findMany({
    orderBy: [
      { featured: 'desc' },
      { displayOrder: 'asc' }
    ],
    take: 4
  });

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
          background: '#0F172A',
          color: '#F8FAFC',
          fontFamily: 'Inter'
        }}
      >
        <div style={{ textTransform: 'uppercase', letterSpacing: 8, fontSize: 18, color: '#2DD4BF' }}>Ecosystems</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 24 }}>
          {ecosystems.map((ecosystem) => (
            <div key={ecosystem.slug} style={{ background: '#111C2E', borderRadius: 24, padding: 24 }}>
              <div style={{ fontSize: 28, fontWeight: 600 }}>{ecosystem.name}</div>
              <div style={{ marginTop: 12, fontSize: 20, opacity: 0.72 }}>{ecosystem.shortDescription ?? ''}</div>
              <div style={{ marginTop: 18, fontSize: 18, display: 'flex', gap: 16 }}>
                <span>Total: {ecosystem.totalTestnets}</span>
                <span>Active: {ecosystem.activeTestnets}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <span style={{ fontWeight: 600 }}>dewrk.com</span>
          <span style={{ opacity: 0.7 }}>Explore modular & L2 ecosystems</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
