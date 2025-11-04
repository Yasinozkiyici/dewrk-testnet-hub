import { ImageResponse } from 'next/og';
import { getGuideMetadata } from '@/lib/content/guides';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BACKGROUND = '#0F172A';

export default async function GuideOgImage({ params }: { params: { slug: string } }) {
  const guide = await getGuideMetadata(params.slug);

  const title = guide?.title ?? 'Dewrk Guide';
  const subtitle = guide?.excerpt ?? guide?.description ?? 'Deep dive from the Dewrk contributor community.';
  const category = guide?.category ? guide.category.toUpperCase() : 'DWK GUIDE';

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
          color: '#F8FAFC',
          fontFamily: 'Inter'
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.72 }}>{category}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <h1 style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1 }}>{title}</h1>
          <p style={{ fontSize: 28, lineHeight: 1.4, color: '#CBD5F5', maxWidth: 900 }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 600 }}>dewrk.com</div>
          {guide?.author && <div style={{ fontSize: 20, opacity: 0.8 }}>by {guide.author}</div>}
        </div>
      </div>
    ),
    { ...size }
  );
}
