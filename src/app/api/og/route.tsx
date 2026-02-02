import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'Gridiron Encyclopedia'
  const description = searchParams.get('description') || ''
  const category = searchParams.get('category') || ''

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c42 50%, #2d5a27 100%)',
          fontFamily: 'sans-serif',
          padding: 60,
        }}
      >
        {category && (
          <div
            style={{
              display: 'flex',
              fontSize: 20,
              color: '#c9a227',
              textTransform: 'uppercase',
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            {category}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 40 ? 48 : 56,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#ffffff',
              opacity: 0.8,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {description.length > 150 ? description.slice(0, 147) + '...' : description}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            marginTop: 'auto',
            fontSize: 22,
            color: '#c9a227',
            fontWeight: 600,
          }}
        >
          Gridiron Encyclopedia
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
