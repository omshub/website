/**
 * @jest-environment node
 */

import { POST } from './route';

const mockCookieGetAll = jest.fn();

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: mockCookieGetAll,
  })),
}));

describe('/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieGetAll.mockReturnValue([
      { name: 'sb-abc123-auth-token', value: 'token' },
      { name: 'sb-abc123-auth-token.0', value: 'chunk' },
      { name: 'sb-abc123-auth-token-code-verifier', value: 'verifier' },
      { name: 'unrelated', value: 'keep' },
    ]);
  });

  it('clears all Supabase auth cookies for host-only and production domain scopes', async () => {
    const response = await POST(
      new Request('https://www.omshub.org/auth/logout', {
        method: 'POST',
        headers: {
          host: 'www.omshub.org',
        },
      })
    );

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sb-abc123-auth-token=');
    expect(setCookie).toContain('sb-abc123-auth-token.0=');
    expect(setCookie).toContain('sb-abc123-auth-token-code-verifier=');
    expect(setCookie).toContain('Domain=omshub.org');
    expect(setCookie).not.toContain('unrelated=');
  });

  it('uses the first forwarded host when clearing production domain scopes', async () => {
    const response = await POST(
      new Request('https://internal.vercel.test/auth/logout', {
        method: 'POST',
        headers: {
          'x-forwarded-host': 'www.omshub.org, internal.vercel.test',
        },
      })
    );

    expect(response.headers.get('set-cookie') ?? '').toContain('Domain=omshub.org');
  });

  it('treats production host casing case-insensitively', async () => {
    const response = await POST(
      new Request('https://www.omshub.org/auth/logout', {
        method: 'POST',
        headers: {
          host: 'WWW.OMSHUB.ORG',
        },
      })
    );

    expect(response.headers.get('set-cookie') ?? '').toContain('Domain=omshub.org');
  });

  it('keeps preview logout cookie clearing host-only and skips unrelated cookies', async () => {
    const response = await POST(
      new Request('https://preview.vercel.app/auth/logout', {
        method: 'POST',
        headers: {
          host: 'preview.vercel.app',
        },
      })
    );

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sb-abc123-auth-token=');
    expect(setCookie).not.toContain('Domain=omshub.org');
    expect(setCookie).not.toContain('unrelated=');
  });
});
