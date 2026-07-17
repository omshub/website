/**
 * @jest-environment node
 */

import { GET, POST } from './route';

const mockGetAuthenticatedClaims = jest.fn();
const mockMaybeSingle = jest.fn();
const mockGetEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockGetSelect = jest.fn(() => ({ eq: mockGetEq }));
const mockPostSingle = jest.fn();
const mockPostSelect = jest.fn(() => ({ single: mockPostSingle }));
const mockUpsert = jest.fn(() => ({ select: mockPostSelect }));
const mockFrom = jest.fn(() => ({
  select: mockGetSelect,
  upsert: mockUpsert,
}));

jest.mock('@/lib/supabase/auth', () => ({
  getAuthenticatedClaims: (...args: unknown[]) =>
    mockGetAuthenticatedClaims(...args),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({ from: mockFrom })),
}));

describe('/api/user', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAuthenticatedClaims.mockResolvedValue({
      userId: 'user-1',
      email: 'student@gatech.edu',
    });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    mockPostSingle.mockResolvedValue({
      data: { id: 'user-1', has_gt_email: true },
      error: null,
    });
  });

  afterEach(() => consoleErrorSpy.mockRestore());

  it.each([GET, POST])('requires verified claims', async (handler) => {
    mockGetAuthenticatedClaims.mockResolvedValueOnce(null);
    const response = await handler();
    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('returns an empty private payload when the profile does not exist', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({
      userId: null,
      hasGTEmail: false,
      reviews: {},
    });
  });

  it('returns only the authenticated profile fields', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: 'user-1',
        has_gt_email: true,
        education_level: 'mast',
        subject_area: 'cs',
        work_years: 4,
        specialization: 'ml',
      },
      error: null,
    });

    const response = await GET();
    expect(mockGetEq).toHaveBeenCalledWith('id', 'user-1');
    await expect(response.json()).resolves.toEqual({
      userId: 'user-1',
      hasGTEmail: true,
      educationLevelId: 'mast',
      subjectAreaId: 'cs',
      workYears: 4,
      specializationId: 'ml',
      reviews: {},
    });
  });

  it('returns a private 500 when profile lookup fails', async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'lookup failed' },
    });
    const response = await GET();
    expect(response.status).toBe(500);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('upserts the authenticated profile and derives GT status from claims', async () => {
    const response = await POST();
    expect(mockUpsert).toHaveBeenCalledWith(
      { id: 'user-1', has_gt_email: true },
      { onConflict: 'id' }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    await expect(response.json()).resolves.toEqual({
      userId: 'user-1',
      hasGTEmail: true,
      reviews: {},
    });
  });

  it('treats missing claim email as non-GT', async () => {
    mockGetAuthenticatedClaims.mockResolvedValueOnce({ userId: 'user-1' });
    mockPostSingle.mockResolvedValueOnce({
      data: { id: 'user-1', has_gt_email: false },
      error: null,
    });
    await POST();
    expect(mockUpsert).toHaveBeenCalledWith(
      { id: 'user-1', has_gt_email: false },
      { onConflict: 'id' }
    );
  });

  it('returns a private 500 when profile upsert fails', async () => {
    mockPostSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'upsert failed' },
    });
    const response = await POST();
    expect(response.status).toBe(500);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
});
