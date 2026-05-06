/**
 * @jest-environment node
 */

import { GET } from './route';

const mockGetUserReviews = jest.fn();
const mockAuthGetUser = jest.fn();

jest.mock('@/lib/supabase/dbOperations', () => ({
  getUserReviews: (...args: unknown[]) => mockGetUserReviews(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockAuthGetUser,
    },
  })),
}));

function makeRequest(path: string) {
  return new Request(`https://www.omshub.org${path}`);
}

describe('/api/user/reviews', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('requires authentication', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await GET(makeRequest('/api/user/reviews?userId=user-1'));

    expect(response.status).toBe(401);
    expect(mockGetUserReviews).not.toHaveBeenCalled();
  });

  it('requires userId', async () => {
    const response = await GET(makeRequest('/api/user/reviews'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'userId is required' });
    expect(mockAuthGetUser).not.toHaveBeenCalled();
  });

  it('forbids requesting another user review list', async () => {
    const response = await GET(makeRequest('/api/user/reviews?userId=user-2'));

    expect(response.status).toBe(403);
    expect(mockGetUserReviews).not.toHaveBeenCalled();
  });

  it('maps Supabase reviews to the client payload shape', async () => {
    mockGetUserReviews.mockResolvedValueOnce([
      {
        id: 'review-1',
        course_id: 'CS-6200',
        year: 2025,
        semester: 'fa',
        is_legacy: false,
        reviewer_id: null,
        is_gt_verified: true,
        created_at: '2025-08-01T00:00:00.000Z',
        modified_at: '2025-08-02T00:00:00.000Z',
        body: null,
        upvotes: 3,
        downvotes: 1,
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
        oms_courses_taken: 2,
        has_relevant_work_experience: true,
        experience_level: 'sr',
        grade: 'A',
      },
      {
        id: 'review-2',
        course_id: 'CS-6250',
        year: 2024,
        semester: 'sp',
        is_legacy: true,
        reviewer_id: 'user-1',
        is_gt_verified: false,
        created_at: '2024-01-01T00:00:00.000Z',
        modified_at: null,
        body: 'solid course',
        upvotes: 0,
        downvotes: 0,
        workload: 8,
        difficulty: 2,
        overall: 4,
        staff_support: null,
        is_recommended: true,
        is_good_first_course: null,
        is_pairable: null,
        has_group_projects: null,
        has_writing_assignments: null,
        has_exams_quizzes: null,
        has_mandatory_readings: null,
        has_programming_assignments: null,
        has_provided_dev_env: null,
        programming_languages: null,
        preparation: null,
        oms_courses_taken: 1,
        has_relevant_work_experience: null,
        experience_level: null,
        grade: null,
      },
    ]);

    const response = await GET(makeRequest('/api/user/reviews?userId=user-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body['review-1']).toMatchObject({
      reviewId: 'review-1',
      courseId: 'CS-6200',
      semesterId: 'fa',
      reviewerId: '',
      body: '',
      workload: 0,
      difficulty: 3,
      overall: 3,
      isGoodFirstCourse: true,
    });
    expect(body['review-2']).toMatchObject({
      reviewId: 'review-2',
      modified: null,
      reviewerId: 'user-1',
      body: 'solid course',
      workload: 8,
      difficulty: 2,
      overall: 4,
      staffSupport: null,
    });
  });

  it('returns a 500 when review lookup fails', async () => {
    mockGetUserReviews.mockRejectedValueOnce(new Error('reviews unavailable'));

    const response = await GET(makeRequest('/api/user/reviews?userId=user-1'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch user reviews' });
  });
});
