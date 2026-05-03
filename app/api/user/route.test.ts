/**
 * @jest-environment node
 */

import { GET, POST } from './route';

const mockGetUserProfile = jest.fn();
const mockAddUser = jest.fn();
const mockAuthGetUser = jest.fn();

jest.mock('@/lib/supabase/dbOperations', () => ({
  getUser: (...args: unknown[]) => mockGetUserProfile(...args),
  addUser: (...args: unknown[]) => mockAddUser(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockAuthGetUser,
    },
  })),
}));

function makeRequest(path: string, init?: RequestInit) {
  return new Request(`https://www.omshub.org${path}`, init);
}

describe('/api/user', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'student@gatech.edu' } },
      error: null,
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('requires authentication before creating a profile', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(
      makeRequest('/api/user', {
        method: 'POST',
        body: JSON.stringify({ userId: 'attacker', hasGTEmail: true }),
      })
    );

    expect(response.status).toBe(401);
    expect(mockAddUser).not.toHaveBeenCalled();
  });

  it('creates profiles for the authenticated user and derives GT email server-side', async () => {
    mockAuthGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1', email: 'person@gmail.com' } },
      error: null,
    });
    mockGetUserProfile.mockResolvedValueOnce(null);
    mockAddUser.mockResolvedValueOnce({ id: 'user-1', has_gt_email: false });

    const response = await POST(
      makeRequest('/api/user', {
        method: 'POST',
        body: JSON.stringify({ userId: 'attacker', hasGTEmail: true }),
      })
    );

    expect(response.status).toBe(200);
    expect(mockAddUser).toHaveBeenCalledWith({
      id: 'user-1',
      has_gt_email: false,
    });
  });

  it('returns an existing authenticated profile without inserting a duplicate', async () => {
    mockGetUserProfile.mockResolvedValueOnce({
      id: 'user-1',
      has_gt_email: true,
    });

    const response = await POST(makeRequest('/api/user', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      userId: 'user-1',
      hasGTEmail: true,
      reviews: {},
    });
    expect(mockAddUser).not.toHaveBeenCalled();
  });

  it('returns the existing profile when insert races with another creator', async () => {
    mockGetUserProfile
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'user-1', has_gt_email: true });
    mockAddUser.mockRejectedValueOnce({ code: '23505', message: 'duplicate key' });

    const response = await POST(makeRequest('/api/user', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      userId: 'user-1',
      hasGTEmail: true,
      reviews: {},
    });
  });

  it('only returns the authenticated user profile', async () => {
    const response = await GET(makeRequest('/api/user?userId=someone-else'));

    expect(response.status).toBe(403);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });
});
