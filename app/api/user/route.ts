import { NextRequest, NextResponse } from 'next/server';
import { getUser, addUser } from '@/lib/supabase/dbOperations';
import { createClient } from '@/lib/supabase/server';

function isUniqueViolation(error: unknown) {
  return (error as { code?: string } | null)?.code === '23505';
}

function userResponse(user: { id: string; has_gt_email: boolean }) {
  return NextResponse.json({
    userId: user.id,
    hasGTEmail: user.has_gt_email,
    reviews: {},
  });
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (authUser.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

export async function POST() {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasGTEmail = authUser.email?.endsWith('@gatech.edu') ?? false;
    const existingUser = await getUser(authUser.id);

    if (existingUser) {
      return userResponse(existingUser);
    }

    try {
      const user = await addUser({
        id: authUser.id,
        has_gt_email: hasGTEmail,
      });

      return userResponse(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        const racedUser = await getUser(authUser.id);
        if (racedUser) return userResponse(racedUser);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
