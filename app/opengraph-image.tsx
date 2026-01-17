import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'OMSHub - Georgia Tech OMS Course Reviews';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#003057',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #004080 2%, transparent 0%), radial-gradient(circle at 75px 75px, #004080 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        {/* OMSHub Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <div
            style={{
              backgroundColor: '#B3A369',
              color: '#003057',
              padding: '16px 40px',
              borderRadius: 12,
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: '-1px',
            }}
          >
            OMSHub
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          Georgia Tech OMS
        </div>

        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#B3A369',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 40,
          }}
        >
          Course Reviews
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Community-driven reviews for OMSCS, OMSA, and OMSCyber programs
        </div>

        {/* Stats badges */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginTop: 40,
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(179, 163, 105, 0.2)',
              border: '2px solid rgba(179, 163, 105, 0.4)',
              color: '#B3A369',
              padding: '12px 24px',
              borderRadius: 30,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            50+ Courses
          </div>
          <div
            style={{
              backgroundColor: 'rgba(179, 163, 105, 0.2)',
              border: '2px solid rgba(179, 163, 105, 0.4)',
              color: '#B3A369',
              padding: '12px 24px',
              borderRadius: 30,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            5000+ Reviews
          </div>
          <div
            style={{
              backgroundColor: 'rgba(179, 163, 105, 0.2)',
              border: '2px solid rgba(179, 163, 105, 0.4)',
              color: '#B3A369',
              padding: '12px 24px',
              borderRadius: 30,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Student Community
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 18,
          }}
        >
          omshub.org
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
