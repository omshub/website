import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseid: string }> }
) {
  const { courseid } = await params;

  // Fetch course data
  let courseName = courseid;
  const avgDifficulty = 'N/A';
  const avgWorkload = 'N/A';
  const avgOverall = 'N/A';

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/omshub/data/main/static/courses.json'
    );
    const courses = await response.json();
    const course = courses[courseid];
    if (course) {
      courseName = course.name;
    }
  } catch {
    // Use courseId as name if fetch fails
  }

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
            marginBottom: 20,
          }}
        >
          <div
            style={{
              backgroundColor: '#F5C400',
              color: '#003057',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            OMSHub
          </div>
        </div>

        {/* Course ID Badge */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#F5C400',
            padding: '12px 24px',
            borderRadius: 30,
            fontSize: 28,
            fontWeight: 600,
            marginBottom: 20,
            border: '2px solid rgba(245,196,0,0.3)',
          }}
        >
          {courseid}
        </div>

        {/* Course Name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            marginBottom: 30,
          }}
        >
          {courseName}
        </div>

        {/* Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            marginTop: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '16px 32px',
              borderRadius: 12,
            }}
          >
            <div style={{ color: '#F5C400', fontSize: 14, marginBottom: 4 }}>
              DIFFICULTY
            </div>
            <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>
              {avgDifficulty}/5
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '16px 32px',
              borderRadius: 12,
            }}
          >
            <div style={{ color: '#F5C400', fontSize: 14, marginBottom: 4 }}>
              WORKLOAD
            </div>
            <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>
              {avgWorkload} hrs/wk
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '16px 32px',
              borderRadius: 12,
            }}
          >
            <div style={{ color: '#F5C400', fontSize: 14, marginBottom: 4 }}>
              RATING
            </div>
            <div style={{ color: 'white', fontSize: 28, fontWeight: 700 }}>
              {avgOverall}/5
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 16,
          }}
        >
          Read student reviews at omshub.org
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
