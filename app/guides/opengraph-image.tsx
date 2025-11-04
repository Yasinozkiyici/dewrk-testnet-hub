import { ImageResponse } from 'next/og';
import { listGuideSummaries } from '@/lib/content/guides';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function GuidesOgImage() {
  const guides = await listGuideSummaries();
  const featured = guides.filter((guide) => guide.featured).slice(0, 3);

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
          background: '#0C1321',
          color: '#F8FAFC',
          fontFamily: 'Inter'
        }}
      >
        <div style={{ textTransform: 'uppercase', letterSpacing: 8, fontSize: 18, color: '#A855F7' }}>Guides</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 68, fontWeight: 600 }}>Testnet Playbooks</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {featured.map((guide) => (
              <div key={guide.slug} style={{ fontSize: 28, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 600 }}>{guide.title}</div>
                <div style={{ fontSize: 20, opacity: 0.75 }}>{guide.excerpt ?? guide.description ?? ''}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <span style={{ fontWeight: 600 }}>dewrk.com</span>
          <span style={{ opacity: 0.7 }}>Actionable research for builders</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
