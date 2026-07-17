/**
 * @jest-environment node
 */

import { GET, POST } from './route';
import { PUBLIC_API_CACHE_CONTROL } from '@/lib/cacheHeaders';
import { revalidatePath, revalidateTag } from 'next/cache';

const mockGetPublicReviewsPage = jest.fn();
const mockGetAuthenticatedClaims = jest.fn();
const mockInsert = jest.fn();
const mockFrom = jest.fn(() => ({ insert: mockInsert }));

jest.mock('@/lib/supabase/publicReviews', () => ({
  courseReviewsCacheTag: (courseId: string) => `reviews:course:${courseId}`,
  getPublicReviewsPage: (...args: unknown[]) => mockGetPublicReviewsPage(...args),
  MAX_PUBLIC_REVIEW_LIMIT: 50,
  MAX_PUBLIC_REVIEW_OFFSET: 5000,
  MAX_PUBLIC_REVIEW_SEARCH_LENGTH: 100,
  RECENT_REVIEWS_CACHE_TAG: 'reviews:recent',
}));

jest.mock('@/lib/supabase/auth', () => ({
  getAuthenticatedClaims: (...args: unknown[]) =>
    mockGetAuthenticatedClaims(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({ from: mockFrom })),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

const publicReview = {
  id: 'review-1',
  course_id: 'CS-6200',
  reviewer_id: 'user-1',
  year: 2025,
  semester: 'fa',
  body: 'Great course',
  workload: 10,
  difficulty: 3,
  overall: 5,
  is_legacy: false,
  is_gt_verified: true,
  upvotes: 2,
  downvotes: 0,
  created_at: '2025-08-01T00:00:00.000Z',
  modified_at: null,
};

const makeRequest = (path: string, init?: RequestInit) =>
  new Request(`https://www.omshub.org${path}`, init) as any;

describe('/api/reviews', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPublicReviewsPage.mockResolvedValue({
      reviews: [publicReview],
      hasMore: false,
    });
    mockGetAuthenticatedClaims.mockResolvedValue({
      userId: 'user-1',
      email: 'student@gatech.edu',
    });
    mockInsert.mockResolvedValue({ error: null });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it('requires a valid courseId', async () => {
    const response = await GET(makeRequest('/api/reviews'));
    expect(response.status).toBe(400);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('returns cached paginated reviews without exact counts', async () => {
    const response = await GET(
      makeRequest(
        '/api/reviews?courseId=CS-6200&year=2025&semester=fa&search=kernel&limit=5&offset=10&paginated=true'
      )
    );

    expect(mockGetPublicReviewsPage).toHaveBeenCalledWith({
      courseId: 'CS-6200',
      year: 2025,
      semester: 'fa',
      search: 'kernel',
      limit: 5,
      offset: 10,
    });
    expect(response.headers.get('Cache-Control')).toBe(PUBLIC_API_CACHE_CONTROL);
    await expect(response.json()).resolves.toEqual({
      reviews: {
        'review-1': expect.objectContaining({
          reviewId: 'review-1',
          courseId: 'CS-6200',
          body: 'Great course',
        }),
      },
      pagination: { offset: 10, limit: 5, hasMore: false },
    });
  });

  it.each([
    '/api/reviews?courseId=CS-6200&limit=0',
    '/api/reviews?courseId=CS-6200&offset=-1',
    '/api/reviews?courseId=CS-6200&year=1999',
    '/api/reviews?courseId=CS-6200&semester=wi',
    '/api/reviews?courseId=CS-6200&search=x',
  ])('rejects invalid filters: %s', async (path) => {
    const response = await GET(makeRequest(path));
    expect(response.status).toBe(400);
    expect(mockGetPublicReviewsPage).not.toHaveBeenCalled();
  });

  it('returns an uncached 503 when public reads fail', async () => {
    mockGetPublicReviewsPage.mockRejectedValueOnce(new Error('restricted'));
    const response = await GET(
      makeRequest('/api/reviews?courseId=CS-6200')
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('requires authentication before creating a review', async () => {
    mockGetAuthenticatedClaims.mockResolvedValueOnce(null);
    const response = await POST(
      makeRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ reviewId: 'review-1' }),
      })
    );
    expect(response.status).toBe(401);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('creates reviews and invalidates course and recent caches', async () => {
    const body = {
      reviewId: 'review-2',
      courseId: 'CS-6250',
      year: 2026,
      semesterId: 'sp',
      body: 'Solid',
      workload: 8,
      difficulty: 2,
      overall: 4,
    };
    const response = await POST(
      makeRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    );

    expect(response.status).toBe(200);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'review-2',
        reviewer_id: 'user-1',
        is_gt_verified: true,
      })
    );
    expect(revalidateTag).toHaveBeenCalledWith(
      'reviews:course:CS-6250',
      'max'
    );
    expect(revalidateTag).toHaveBeenCalledWith('reviews:recent', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/course/CS-6250');
    expect(revalidatePath).toHaveBeenCalledWith('/recents');
  });

  it('returns a 500 when insertion fails', async () => {
    mockInsert.mockResolvedValueOnce({ error: { message: 'insert failed' } });
    const response = await POST(
      makeRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({ reviewId: 'review-1', courseId: 'CS-6200' }),
      })
    );
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to create review',
    });
  });
});
