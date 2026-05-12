/**
 * @jest-environment node
 */

import { GET } from './route';

const mockCreateClient = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

function makeRequest(path: string) {
  return new Request(`https://www.omshub.org${path}`);
}

function makeQuery(result: unknown) {
  const query: any = {
    select: jest.fn(() => query),
    order: jest.fn(() => query),
    ilike: jest.fn(() => query),
    range: jest.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result)),
  };
  return query;
}

describe('/api/reviews/recent', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let query: any;
  let countQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    query = makeQuery({ data: [{ id: 'review-1' }], error: null });
    countQuery = makeQuery({ count: 20 });
    mockCreateClient.mockResolvedValue({
      from: jest.fn()
        .mockReturnValueOnce(query)
        .mockReturnValueOnce(countQuery),
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns recent reviews with pagination', async () => {
    const response = await GET(makeRequest('/api/reviews/recent?limit=5&offset=10'));

    expect(query.range).toHaveBeenCalledWith(10, 14);
    await expect(response.json()).resolves.toEqual({
      reviews: [{ id: 'review-1' }],
      pagination: {
        offset: 10,
        limit: 5,
        total: 20,
        hasMore: true,
      },
    });
  });

  it('filters recent reviews by search and caps limit', async () => {
    const response = await GET(makeRequest('/api/reviews/recent?limit=999&search=kernel'));

    expect(query.ilike).toHaveBeenCalledWith('body', '%kernel%');
    expect(countQuery.ilike).toHaveBeenCalledWith('body', '%kernel%');
    expect(query.range).toHaveBeenCalledWith(0, 99);
    expect(response.status).toBe(200);
  });

  it('returns empty arrays and zero count defaults', async () => {
    query = makeQuery({ data: null, error: null });
    countQuery = makeQuery({ count: null });
    mockCreateClient.mockResolvedValue({
      from: jest.fn()
        .mockReturnValueOnce(query)
        .mockReturnValueOnce(countQuery),
    });

    const response = await GET(makeRequest('/api/reviews/recent'));

    await expect(response.json()).resolves.toEqual({
      reviews: [],
      pagination: {
        offset: 0,
        limit: 20,
        total: 0,
        hasMore: false,
      },
    });
  });

  it('returns a 500 when recent review lookup fails', async () => {
    query = makeQuery({ data: null, error: new Error('select failed') });
    mockCreateClient.mockResolvedValue({
      from: jest.fn()
        .mockReturnValueOnce(query)
        .mockReturnValueOnce(countQuery),
    });

    const response = await GET(makeRequest('/api/reviews/recent'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to fetch reviews' });
  });

  it('returns a 500 when the handler throws', async () => {
    mockCreateClient.mockRejectedValueOnce(new Error('client failed'));

    const response = await GET(makeRequest('/api/reviews/recent'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Internal server error' });
  });
});
