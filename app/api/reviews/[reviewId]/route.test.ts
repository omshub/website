/**
 * @jest-environment node
 */

import { DELETE, PUT } from './route';
import { revalidatePath, revalidateTag } from 'next/cache';

const mockGetAuthenticatedClaims = jest.fn();
const mockFetchSingle = jest.fn();
const mockFetchEq = jest.fn(() => ({ single: mockFetchSingle }));
const mockSelect = jest.fn(() => ({ eq: mockFetchEq }));
const mockDeleteEq = jest.fn();
const mockDelete = jest.fn(() => ({ eq: mockDeleteEq }));
const mockUpdateEq = jest.fn();
const mockUpdate = jest.fn(() => ({ eq: mockUpdateEq }));
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  delete: mockDelete,
  update: mockUpdate,
}));

jest.mock('@/lib/supabase/auth', () => ({
  getAuthenticatedClaims: (...args: unknown[]) =>
    mockGetAuthenticatedClaims(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({ from: mockFrom })),
}));

jest.mock('@/lib/supabase/publicReviews', () => ({
  courseReviewsCacheTag: (courseId: string) => `reviews:course:${courseId}`,
  RECENT_REVIEWS_CACHE_TAG: 'reviews:recent',
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

const context = { params: Promise.resolve({ reviewId: 'review-1' }) };
const deleteRequest = new Request(
  'https://www.omshub.org/api/reviews/review-1',
  { method: 'DELETE' }
) as any;
const updateRequest = () =>
  new Request('https://www.omshub.org/api/reviews/review-1', {
    method: 'PUT',
    body: JSON.stringify({
      body: 'Updated',
      workload: 8,
      difficulty: 2,
      overall: 4,
    }),
  }) as any;

describe('/api/reviews/[reviewId]', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAuthenticatedClaims.mockResolvedValue({ userId: 'user-1' });
    mockFetchSingle.mockResolvedValue({
      data: { reviewer_id: 'user-1', course_id: 'CS-6200' },
      error: null,
    });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockUpdateEq.mockResolvedValue({ error: null });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it.each([
    ['delete', () => DELETE(deleteRequest, context)],
    ['update', () => PUT(updateRequest(), context)],
  ])('requires verified claims before %s', async (_name, run) => {
    mockGetAuthenticatedClaims.mockResolvedValueOnce(null);
    const response = await run();
    expect(response.status).toBe(401);
    expect(mockSelect).not.toHaveBeenCalled();
  });

  it.each([
    ['delete', () => DELETE(deleteRequest, context)],
    ['update', () => PUT(updateRequest(), context)],
  ])('returns 404 when the review is missing before %s', async (_name, run) => {
    mockFetchSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'missing' },
    });
    const response = await run();
    expect(response.status).toBe(404);
  });

  it.each([
    ['delete', () => DELETE(deleteRequest, context)],
    ['update', () => PUT(updateRequest(), context)],
  ])('forbids %s for a different owner', async (_name, run) => {
    mockFetchSingle.mockResolvedValueOnce({
      data: { reviewer_id: 'user-2', course_id: 'CS-6200' },
      error: null,
    });
    const response = await run();
    expect(response.status).toBe(403);
  });

  it('deletes an owned review and invalidates caches', async () => {
    const response = await DELETE(deleteRequest, context);
    expect(response.status).toBe(200);
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'review-1');
    expect(revalidateTag).toHaveBeenCalledWith(
      'reviews:course:CS-6200',
      'max'
    );
    expect(revalidateTag).toHaveBeenCalledWith('reviews:recent', 'max');
    expect(revalidatePath).toHaveBeenCalledWith('/course/CS-6200');
  });

  it('updates an owned review without returning the full row', async () => {
    const response = await PUT(updateRequest(), context);
    expect(response.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Updated',
        workload: 8,
        difficulty: 2,
        overall: 4,
        modified_at: expect.any(String),
      })
    );
    expect(mockUpdateEq).toHaveBeenCalledWith('id', 'review-1');
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it('returns 500 when deletion fails', async () => {
    mockDeleteEq.mockResolvedValueOnce({
      error: { message: 'delete failed' },
    });
    const response = await DELETE(deleteRequest, context);
    expect(response.status).toBe(500);
  });

  it('returns 500 when update fails', async () => {
    mockUpdateEq.mockResolvedValueOnce({
      error: { message: 'update failed' },
    });
    const response = await PUT(updateRequest(), context);
    expect(response.status).toBe(500);
  });
});
