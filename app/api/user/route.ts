import { NextRequest, NextResponse } from 'next/server';
import { getUser, addUser } from '@/lib/supabase/dbOperations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json({ userId: null, hasGTEmail: false, reviews: {} });
    }
    // Return in the format expected by the client
    return NextResponse.json({
      userId: user.id,
      hasGTEmail: user.has_gt_email,
      educationLevelId: user.education_level,
      subjectAreaId: user.subject_area,
      workYears: user.work_years,
      specializationId: user.specialization,
      reviews: {}, // Reviews are fetched separately via /api/user/reviews
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, hasGTEmail } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const user = await addUser({
      id: userId,
      has_gt_email: hasGTEmail ?? false,
    });

    return NextResponse.json({
      userId: user.id,
      hasGTEmail: user.has_gt_email,
      reviews: {},
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
