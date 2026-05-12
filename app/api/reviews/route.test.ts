/**
 * @jest-environment node
 */

import { GET, POST } from './route';

const mockCreateClient = jest.fn();
const mockAuthGetUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

function makeRequest(path: string, init?: RequestInit) {
  return new Request(`https://www.omshub.org${path}`, init);
}

function makeQuery(result: unknown) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => query),
    ilike: jest.fn(() => query),
    range: jest.fn(() => query),
    insert: jest.fn(() => query),
    single: jest.fn(() => query),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result)),
  };
  return query;
}

describe('/api/reviews', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let query: any;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    query = makeQuery({ data: [], error: null, count: 0 });
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'student@gatech.edu' } },
      error: null,
    });
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockAuthGetUser },
      from: jest.fn(() => query),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('requires courseId', async () => {
    const response = await GET(makeRequest('/api/reviews'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'courseId is required' });
  });

  it('returns filtered legacy review payloads', async () => {
    query = makeQuery({
      data: [
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
          upvotes: 0,
          downvotes: 0,
          workload: null,
          difficulty: null,
          overall: null,
          staff_support: null,
          is_recommended: null,
          is_good_first_course: null,
          is_pairable: null,
          has_group_projects: null,
          has_writing_assignments: null,
          has_exams_quizzes: null,
          has_mandatory_readings: null,
          has_programming_assignments: null,
          has_provided_dev_env: null,
          programming_languages: ['c'],
          preparation: null,
          oms_courses_taken: 0,
          has_relevant_work_experience: null,
          experience_level: null,
          grade: null,
        },
        {
          id: 'review-2',
          course_id: 'CS-6200',
          year: 2025,
          semester: 'fa',
          is_legacy: false,
          reviewer_id: 'user-1',
          is_gt_verified: true,
          created_at: '2025-08-01T00:00:00.000Z',
          modified_at: null,
          body: 'body',
          upvotes: 0,
          downvotes: 0,
          workload: 1,
          difficulty: 2,
          overall: 3,
          staff_support: null,
          is_recommended: null,
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
          oms_courses_taken: 0,
          has_relevant_work_experience: null,
          experience_level: null,
          grade: null,
        },
      ],
      error: null,
      count: 1,
    });
    mockCreateClient.mockResolvedValue({ from: jest.fn(() => query) });

    const response = await GET(
      makeRequest('/api/reviews?courseId=CS-6200&year=2025&semester=fa&search=kernel')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith('year', 2025);
    expect(query.eq).toHaveBeenCalledWith('semester', 'fa');
    expect(query.ilike).toHaveBeenCalledWith('body', '%kernel%');
    expect(body['review-1']).toMatchObject({
      reviewId: 'review-1',
      reviewerId: '',
      body: '',
      workload: 0,
      difficulty: 3,
      overall: 3,
      modified: new Date('2025-08-02T00:00:00.000Z').getTime(),
    });
  });

  it('returns paginated reviews with capped limits', async () => {
    query = makeQuery({ data: [], error: null, count: 150 });
    mockCreateClient.mockResolvedValue({ from: jest.fn(() => query) });

    const response = await GET(
      makeRequest('/api/reviews?courseId=CS-6200&paginated=true&limit=999&offset=20')
    );

    expect(query.range).toHaveBeenCalledWith(20, 119);
    await expect(response.json()).resolves.toEqual({
      reviews: {},
      pagination: {
        offset: 20,
        limit: 100,
        total: 150,
        hasMore: true,
      },
    });
  });

  it('defaults paginated null data and count', async () => {
    query = makeQuery({ data: null, error: null, count: null });
    mockCreateClient.mockResolvedValue({ from: jest.fn(() => query) });

    const response = await GET(
      makeRequest('/api/reviews?courseId=CS-6200&paginated=true')
    );

    await expect(response.json()).resolves.toEqual({
      reviews: {},
      pagination: {
        offset: 0,
        limit: 20,
        total: 0,
        hasMore: false,
      },
    });
  });

  it('returns a 500 when review lookup returns an error', async () => {
    query = makeQuery({ data: null, error: new Error('select failed') });
    mockCreateClient.mockResolvedValue({ from: jest.fn(() => query) });

    const response = await GET(makeRequest('/api/reviews?courseId=CS-6200'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch reviews' });
  });

  it('returns a 500 when review lookup throws', async () => {
    mockCreateClient.mockRejectedValueOnce(new Error('client failed'));

    const response = await GET(makeRequest('/api/reviews?courseId=CS-6200'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch reviews' });
  });

  it('requires authentication before creating a review', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(
      makeRequest('/api/reviews', { method: 'POST', body: JSON.stringify({}) })
    );

    expect(response.status).toBe(401);
  });

  it('creates reviews for the authenticated user', async () => {
    query = makeQuery({ data: { id: 'review-1' }, error: null });
    const from = jest.fn(() => query);
    mockCreateClient.mockResolvedValue({ auth: { getUser: mockAuthGetUser }, from });

    const response = await POST(
      makeRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          reviewId: 'review-1',
          courseId: 'CS-6200',
          year: 2025,
          semesterId: 'fa',
          body: 'great',
          workload: 10,
          difficulty: 3,
          overall: 4,
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'review-1',
        reviewer_id: 'user-1',
        is_gt_verified: true,
        upvotes: 0,
        downvotes: 0,
      })
    );
    await expect(response.json()).resolves.toEqual({ review: { id: 'review-1' } });
  });

  it('creates non-GT reviews when the authenticated user has another email', async () => {
    mockAuthGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'person@example.com' } },
      error: null,
    });
    query = makeQuery({ data: { id: 'review-1' }, error: null });
    mockCreateClient.mockResolvedValue({ auth: { getUser: mockAuthGetUser }, from: jest.fn(() => query) });

    const response = await POST(
      makeRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ reviewId: 'review-1' }),
      })
    );

    expect(response.status).toBe(200);
    expect(query.insert).toHaveBeenCalledWith(
      expect.objectContaining({ is_gt_verified: false })
    );
  });

  it('returns a 500 when insert fails', async () => {
    query = makeQuery({ data: null, error: new Error('insert failed') });
    mockCreateClient.mockResolvedValue({ auth: { getUser: mockAuthGetUser }, from: jest.fn(() => query) });

    const response = await POST(
      makeRequest('/api/reviews', { method: 'POST', body: JSON.stringify({}) })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to create review' });
  });

  it('returns a 500 for malformed request bodies', async () => {
    const response = await POST(
      makeRequest('/api/reviews', { method: 'POST', body: '{' })
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
  });
});
