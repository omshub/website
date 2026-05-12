import type { Database } from './database.types';
import type { Review, TCourseId, TProgrammingLanguageId } from '@/lib/types';

export type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Convert a single Supabase review row to the Review type used throughout the app
 */
export function mapSupabaseReviewToReview(review: SupabaseReview): Review {
  return {
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
    isRecommended: nullToUndefined(review.is_recommended),
    isGoodFirstCourse: nullToUndefined(review.is_good_first_course),
    isPairable: nullToUndefined(review.is_pairable),
    hasGroupProjects: nullToUndefined(review.has_group_projects),
    hasWritingAssignments: nullToUndefined(review.has_writing_assignments),
    hasExamsQuizzes: nullToUndefined(review.has_exams_quizzes),
    hasMandatoryReadings: nullToUndefined(review.has_mandatory_readings),
    hasProgrammingAssignments: nullToUndefined(review.has_programming_assignments),
    hasProvidedDevEnv: nullToUndefined(review.has_provided_dev_env),
    programmingLanguagesIds: review.programming_languages as TProgrammingLanguageId[] | undefined,
    preparation: review.preparation as 1 | 2 | 3 | 4 | 5 | undefined,
    omsCoursesTaken: review.oms_courses_taken,
    hasRelevantWorkExperience: nullToUndefined(review.has_relevant_work_experience),
    experienceLevelId: nullToUndefined(review.experience_level) as 'jr' | 'mid' | 'sr' | undefined,
    gradeId: nullToUndefined(review.grade),
  };
}

/**
 * Convert an array of Supabase review rows to Review array
 */
export function mapSupabaseReviewsToArray(reviews: SupabaseReview[]): Review[] {
  return reviews.map(mapSupabaseReviewToReview);
}
