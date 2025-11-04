import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BACKGROUND = '#020617';

export default async function EcosystemOgImage({ params }: { params: { slug: string } }) {
  const ecosystem = await prisma.ecosystem.findUnique({ where: { slug: params.slug } });

  const name = ecosystem?.name ?? 'Dewrk Ecosystem';
  const funding = ecosystem?.totalFunding ?? 0;
  const totalTestnets = ecosystem?.totalTestnets ?? 0;
  const activeTestnets = ecosystem?.activeTestnets ?? 0;

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
          background: BACKGROUND,
          color: '#E2E8F0',
          fontFamily: 'Inter'
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 6, textTransform: 'uppercase', color: '#38BDF8' }}>Ecosystem</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <h1 style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05 }}>{name}</h1>
          <div style={{ display: 'flex', gap: 36 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75 }}>Funding</span>
              <span style={{ fontSize: 44, fontWeight: 600 }}>${funding.toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75 }}>Testnets</span>
              <span style={{ fontSize: 44, fontWeight: 600 }}>{totalTestnets}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75 }}>Active</span>
              <span style={{ fontSize: 44, fontWeight: 600 }}>{activeTestnets}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <span style={{ fontWeight: 600 }}>dewrk.com</span>
          <span style={{ opacity: 0.7 }}>Live ecosystem intelligence</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
