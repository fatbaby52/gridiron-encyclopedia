import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'Gridiron Encyclopedia'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c42 50%, #2d5a27 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 700,
            color: '#c9a227',
            marginBottom: 16,
          }}
        >
          Gridiron Encyclopedia
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 28,
            color: '#ffffff',
            opacity: 0.9,
            maxWidth: 800,
            textAlign: 'center',
          }}
        >
          The comprehensive American football knowledge base
        </div>
      </div>
    ),
    { ...size },
  )
}
