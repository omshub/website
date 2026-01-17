import type { Database } from './database.types';
import type { Review, TCourseId, TProgrammingLanguageId } from '@/lib/types';

export type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

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
    isRecommended: review.is_recommended ?? undefined,
    isGoodFirstCourse: review.is_good_first_course ?? undefined,
    isPairable: review.is_pairable ?? undefined,
    hasGroupProjects: review.has_group_projects ?? undefined,
    hasWritingAssignments: review.has_writing_assignments ?? undefined,
    hasExamsQuizzes: review.has_exams_quizzes ?? undefined,
    hasMandatoryReadings: review.has_mandatory_readings ?? undefined,
    hasProgrammingAssignments: review.has_programming_assignments ?? undefined,
    hasProvidedDevEnv: review.has_provided_dev_env ?? undefined,
    programmingLanguagesIds: review.programming_languages as TProgrammingLanguageId[] | undefined,
    preparation: review.preparation as 1 | 2 | 3 | 4 | 5 | undefined,
    omsCoursesTaken: review.oms_courses_taken,
    hasRelevantWorkExperience: review.has_relevant_work_experience ?? undefined,
    experienceLevelId: review.experience_level as 'jr' | 'mid' | 'sr' | undefined,
    gradeId: review.grade ?? undefined,
  };
}

/**
 * Convert an array of Supabase review rows to Review array
 */
export function mapSupabaseReviewsToArray(reviews: SupabaseReview[]): Review[] {
  return reviews.map(mapSupabaseReviewToReview);
}
