import { updateSession } from '../proxy';

const mockGetUser = jest.fn().mockResolvedValue({ data: { user: null }, error: null });

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

const mockNextResponseCookies = { set: jest.fn() };
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({ cookies: mockNextResponseCookies })),
  },
}));

function makeMockRequest(
  cookies: Array<{ name: string; value: string }> = [],
  options: {
    pathname?: string;
    headers?: Record<string, string>;
  } = {}
) {
  return {
    nextUrl: {
      pathname: options.pathname ?? '/',
    },
    headers: {
      get: jest.fn((name: string) => options.headers?.[name.toLowerCase()] ?? null),
    },
    cookies: {
      getAll: jest.fn(() => cookies),
      set: jest.fn(),
    },
  } as any;
}

describe('updateSession()', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  });

  it('does NOT call getUser() when no session cookie is present', async () => {
    await updateSession(makeMockRequest());
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('does NOT call getUser() for PKCE code_verifier cookies only', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' }])
    );
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('calls getUser() when a session token cookie is present', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
    );
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it('calls getUser() for chunked session token cookies', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token.0', value: 'chunk' }])
    );
    expect(mockGetUser).toHaveBeenCalledTimes(1);
  });

  it('does NOT call getUser() for API requests because handlers authenticate themselves', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        pathname: '/api/reviews',
      })
    );
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('does NOT call getUser() for Next.js prefetch requests', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        headers: { 'next-router-prefetch': '1' },
      })
    );
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it('clears auth-token cookies when getUser() reports an invalid refresh token', async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found', status: 400 },
    });

    await updateSession(
      makeMockRequest([
        { name: 'sb-abc123-auth-token', value: 'token' },
        { name: 'sb-abc123-auth-token.0', value: 'chunk' },
        { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
      ])
    );

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ maxAge: 0, path: '/' })
    );
    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token.0',
      '',
      expect.objectContaining({ maxAge: 0, path: '/' })
    );
    expect(mockNextResponseCookies.set).not.toHaveBeenCalledWith(
      'sb-abc123-auth-token-code-verifier',
      '',
      expect.anything()
    );
  });

  it('returns a NextResponse', async () => {
    const response = await updateSession(makeMockRequest());
    expect(response).toBeDefined();
  });
});
