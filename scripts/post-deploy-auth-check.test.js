const {
  assertVerifierCookieCleared,
  describePlatformBlock,
  isAllowedDeploymentHost,
  isProductionHost,
  normalizeBaseUrl,
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
    expect(isAllowedDeploymentHost('website-git-branch-omshub.vercel.app')).toBe(true);
  });

  it('rejects untrusted deployment hosts before making auth callback requests', async () => {
    await expect(runAuthCallbackChecks('http://127.0.0.1:3000')).rejects.toThrow(
      'Unsupported deployment host'
    );
    await expect(runAuthCallbackChecks('https://example.com')).rejects.toThrow(
      'Unsupported deployment host'
    );
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
});
