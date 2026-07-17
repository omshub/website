/**
 * @jest-environment node
 */

import { GET } from './route';

const mockGetAuthenticatedClaims = jest.fn();
const mockLimit = jest.fn();
const mockOrder = jest.fn(() => ({ limit: mockLimit }));
const mockEq = jest.fn(() => ({ order: mockOrder }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockFrom = jest.fn(() => ({ select: mockSelect }));

jest.mock('@/lib/supabase/auth', () => ({
  getAuthenticatedClaims: (...args: unknown[]) =>
    mockGetAuthenticatedClaims(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({ from: mockFrom })),
}));

const makeRequest = (path: string) =>
  new Request(`https://www.omshub.org${path}`) as any;

const review = {
  id: 'review-1',
  course_id: 'CS-6200',
  reviewer_id: 'user-1',
  year: 2025,
  semester: 'fa',
  body: 'Great course',
  workload: 10,
  difficulty: 3,
  overall: 5,
  staff_support: 4,
  is_legacy: false,
  is_gt_verified: true,
  upvotes: 2,
  downvotes: 0,
  is_recommended: true,
  is_good_first_course: false,
  is_pairable: true,
  has_group_projects: false,
  has_writing_assignments: false,
  has_exams_quizzes: true,
  has_mandatory_readings: false,
  has_programming_assignments: true,
  has_provided_dev_env: true,
  programming_languages: ['python'],
  preparation: 3,
  oms_courses_taken: 2,
  has_relevant_work_experience: true,
  experience_level: 'mid',
  grade: 'A',
  created_at: '2025-08-01T00:00:00.000Z',
  modified_at: null,
};

describe('/api/user/reviews', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAuthenticatedClaims.mockResolvedValue({ userId: 'user-1' });
    mockLimit.mockResolvedValue({ data: [review], error: null });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it('requires verified claims and ignores caller-supplied ownership', async () => {
    mockGetAuthenticatedClaims.mockResolvedValueOnce(null);
    const response = await GET(
      makeRequest('/api/user/reviews?userId=someone-else')
    );
    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns a bounded summary for duplicate-review checks', async () => {
    mockLimit.mockResolvedValueOnce({
      data: [
        { course_id: 'CS-6200', year: 2025, semester: 'fa' },
        { course_id: 'CS-6250', year: 2024, semester: 'sp' },
      ],
      error: null,
    });
    const response = await GET(
      makeRequest('/api/user/reviews?summary=true')
    );

    expect(mockSelect).toHaveBeenCalledWith('course_id,year,semester');
    expect(mockEq).toHaveBeenCalledWith('reviewer_id', 'user-1');
    expect(mockLimit).toHaveBeenCalledWith(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({
      reviewKeys: ['CS-6200-2025-3', 'CS-6250-2024-1'],
    });
  });

  it('returns the authenticated user review payload', async () => {
    const response = await GET(makeRequest('/api/user/reviews'));
    expect(mockEq).toHaveBeenCalledWith('reviewer_id', 'user-1');
    expect(mockLimit).toHaveBeenCalledWith(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    const body = await response.json();
    expect(body['review-1']).toMatchObject({
      reviewId: 'review-1',
      courseId: 'CS-6200',
      reviewerId: 'user-1',
      body: 'Great course',
      programmingLanguagesIds: ['python'],
    });
  });

  it('returns a private 500 when review lookup fails', async () => {
    mockLimit.mockResolvedValueOnce({
      data: null,
      error: { message: 'lookup failed' },
    });
    const response = await GET(makeRequest('/api/user/reviews'));
    expect(response.status).toBe(500);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
