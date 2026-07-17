import { updateSession } from '../proxy';
import { createServerClient } from '@supabase/ssr';

const mockGetClaims = jest.fn().mockResolvedValue({ data: { user: null }, error: null });

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn((_url, _key, options) => ({
    auth: {
      getClaims: mockGetClaims,
    },
    __options: options,
  })),
}));

const mockNextResponseCookies = { set: jest.fn() };
const mockNextResponseHeaders = { set: jest.fn() };
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => ({
      cookies: mockNextResponseCookies,
      headers: mockNextResponseHeaders,
    })),
  },
}));

const originalEnv = process.env;

function makeMockRequest(
  cookies: Array<{ name: string; value: string }> = [],
  options: {
    pathname?: string;
    headers?: Record<string, string>;
    host?: string;
  } = {}
) {
  const headers = {
    ...(options.host ? { host: options.host } : {}),
    ...options.headers,
  };

  return {
    nextUrl: {
      pathname: options.pathname ?? '/',
    },
    headers: {
      get: jest.fn((name: string) => headers?.[name.toLowerCase()] ?? null),
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
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    };
    mockGetClaims.mockResolvedValue({ data: { user: null }, error: null });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('skips Supabase session refresh when preview runtime env vars are missing', async () => {
    process.env = { ...originalEnv };

    await expect(updateSession(makeMockRequest())).resolves.toBeDefined();

    expect(createServerClient).not.toHaveBeenCalled();
    expect(mockGetClaims).not.toHaveBeenCalled();
  });

  it('does NOT call getClaims() when no session cookie is present', async () => {
    await updateSession(makeMockRequest());
    expect(mockGetClaims).not.toHaveBeenCalled();
  });

  it('does NOT call getClaims() for PKCE code_verifier cookies only', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' }])
    );
    expect(mockGetClaims).not.toHaveBeenCalled();
  });

  it('calls getClaims() when a session token cookie is present', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
    );
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
  });

  it('applies Supabase cookie writes to the request and response', async () => {
    const request = makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }]);

    await updateSession(request);
    const options = (createServerClient as jest.Mock).mock.calls[0][2];
    expect(options.cookies.getAll()).toEqual([
      { name: 'sb-abc123-auth-token', value: 'token' },
    ]);
    options.cookies.setAll([
      { name: 'sb-abc123-auth-token', value: 'new-token', options: { path: '/' } },
    ]);

    expect(request.cookies.set).toHaveBeenCalledWith('sb-abc123-auth-token', 'new-token');
    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      'new-token',
      { path: '/' }
    );
  });

  it('calls getClaims() for chunked session token cookies', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token.0', value: 'chunk' }])
    );
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
  });

  it('calls getClaims() for API requests with session cookies so stale cookies are cleared before handlers run', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        pathname: '/api/reviews',
      })
    );
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
  });

  it('calls getClaims() for Next.js prefetch requests with session cookies so Server Components receive refreshed cookies', async () => {
    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        headers: { 'next-router-prefetch': '1' },
      })
    );
    expect(mockGetClaims).toHaveBeenCalledTimes(1);
  });

  it('clears auth-token cookies when getClaims() reports an invalid refresh token', async () => {
    mockGetClaims.mockResolvedValueOnce({
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

  it('does not clear auth-token cookies when getClaims() is rate limited', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Too many requests', status: 429 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
    );

    expect(mockNextResponseCookies.set).not.toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ maxAge: 0, path: '/' })
    );
  });

  it('does not clear auth-token cookies when getClaims returns an error without a message', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { status: 500 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
    );

    expect(mockNextResponseCookies.set).not.toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ maxAge: 0, path: '/' })
    );
  });

  it('also clears production domain auth-token cookies for www/apex hosts', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found', status: 400 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        host: 'www.omshub.org',
      })
    );

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ domain: 'omshub.org', maxAge: 0, path: '/' })
    );
  });

  it('treats production host casing case-insensitively when clearing domain cookies', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found', status: 400 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        host: 'WWW.OMSHUB.ORG',
      })
    );

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ domain: 'omshub.org', maxAge: 0, path: '/' })
    );
  });

  it('uses forwarded production hosts when clearing domain auth-token cookies', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid Refresh Token: Refresh Token Not Found', status: 400 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        host: 'internal.vercel.test',
        headers: { 'x-forwarded-host': 'www.omshub.org' },
      })
    );

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ domain: 'omshub.org', maxAge: 0, path: '/' })
    );
  });

  it('handles comma-separated forwarded hosts when clearing domain cookies', async () => {
    mockGetClaims.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'refresh token not found', status: 400 },
    });

    await updateSession(
      makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }], {
        headers: { 'x-forwarded-host': 'www.omshub.org, internal.vercel.test' },
      })
    );

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ domain: 'omshub.org', maxAge: 0, path: '/' })
    );
  });

  it('does not let thrown auth refresh failures break public requests', async () => {
    mockGetClaims.mockRejectedValueOnce({
      message: 'Invalid Refresh Token: Refresh Token Not Found',
      status: 400,
    });

    await expect(
      updateSession(
        makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
      )
    ).resolves.toBeDefined();

    expect(mockNextResponseCookies.set).toHaveBeenCalledWith(
      'sb-abc123-auth-token',
      '',
      expect.objectContaining({ maxAge: 0, path: '/' })
    );
  });

  it('rethrows unexpected auth refresh failures', async () => {
    mockGetClaims.mockRejectedValueOnce(new Error('network unavailable'));

    await expect(
      updateSession(
        makeMockRequest([{ name: 'sb-abc123-auth-token', value: 'token' }])
      )
    ).rejects.toThrow('network unavailable');
  });

  it('returns a NextResponse', async () => {
    const response = await updateSession(makeMockRequest());
    expect(response).toBeDefined();
  });
});
