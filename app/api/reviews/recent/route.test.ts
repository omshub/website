/**
 * @jest-environment node
 */

import { GET } from './route';
import { PUBLIC_API_CACHE_CONTROL } from '@/lib/cacheHeaders';

const mockGetPublicReviewsPage = jest.fn();

jest.mock('@/lib/supabase/publicReviews', () => ({
  getPublicReviewsPage: (...args: unknown[]) => mockGetPublicReviewsPage(...args),
  MAX_PUBLIC_REVIEW_LIMIT: 50,
  MAX_PUBLIC_REVIEW_OFFSET: 5000,
  MAX_PUBLIC_REVIEW_SEARCH_LENGTH: 100,
}));

const makeRequest = (path: string) =>
  new Request(`https://www.omshub.org${path}`) as any;

describe('/api/reviews/recent', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetPublicReviewsPage.mockResolvedValue({
      reviews: [{ id: 'review-1' }],
      hasMore: true,
    });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it('forwards bounded pagination and search to the cached reader', async () => {
    const response = await GET(
      makeRequest('/api/reviews/recent?limit=5&offset=10&search=kernel')
    );

    expect(mockGetPublicReviewsPage).toHaveBeenCalledWith({
      search: 'kernel',
      limit: 5,
      offset: 10,
    });
    expect(response.headers.get('Cache-Control')).toBe(PUBLIC_API_CACHE_CONTROL);
    await expect(response.json()).resolves.toEqual({
      reviews: [{ id: 'review-1' }],
      pagination: { offset: 10, limit: 5, hasMore: true },
    });
  });

  it.each([
    '/api/reviews/recent?limit=0',
    '/api/reviews/recent?limit=51',
    '/api/reviews/recent?offset=-1',
    '/api/reviews/recent?offset=5001',
    '/api/reviews/recent?limit=not-a-number',
  ])('rejects invalid pagination: %s', async (path) => {
    const response = await GET(makeRequest(path));
    expect(response.status).toBe(400);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockGetPublicReviewsPage).not.toHaveBeenCalled();
  });

  it('rejects one-character searches', async () => {
    const response = await GET(makeRequest('/api/reviews/recent?search=x'));
    expect(response.status).toBe(400);
    expect(mockGetPublicReviewsPage).not.toHaveBeenCalled();
  });

  it('returns an uncached 503 when the cached reader fails', async () => {
    mockGetPublicReviewsPage.mockRejectedValueOnce(new Error('restricted'));
    const response = await GET(makeRequest('/api/reviews/recent'));
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch reviews',
    });
  });
});
