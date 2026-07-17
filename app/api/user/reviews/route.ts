import { NextRequest } from 'next/server';
import { getAuthenticatedClaims } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';
import { uncachedApiJson } from '@/lib/cacheHeaders';
import { TCourseId, TPayloadReviews } from '@/lib/types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];
const MAX_USER_REVIEWS = 200;
const USER_REVIEW_COLUMNS = [
  'id',
  'course_id',
  'reviewer_id',
  'year',
  'semester',
  'body',
  'workload',
  'difficulty',
  'overall',
  'staff_support',
  'is_legacy',
  'is_gt_verified',
  'upvotes',
  'downvotes',
  'is_recommended',
  'is_good_first_course',
  'is_pairable',
  'has_group_projects',
  'has_writing_assignments',
  'has_exams_quizzes',
  'has_mandatory_readings',
  'has_programming_assignments',
  'has_provided_dev_env',
  'programming_languages',
  'preparation',
  'oms_courses_taken',
  'has_relevant_work_experience',
  'experience_level',
  'grade',
  'created_at',
  'modified_at',
].join(',');
const SEMESTER_TERM: Record<string, number> = { sp: 1, sm: 2, fa: 3 };

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
  const summaryOnly = searchParams.get('summary') === 'true';
  const supabase = await createClient();
  const auth = await getAuthenticatedClaims(supabase);

  if (!auth) {
    return uncachedApiJson({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (summaryOnly) {
      const { data, error } = await supabase
        .from('reviews')
        .select('course_id,year,semester')
        .eq('reviewer_id', auth.userId)
        .order('created_at', { ascending: false })
        .limit(MAX_USER_REVIEWS);

      if (error) throw error;

      const reviewKeys = (data ?? []).map(
        (review) =>
          `${review.course_id}-${review.year}-${SEMESTER_TERM[review.semester] ?? 0}`
      );
      return uncachedApiJson({ reviewKeys });
    }

    const { data, error } = await supabase
      .from('reviews')
      .select(USER_REVIEW_COLUMNS)
      .eq('reviewer_id', auth.userId)
      .order('created_at', { ascending: false })
      .limit(MAX_USER_REVIEWS);

    if (error) throw error;

    const reviews = mapSupabaseReviewsToPayload(
      (data ?? []) as unknown as SupabaseReview[]
    );
    return uncachedApiJson(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return uncachedApiJson(
      { error: 'Failed to fetch user reviews' },
      { status: 500 }
    );
  }
}
