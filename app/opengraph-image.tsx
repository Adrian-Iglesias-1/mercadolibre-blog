import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage:
            'radial-gradient(circle at 75% 30%, rgba(232,255,71,0.18) 0%, transparent 55%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#e8ff47',
              fontSize: 36,
            }}
          >
            🛒
          </div>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: 'white' }}>
            ShopHub <span style={{ color: '#e8ff47', marginLeft: 14 }}>AR</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#a0a0a0', fontWeight: 400 }}>
          Lo mejor de Argentina, verificado en Mercado Libre
        </div>
      </div>
    ),
    { ...size }
  );
}
