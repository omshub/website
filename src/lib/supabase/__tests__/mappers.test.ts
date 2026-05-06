/**
 * @jest-environment node
 */

import { mapSupabaseReviewsToArray, mapSupabaseReviewToReview } from '../mappers';

function makeReview(overrides = {}) {
  return {
    id: 'review-1',
    course_id: 'CS-6200',
    year: 2025,
    semester: 'fa',
    is_legacy: false,
    reviewer_id: null,
    is_gt_verified: true,
    created_at: '2025-08-01T00:00:00.000Z',
    modified_at: null,
    body: null,
    upvotes: 1,
    downvotes: 2,
    workload: null,
    difficulty: null,
    overall: null,
    staff_support: 4,
    is_recommended: null,
    is_good_first_course: true,
    is_pairable: false,
    has_group_projects: true,
    has_writing_assignments: false,
    has_exams_quizzes: true,
    has_mandatory_readings: false,
    has_programming_assignments: true,
    has_provided_dev_env: false,
    programming_languages: ['c'],
    preparation: 5,
    oms_courses_taken: 3,
    has_relevant_work_experience: true,
    experience_level: 'sr',
    grade: 'A',
    ...overrides,
  } as any;
}

describe('Supabase review mappers', () => {
  it('maps Supabase rows to app reviews with defaults', () => {
    expect(mapSupabaseReviewToReview(makeReview())).toMatchObject({
      reviewId: 'review-1',
      courseId: 'CS-6200',
      reviewerId: '',
      created: new Date('2025-08-01T00:00:00.000Z').getTime(),
      modified: null,
      body: '',
      workload: 0,
      difficulty: 3,
      overall: 3,
      isRecommended: undefined,
    });
  });

  it('maps present optional values and arrays', () => {
    const review = mapSupabaseReviewToReview(
      makeReview({
        reviewer_id: 'user-1',
        modified_at: '2025-08-02T00:00:00.000Z',
        body: 'great',
        workload: 10,
        difficulty: 4,
        overall: 5,
        is_recommended: true,
        is_good_first_course: false,
        is_pairable: true,
        has_group_projects: false,
        has_writing_assignments: true,
        has_exams_quizzes: false,
        has_mandatory_readings: true,
        has_programming_assignments: false,
        has_provided_dev_env: true,
        has_relevant_work_experience: false,
        experience_level: 'mid',
        grade: 'B',
      })
    );

    expect(review).toMatchObject({
      reviewerId: 'user-1',
      modified: new Date('2025-08-02T00:00:00.000Z').getTime(),
      body: 'great',
      workload: 10,
      difficulty: 4,
      overall: 5,
      isRecommended: true,
      isGoodFirstCourse: false,
      isPairable: true,
      hasWritingAssignments: true,
      hasMandatoryReadings: true,
      hasProvidedDevEnv: true,
      hasRelevantWorkExperience: false,
      experienceLevelId: 'mid',
      gradeId: 'B',
      programmingLanguagesIds: ['c'],
    });
  });

  it('maps arrays of rows', () => {
    expect(mapSupabaseReviewsToArray([makeReview({ id: 'review-1' }), makeReview({ id: 'review-2' })]))
      .toEqual([
        expect.objectContaining({ reviewId: 'review-1' }),
        expect.objectContaining({ reviewId: 'review-2' }),
      ]);
  });
});
