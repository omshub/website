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

  it('forbids requesting another user review list', async () => {
    const response = await GET(makeRequest('/api/user/reviews?userId=user-2'));

    expect(response.status).toBe(403);
    expect(mockGetUserReviews).not.toHaveBeenCalled();
  });
});
