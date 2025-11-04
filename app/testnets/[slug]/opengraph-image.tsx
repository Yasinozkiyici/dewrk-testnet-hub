import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BACKGROUND = '#020B19';
const ACCENT = '#22D3EE';

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 3);
}

export default async function TestnetOgImage({ params }: { params: { slug: string } }) {
  const testnet = await prisma.testnet.findUnique({ where: { slug: params.slug } });

  const name = testnet?.name ?? 'Dewrk Testnet';
  const network = testnet?.network ?? 'Network';
  const funding = testnet?.totalRaisedUSD ?? 0;
  const status = testnet?.status ?? 'UPCOMING';
  const points = Array.isArray(testnet?.highlights as any) ? (testnet?.highlights as string[]) : [];

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '24px',
              background: ACCENT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              fontWeight: 700,
              color: BACKGROUND
            }}
          >
            {initials(name)}
          </div>
          <div style={{ textTransform: 'uppercase', letterSpacing: 8, fontSize: 18, color: '#38BDF8' }}>
            {network}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05 }}>{name}</h1>
          <div style={{ display: 'flex', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75 }}>Raised</span>
              <span style={{ fontSize: 48, fontWeight: 600 }}>${funding.toLocaleString('en-US')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.75 }}>Status</span>
              <span style={{ fontSize: 48, fontWeight: 600 }}>{status}</span>
            </div>
          </div>
          {points.length > 0 && (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 24, color: '#94A3B8' }}>
              {points.slice(0, 3).map((point) => (
                <li key={point} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <span style={{ fontWeight: 600 }}>dewrk.com</span>
          <span style={{ opacity: 0.7 }}>Live builder data</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
