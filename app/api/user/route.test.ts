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

  it('treats missing authenticated email as non-GT when creating a profile', async () => {
    mockAuthGetUser.mockResolvedValueOnce({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockGetUserProfile.mockResolvedValueOnce(null);
    mockAddUser.mockResolvedValueOnce({ id: 'user-1', has_gt_email: false });

    const response = await POST(makeRequest('/api/user', { method: 'POST' }));

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

  it('requires userId when fetching a profile', async () => {
    const response = await GET(makeRequest('/api/user'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'userId is required' });
    expect(mockAuthGetUser).not.toHaveBeenCalled();
  });

  it('requires authentication before fetching a profile', async () => {
    mockAuthGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await GET(makeRequest('/api/user?userId=user-1'));

    expect(response.status).toBe(401);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });

  it('returns an empty payload when the authenticated profile does not exist', async () => {
    mockGetUserProfile.mockResolvedValueOnce(null);

    const response = await GET(makeRequest('/api/user?userId=user-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ userId: null, hasGTEmail: false, reviews: {} });
  });

  it('returns the authenticated user profile with onboarding fields', async () => {
    mockGetUserProfile.mockResolvedValueOnce({
      id: 'user-1',
      has_gt_email: true,
      education_level: 'ms',
      subject_area: 'cs',
      work_years: 4,
      specialization: 'ml',
    });

    const response = await GET(makeRequest('/api/user?userId=user-1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      userId: 'user-1',
      hasGTEmail: true,
      educationLevelId: 'ms',
      subjectAreaId: 'cs',
      workYears: 4,
      specializationId: 'ml',
      reviews: {},
    });
  });

  it('returns a 500 when fetching the profile fails', async () => {
    mockGetUserProfile.mockRejectedValueOnce(new Error('database unavailable'));

    const response = await GET(makeRequest('/api/user?userId=user-1'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch user' });
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

  it('returns a 500 when a duplicate insert race cannot reload the profile', async () => {
    mockGetUserProfile.mockResolvedValue(null);
    mockAddUser.mockRejectedValueOnce({ code: '23505', message: 'duplicate key' });

    const response = await POST(makeRequest('/api/user', { method: 'POST' }));

    expect(response.status).toBe(500);
  });

  it('returns a 500 when creating a profile fails', async () => {
    mockGetUserProfile.mockResolvedValueOnce(null);
    mockAddUser.mockRejectedValueOnce(new Error('insert failed'));

    const response = await POST(makeRequest('/api/user', { method: 'POST' }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to create user' });
  });

  it('only returns the authenticated user profile', async () => {
    const response = await GET(makeRequest('/api/user?userId=someone-else'));

    expect(response.status).toBe(403);
    expect(mockGetUserProfile).not.toHaveBeenCalled();
  });
});
