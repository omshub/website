const https = require('node:https');
const { EventEmitter } = require('node:events');
const {
  assertAllowedRequestTarget,
  assertRedirect,
  assertRedirectStartsWith,
  assertVerifierCookieCleared,
  describePlatformBlock,
  expectedLocation,
  fetchNoFollow,
  getSetCookie,
  isAllowedDeploymentHost,
  isProductionHost,
  normalizeBaseUrl,
  protectionBypassHeaders,
  resolveAllowedDeploymentOrigin,
  runAuthCallbackChecks,
} = require('./post-deploy-auth-check');

function makeResponse(setCookie, status = 200, extraHeaders = {}) {
  return {
    status,
    headers: {
      get(name) {
        const key = name.toLowerCase();
        if (key === 'set-cookie') return setCookie;
        return extraHeaders[key] ?? null;
      },
    },
  };
}

describe('post-deploy auth check helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('normalizes deployment URLs', () => {
    expect(normalizeBaseUrl('website-git-branch-omshub.vercel.app/path?q=1')).toBe(
      'https://website-git-branch-omshub.vercel.app'
    );
  });

  it('detects production hosts case-insensitively', () => {
    expect(isProductionHost('WWW.OMSHUB.ORG')).toBe(true);
    expect(isProductionHost('website-git-branch-omshub.vercel.app')).toBe(false);
  });

  it('allows production and OMSHub Vercel deployment hosts', () => {
    expect(isAllowedDeploymentHost('omshub.org')).toBe(true);
    expect(isAllowedDeploymentHost('www.omshub.org')).toBe(true);
    expect(isAllowedDeploymentHost('website-git-fix-email-otp-auth-cookies-omshub.vercel.app')).toBe(true);
    expect(isAllowedDeploymentHost('website-a0mbbkjc7-omshub.vercel.app')).toBe(true);
  });

  it('resolves allowed deployments to fixed origins', () => {
    expect(resolveAllowedDeploymentOrigin('https://omshub.org/path?q=1')).toBe(
      'https://omshub.org'
    );
    expect(
      resolveAllowedDeploymentOrigin(
        'https://website-git-fix-email-otp-auth-cookies-omshub.vercel.app/path?q=1'
      )
    ).toBe('https://website-git-fix-email-otp-auth-cookies-omshub.vercel.app');
    expect(resolveAllowedDeploymentOrigin('https://website-a0mbbkjc7-omshub.vercel.app')).toBe(
      'https://website-git-fix-email-otp-auth-cookies-omshub.vercel.app'
    );
    expect(resolveAllowedDeploymentOrigin('https://www.omshub.org/path')).toBe(
      'https://www.omshub.org'
    );
  });

  it('rejects empty and malformed deployment URLs', () => {
    expect(() => normalizeBaseUrl()).toThrow('Deployment URL is required');
    expect(() => resolveAllowedDeploymentOrigin('ftp://omshub.org')).toThrow(
      'Unsupported deployment host'
    );
  });

  it('rejects untrusted deployment hosts before making auth callback requests', async () => {
    await expect(runAuthCallbackChecks('https://127.0.0.1:3000')).rejects.toThrow(
      'Unsupported deployment host'
    );
    await expect(runAuthCallbackChecks('https://example.com')).rejects.toThrow(
      'Unsupported deployment host'
    );
    await expect(runAuthCallbackChecks('http://omshub.org')).rejects.toThrow(
      'Unsupported deployment protocol'
    );
  });

  it('rejects unsafe request targets directly', () => {
    expect(() => assertAllowedRequestTarget(new URL('https://example.com'))).toThrow(
      'Unsupported deployment host'
    );
    expect(() => assertAllowedRequestTarget(new URL('http://omshub.org'))).toThrow(
      'Unsupported deployment protocol'
    );
  });

  it('builds expected redirect locations', () => {
    expect(expectedLocation('https://omshub.org', '/?error=access_denied')).toBe(
      'https://omshub.org/?error=access_denied'
    );
  });

  it('reads set-cookie headers from both standard helpers and raw headers', () => {
    expect(
      getSetCookie({
        headers: {
          getSetCookie: () => ['a=1', 'b=2'],
          get: () => null,
        },
      })
    ).toBe('a=1, b=2');
    expect(getSetCookie(makeResponse('a=1'))).toBe('a=1');
    expect(getSetCookie(makeResponse(null))).toBe('');
  });

  it('returns protection bypass headers when configured', () => {
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET = 'secret';
    expect(protectionBypassHeaders()).toEqual({
      'x-vercel-protection-bypass': 'secret',
    });
    delete process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    expect(protectionBypassHeaders()).toEqual({});
  });

  it('validates exact and prefix redirects', () => {
    const response = makeResponse('', 307, {
      location: 'https://omshub.org/?error=access_denied',
    });

    expect(() =>
      assertRedirect(
        response,
        'https://omshub.org/?error=access_denied',
        'provider error callback'
      )
    ).not.toThrow();
    expect(() =>
      assertRedirectStartsWith(response, 'https://omshub.org/?error=', 'provider error callback')
    ).not.toThrow();
  });

  it('rejects redirect status and location mismatches', () => {
    expect(() =>
      assertRedirect(
        makeResponse('', 401, { server: 'Vercel' }),
        'https://omshub.org/right',
        'callback'
      )
    ).toThrow('Deployment Protection');
    expect(() =>
      assertRedirect(makeResponse('', 200), 'https://omshub.org', 'callback')
    ).toThrow('expected 307/308 redirect');
    expect(() =>
      assertRedirect(
        makeResponse('', 307, { location: 'https://omshub.org/wrong' }),
        'https://omshub.org/right',
        'callback'
      )
    ).toThrow('expected Location');
    expect(() =>
      assertRedirectStartsWith(
        makeResponse('', 200, { location: 'https://omshub.org/right' }),
        'https://omshub.org/right',
        'callback'
      )
    ).toThrow('expected 307/308 redirect');
    expect(() =>
      assertRedirectStartsWith(
        makeResponse('', 307, { location: 'https://omshub.org/wrong' }),
        'https://omshub.org/right',
        'callback'
      )
    ).toThrow('expected Location to start');
    expect(() =>
      assertRedirectStartsWith(makeResponse('', 307), 'https://omshub.org/right', 'callback')
    ).toThrow('expected Location to start');
    expect(() =>
      assertRedirectStartsWith(
        makeResponse('', 401, { server: 'Vercel' }),
        'https://omshub.org/right',
        'callback'
      )
    ).toThrow('Deployment Protection');
  });

  it('allows host-only verifier clear cookies on previews', () => {
    expect(() =>
      assertVerifierCookieCleared(
        makeResponse('sb-post-deploy-auth-token-code-verifier=; Path=/; Max-Age=0'),
        'https://website-git-branch-omshub.vercel.app',
        'preview'
      )
    ).not.toThrow();
  });

  it('requires production-domain verifier clear cookies on production', () => {
    expect(() =>
      assertVerifierCookieCleared(
        makeResponse(
          'sb-post-deploy-auth-token-code-verifier=; Path=/; Domain=omshub.org; Max-Age=0'
        ),
        'https://www.omshub.org',
        'production'
      )
    ).not.toThrow();
  });

  it('requires verifier clear cookie name and Max-Age=0', () => {
    expect(() =>
      assertVerifierCookieCleared(makeResponse('other=; Path=/; Max-Age=0'), 'https://omshub.org', 'production')
    ).toThrow('expected verifier clear Set-Cookie header');
    expect(() =>
      assertVerifierCookieCleared(
        makeResponse('sb-post-deploy-auth-token-code-verifier=; Path=/'),
        'https://omshub.org',
        'production'
      )
    ).toThrow('expected verifier clear cookie to include Max-Age=0');
    expect(() =>
      assertVerifierCookieCleared(
        makeResponse('sb-post-deploy-auth-token-code-verifier=; Path=/; Max-Age=0'),
        'https://omshub.org',
        'production'
      )
    ).toThrow('expected production cookie clear to include Domain=omshub.org');
  });

  it('rejects production-domain verifier clear cookies on previews', () => {
    expect(() =>
      assertVerifierCookieCleared(
        makeResponse(
          'sb-post-deploy-auth-token-code-verifier=; Path=/; Domain=omshub.org; Max-Age=0'
        ),
        'https://website-git-branch-omshub.vercel.app',
        'preview'
      )
    ).toThrow('preview cookie clear must remain host-only');
  });

  it('reports Vercel deployment protection clearly', () => {
    expect(
      describePlatformBlock(
        makeResponse('', 401, { server: 'Vercel' }),
        'provider error callback'
      )
    ).toContain('Deployment Protection');
  });

  it('reports Vercel challenge mitigation clearly', () => {
    expect(
      describePlatformBlock(
        makeResponse('', 429, { 'x-vercel-mitigated': 'challenge' }),
        'provider error callback'
      )
    ).toContain('Vercel protection challenged');
  });

  it('returns null when a response is not a platform block', () => {
    expect(describePlatformBlock(makeResponse('', 500), 'callback')).toBeNull();
  });

  it('runs auth callback checks without following redirects', async () => {
    const responses = [
      makeResponse('', 307, {
        location: 'https://omshub.org/?error=access_denied',
      }),
      makeResponse(
        'sb-post-deploy-auth-token-code-verifier=; Path=/; Domain=omshub.org; Max-Age=0',
        307,
        {
          location: 'https://omshub.org/?error=auth_callback_error&reason=no_code',
        }
      ),
      makeResponse('', 307, {
        location: 'https://omshub.org/?error=auth_callback_error&reason=exchange_failed&message=bad',
      }),
    ];
    const requestSpy = jest.spyOn(https, 'request').mockImplementation((target, options, handler) => {
      const req = new EventEmitter();
      req.destroy = (error) => req.emit('error', error);
      req.end = () => {
        const response = responses.shift();
        const res = new EventEmitter();
        res.statusCode = response.status;
        res.headers = {
          location: response.headers.get('location'),
          'set-cookie': response.headers.get('set-cookie')
            ? [response.headers.get('set-cookie')]
            : undefined,
        };
        res.resume = jest.fn();
        handler(res);
        res.emit('end');
      };
      return req;
    });

    process.env.VERCEL_AUTOMATION_BYPASS_SECRET = 'secret';
    process.env.DEPLOYMENT_URL = 'https://omshub.org';
    await expect(runAuthCallbackChecks()).resolves.toEqual({
      baseUrl: 'https://omshub.org',
    });

    expect(requestSpy).toHaveBeenCalledTimes(3);
    expect(requestSpy.mock.calls[0][1]).toMatchObject({
      method: 'GET',
      headers: { 'x-vercel-protection-bypass': 'secret' },
    });
  });

  it('fetches without follow using default request options', async () => {
    jest.spyOn(https, 'request').mockImplementation((_target, options, handler) => {
      const req = new EventEmitter();
      req.destroy = (error) => req.emit('error', error);
      req.end = () => {
        const res = new EventEmitter();
        res.statusCode = 204;
        res.headers = {
          'x-test': ['a', 'b'],
          'set-cookie': 'a=1',
        };
        res.resume = jest.fn();
        handler(res);
        res.emit('end');
      };
      return req;
    });

    const response = await fetchNoFollow('https://omshub.org/auth/callback');

    expect(response.status).toBe(204);
    expect(response.headers.get('x-test')).toBe('a, b');
    expect(response.headers.get('missing')).toBeNull();
    expect(response.headers.getSetCookie()).toEqual(['a=1']);
    expect(https.request.mock.calls[0][1]).toMatchObject({
      method: 'GET',
      timeout: 15000,
    });
  });

  it('returns an empty set-cookie list when the response has none', async () => {
    jest.spyOn(https, 'request').mockImplementation((_target, _options, handler) => {
      const req = new EventEmitter();
      req.destroy = (error) => req.emit('error', error);
      req.end = () => {
        const res = new EventEmitter();
        res.statusCode = 204;
        res.headers = {};
        res.resume = jest.fn();
        handler(res);
        res.emit('end');
      };
      return req;
    });

    const response = await fetchNoFollow('https://omshub.org/auth/callback');

    expect(response.headers.getSetCookie()).toEqual([]);
  });

  it('surfaces request errors from auth callback checks', async () => {
    jest.spyOn(https, 'request').mockImplementation((_target, _options, _handler) => {
      const req = new EventEmitter();
      req.destroy = (error) => req.emit('error', error);
      req.end = () => req.emit('error', new Error('socket closed'));
      return req;
    });

    await expect(runAuthCallbackChecks('https://omshub.org')).rejects.toThrow('socket closed');
  });

  it('surfaces request timeouts from auth callback checks', async () => {
    jest.spyOn(https, 'request').mockImplementation((_target, _options, _handler) => {
      const req = new EventEmitter();
      req.destroy = (error) => req.emit('error', error);
      req.end = () => req.emit('timeout');
      return req;
    });

    await expect(runAuthCallbackChecks('https://omshub.org')).rejects.toThrow(
      'Request timed out after 15000ms'
    );
  });
});
