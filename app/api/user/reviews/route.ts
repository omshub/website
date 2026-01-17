import { NextRequest, NextResponse } from 'next/server';
import { getUserReviews } from '@/lib/supabase/dbOperations';
import type { Database } from '@/lib/supabase/database.types';
import { TCourseId, TPayloadReviews } from '@/lib/types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

// Convert Supabase reviews array to TPayloadReviews object format (keyed by reviewId)
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
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const supabaseReviews = await getUserReviews(userId);
    const reviews = mapSupabaseReviewsToPayload(supabaseReviews);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch user reviews' }, { status: 500 });
  }
}
