/**
 * @jest-environment node
 */

import { GET } from './route';

const mockExchangeCodeForSession = jest.fn();
const mockCookieGetAll = jest.fn();

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: mockCookieGetAll,
  })),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn((_url, _key, options) => {
    mockExchangeCodeForSession.mockImplementation(async () => {
      options.cookies.setAll([
        {
          name: 'sb-abc123-auth-token',
          value: 'token',
          options: { path: '/' },
        },
      ]);
      return { data: { session: { access_token: 'token' }, user: { id: 'user' } }, error: null };
    });

    return {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    };
  }),
}));

function makeCallbackRequest(path: string, headers: Record<string, string> = {}) {
  return new Request(`https://internal.vercel.test${path}`, { headers });
}

describe('/auth/callback', () => {
  const originalEnv = process.env;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockCookieGetAll.mockReturnValue([]);
    mockExchangeCodeForSession.mockReset();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it('uses forwarded public host for missing-code failure redirects', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://www.omshub.org/?error=auth_callback_error&reason=no_code'
    );
  });

  it('accepts uppercase canonical forwarded hosts', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'WWW.OMSHUB.ORG',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://www.omshub.org/?error=auth_callback_error&reason=no_code'
    );
  });

  it('clears verifier cookies on missing-code callbacks', async () => {
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
    ]);

    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('sb-abc123-auth-token-code-verifier=')
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('Domain=omshub.org')
    );
  });

  it('ignores unexpected forwarded hosts for failure redirects', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'evil.example.com',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://internal.vercel.test/?error=auth_callback_error&reason=no_code'
    );
  });

  it('falls back to https for unexpected forwarded protocols', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'javascript',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://www.omshub.org/?error=auth_callback_error&reason=no_code'
    );
  });

  it('clears verifier cookies on provider error callbacks', async () => {
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
    ]);

    const response = await GET(
      makeCallbackRequest('/auth/callback?error=access_denied', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://www.omshub.org/?error=access_denied'
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('sb-abc123-auth-token-code-verifier=')
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('Domain=omshub.org')
    );
  });

  it('clears production domain PKCE verifier cookies on exchange failures', async () => {
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
    ]);
    mockExchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'bad code', status: 400 },
    });

    const response = await GET(
      makeCallbackRequest('/auth/callback?code=bad', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('sb-abc123-auth-token-code-verifier=')
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('Domain=omshub.org')
    );
  });

  it('redirects with diagnostics and clears verifier cookies when exchange throws', async () => {
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
    ]);
    mockExchangeCodeForSession.mockRejectedValueOnce(new Error('network down'));

    const response = await GET(
      makeCallbackRequest('/auth/callback?code=bad', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://www.omshub.org/?error=auth_callback_error&reason=exchange_failed&message=network+down'
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('sb-abc123-auth-token-code-verifier=')
    );
    expect(response.headers.get('set-cookie')).toEqual(
      expect.stringContaining('Domain=omshub.org')
    );
  });

  it('keeps preview deployment callback cookies host-only', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback?code=ok', {
        'x-forwarded-host': 'website-preview-omshub.vercel.app',
        'x-forwarded-proto': 'https',
      })
    );

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sb-abc123-auth-token=token');
    expect(setCookie).not.toContain('Domain=');
  });

  it('trusts the current Vercel preview host from VERCEL_URL', async () => {
    process.env.VERCEL_URL = 'omshub-website-git-auth-preview.vercel.app';

    const response = await GET(
      makeCallbackRequest('/auth/callback?code=ok&next=/user/reviews', {
        'x-forwarded-host': 'omshub-website-git-auth-preview.vercel.app',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://omshub-website-git-auth-preview.vercel.app/user/reviews'
    );
    expect(response.headers.get('set-cookie') ?? '').not.toContain('Domain=');
  });

  it('ignores unrelated vercel.app forwarded hosts', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback', {
        'x-forwarded-host': 'evil.vercel.app',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://internal.vercel.test/?error=auth_callback_error&reason=no_code'
    );
  });

  it('clears verifier cookies after successful exchange', async () => {
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
    ]);

    const response = await GET(
      makeCallbackRequest('/auth/callback?code=ok', {
        'x-forwarded-host': 'www.omshub.org',
        'x-forwarded-proto': 'https',
      })
    );

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sb-abc123-auth-token=token');
    expect(setCookie).toContain('sb-abc123-auth-token-code-verifier=');
    expect(setCookie).toContain('Domain=omshub.org');
  });

  it('ignores unexpected forwarded hosts for successful redirects', async () => {
    const response = await GET(
      makeCallbackRequest('/auth/callback?code=ok&next=/user/reviews', {
        'x-forwarded-host': 'evil.example.com',
        'x-forwarded-proto': 'https',
      })
    );

    expect(response.headers.get('location')).toBe(
      'https://internal.vercel.test/user/reviews'
    );
  });
});
