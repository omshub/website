/**
 * @jest-environment node
 */

import { DELETE, PUT } from './route';

const mockCreateClient = jest.fn();
const mockAuthGetUser = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

function makeRequest(init?: RequestInit) {
  return new Request('https://www.omshub.org/api/reviews/review-1', init);
}

function makeContext(reviewId = 'review-1') {
  return { params: Promise.resolve({ reviewId }) };
}

function makeQuery(result: unknown) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    single: jest.fn(() => query),
    delete: jest.fn(() => query),
    update: jest.fn(() => query),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result)),
  };
  return query;
}

describe('/api/reviews/[reviewId]', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let queries: any[];

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAuthGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
    queries = [];
    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockAuthGetUser },
      from: jest.fn(() => queries.shift()),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('requires authentication before deleting', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(401);
  });

  it('returns 404 when deleting a missing review', async () => {
    queries.push(makeQuery({ data: null, error: new Error('not found') }));

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(404);
  });

  it('forbids deleting another user review', async () => {
    queries.push(makeQuery({ data: { reviewer_id: 'user-2' }, error: null }));

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(403);
  });

  it('deletes the authenticated user review', async () => {
    const fetchQuery = makeQuery({ data: { reviewer_id: 'user-1' }, error: null });
    const deleteQuery = makeQuery({ error: null });
    queries.push(fetchQuery, deleteQuery);

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(200);
    expect(deleteQuery.delete).toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ success: true });
  });

  it('returns a 500 when delete fails', async () => {
    queries.push(
      makeQuery({ data: { reviewer_id: 'user-1' }, error: null }),
      makeQuery({ error: new Error('delete failed') })
    );

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to delete review' });
  });

  it('returns a 500 when delete throws', async () => {
    mockCreateClient.mockRejectedValueOnce(new Error('client failed'));

    const response = await DELETE(makeRequest(), makeContext());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
  });

  it('requires authentication before updating', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await PUT(makeRequest({ method: 'PUT', body: '{}' }), makeContext());

    expect(response.status).toBe(401);
  });

  it('returns 404 when updating a missing review', async () => {
    queries.push(makeQuery({ data: null, error: new Error('not found') }));

    const response = await PUT(makeRequest({ method: 'PUT', body: '{}' }), makeContext());

    expect(response.status).toBe(404);
  });

  it('forbids updating another user review', async () => {
    queries.push(makeQuery({ data: { reviewer_id: 'user-2' }, error: null }));

    const response = await PUT(makeRequest({ method: 'PUT', body: '{}' }), makeContext());

    expect(response.status).toBe(403);
  });

  it('updates the authenticated user review', async () => {
    const updateQuery = makeQuery({ data: { id: 'review-1', body: 'updated' }, error: null });
    queries.push(makeQuery({ data: { reviewer_id: 'user-1' }, error: null }), updateQuery);

    const response = await PUT(
      makeRequest({
        method: 'PUT',
        body: JSON.stringify({ body: 'updated', workload: 12, difficulty: 4, overall: 5 }),
      }),
      makeContext()
    );

    expect(response.status).toBe(200);
    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'updated',
        workload: 12,
        difficulty: 4,
        overall: 5,
        modified_at: expect.any(String),
      })
    );
    await expect(response.json()).resolves.toEqual({
      review: { id: 'review-1', body: 'updated' },
    });
  });

  it('returns a 500 when update fails', async () => {
    queries.push(
      makeQuery({ data: { reviewer_id: 'user-1' }, error: null }),
      makeQuery({ data: null, error: new Error('update failed') })
    );

    const response = await PUT(makeRequest({ method: 'PUT', body: '{}' }), makeContext());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to update review' });
  });

  it('returns a 500 when update body parsing throws', async () => {
    const response = await PUT(makeRequest({ method: 'PUT', body: '{' }), makeContext());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
  });
});
