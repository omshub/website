import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { TCourseId, TPayloadReviews } from '@/lib/types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

// Convert Supabase reviews array to TPayloadReviews object format
function mapSupabaseReviewsToPayload(reviews: SupabaseReview[]): TPayloadReviews {
  const payload: TPayloadReviews = {};
  reviews.forEach((review) => {
    payload[review.id] = {
      reviewId: review.id,
      courseId: review.course_id as TCourseId,
      year: review.year,
      semesterId: review.semester as 'sp' | 'sm' | 'fa',
      isLegacy: review.is_legacy,
      reviewerId: review.reviewer_id ?? '',
      isGTVerifiedReviewer: review.is_gt_verified,
      created: new Date(review.created_at).getTime(),
      modified: review.modified_at ? new Date(review.modified_at).getTime() : null,
      body: review.body ?? '',
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      workload: review.workload ?? 0,
      difficulty: (review.difficulty ?? 3) as 1 | 2 | 3 | 4 | 5,
      overall: (review.overall ?? 3) as 1 | 2 | 3 | 4 | 5,
      staffSupport: review.staff_support as 1 | 2 | 3 | 4 | 5 | undefined,
      isRecommended: review.is_recommended ?? undefined,
      isGoodFirstCourse: review.is_good_first_course ?? undefined,
      isPairable: review.is_pairable ?? undefined,
      hasGroupProjects: review.has_group_projects ?? undefined,
      hasWritingAssignments: review.has_writing_assignments ?? undefined,
      hasExamsQuizzes: review.has_exams_quizzes ?? undefined,
      hasMandatoryReadings: review.has_mandatory_readings ?? undefined,
      hasProgrammingAssignments: review.has_programming_assignments ?? undefined,
      hasProvidedDevEnv: review.has_provided_dev_env ?? undefined,
      programmingLanguagesIds: review.programming_languages as any,
      preparation: review.preparation as 1 | 2 | 3 | 4 | 5 | undefined,
      omsCoursesTaken: review.oms_courses_taken,
      hasRelevantWorkExperience: review.has_relevant_work_experience ?? undefined,
      experienceLevelId: review.experience_level as 'jr' | 'mid' | 'sr' | undefined,
      gradeId: review.grade ?? undefined,
    };
  });
  return payload;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  const year = searchParams.get('year');
  const semester = searchParams.get('semester');
  const search = searchParams.get('search')?.trim() || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const paginated = searchParams.get('paginated') === 'true';

  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('reviews')
      .select('*', { count: paginated ? 'exact' : undefined })
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (year) query = query.eq('year', parseInt(year, 10));
    if (semester) query = query.eq('semester', semester);
    if (search) query = query.ilike('body', `%${search}%`);

    // Apply pagination if requested
    if (paginated) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data: supabaseReviews, error, count } = await query;

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    const reviews = mapSupabaseReviewsToPayload(supabaseReviews || []);

    // Return paginated response if requested
    if (paginated) {
      return NextResponse.json({
        reviews,
        pagination: {
          offset,
          limit,
          total: count || 0,
          hasMore: (offset + limit) < (count || 0),
        },
      });
    }

    // Return legacy format for backwards compatibility
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check user's email for GT verification
    const isGTVerified = user.email?.endsWith('@gatech.edu') || false;

    // Create the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        id: body.reviewId,
        course_id: body.courseId,
        reviewer_id: user.id,
        year: body.year,
        semester: body.semesterId,
        body: body.body,
        workload: body.workload,
        difficulty: body.difficulty,
        overall: body.overall,
        is_legacy: false,
        is_gt_verified: isGTVerified,
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error in POST /api/reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
