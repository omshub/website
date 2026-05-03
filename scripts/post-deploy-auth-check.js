#!/usr/bin/env node

const http = require('node:http');
const https = require('node:https');

const DEFAULT_TIMEOUT_MS = 15000;

function normalizeBaseUrl(value) {
  if (!value) throw new Error('Deployment URL is required');
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function isProductionHost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'omshub.org' || host === 'www.omshub.org';
}

function expectedLocation(baseUrl, pathAndSearch) {
  return `${baseUrl}${pathAndSearch}`;
}

async function fetchNoFollow(url, options = {}) {
  const target = new URL(url);
  const transport = target.protocol === 'http:' ? http : https;

  return await new Promise((resolve, reject) => {
    const req = transport.request(
      target,
      {
        method: options.method ?? 'GET',
        headers: options.headers,
        timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      },
      (res) => {
        res.resume();
        res.on('end', () => {
          const headers = {
            get(name) {
              const value = res.headers[name.toLowerCase()];
              return Array.isArray(value) ? value.join(', ') : (value ?? null);
            },
            getSetCookie() {
              const value = res.headers['set-cookie'];
              if (!value) return [];
              return Array.isArray(value) ? value : [value];
            },
          };

          resolve({
            status: res.statusCode,
            headers,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out after ${options.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    req.end();
  });
}

function describePlatformBlock(response, label) {
  if (response.status === 401 && response.headers.get('server') === 'Vercel') {
    return `${label}: Vercel Deployment Protection returned 401. Configure VERCEL_AUTOMATION_BYPASS_SECRET for post-deployment checks.`;
  }
  if (response.status === 429 && response.headers.get('x-vercel-mitigated')) {
    return `${label}: Vercel protection challenged the request with 429 (${response.headers.get('x-vercel-mitigated')}). Configure an automation bypass or allowlist this check.`;
  }
  return null;
}

function getSetCookie(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie().join(', ');
  }
  return response.headers.get('set-cookie') ?? '';
}

function assertRedirect(response, location, label) {
  const platformBlock = describePlatformBlock(response, label);
  if (platformBlock) throw new Error(platformBlock);

  if (![307, 308].includes(response.status)) {
    throw new Error(`${label}: expected 307/308 redirect, got ${response.status}`);
  }

  const actual = response.headers.get('location');
  if (actual !== location) {
    throw new Error(`${label}: expected Location ${location}, got ${actual}`);
  }
}

function assertRedirectStartsWith(response, locationPrefix, label) {
  const platformBlock = describePlatformBlock(response, label);
  if (platformBlock) throw new Error(platformBlock);

  if (![307, 308].includes(response.status)) {
    throw new Error(`${label}: expected 307/308 redirect, got ${response.status}`);
  }

  const actual = response.headers.get('location');
  if (!actual?.startsWith(locationPrefix)) {
    throw new Error(`${label}: expected Location to start with ${locationPrefix}, got ${actual}`);
  }
}

function assertVerifierCookieCleared(response, baseUrl, label) {
  const setCookie = getSetCookie(response);
  if (!setCookie.includes('sb-post-deploy-auth-token-code-verifier=')) {
    throw new Error(`${label}: expected verifier clear Set-Cookie header`);
  }
  if (!/Max-Age=0/i.test(setCookie)) {
    throw new Error(`${label}: expected verifier clear cookie to include Max-Age=0`);
  }

  const hostname = new URL(baseUrl).hostname;
  const hasProductionDomain = /Domain=omshub\.org/i.test(setCookie);
  if (isProductionHost(hostname) && !hasProductionDomain) {
    throw new Error(`${label}: expected production cookie clear to include Domain=omshub.org`);
  }
  if (!isProductionHost(hostname) && hasProductionDomain) {
    throw new Error(`${label}: preview cookie clear must remain host-only`);
  }
}

function protectionBypassHeaders() {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  return secret ? { 'x-vercel-protection-bypass': secret } : {};
}

async function runAuthCallbackChecks(inputUrl = process.env.DEPLOYMENT_URL) {
  const baseUrl = normalizeBaseUrl(inputUrl);
  const commonHeaders = protectionBypassHeaders();

  const providerError = await fetchNoFollow(
    `${baseUrl}/auth/callback?error=access_denied`,
    { headers: commonHeaders }
  );
  assertRedirect(
    providerError,
    expectedLocation(baseUrl, '/?error=access_denied'),
    'provider error callback'
  );

  const missingCode = await fetchNoFollow(`${baseUrl}/auth/callback`, {
    headers: {
      ...commonHeaders,
      cookie: 'sb-post-deploy-auth-token-code-verifier=verifier',
    },
  });
  assertRedirect(
    missingCode,
    expectedLocation(baseUrl, '/?error=auth_callback_error&reason=no_code'),
    'missing code callback'
  );
  assertVerifierCookieCleared(missingCode, baseUrl, 'missing code callback');

  const badCode = await fetchNoFollow(`${baseUrl}/auth/callback?code=post-deploy-check`, {
    headers: commonHeaders,
  });
  assertRedirectStartsWith(
    badCode,
    `${baseUrl}/?error=auth_callback_error&reason=exchange_failed`,
    'bad code callback'
  );

  return { baseUrl };
}

if (require.main === module) {
  runAuthCallbackChecks(process.argv[2])
    .then(({ baseUrl }) => {
      console.log(`Auth callback post-deployment checks passed for ${baseUrl}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}

module.exports = {
  assertRedirect,
  assertRedirectStartsWith,
  assertVerifierCookieCleared,
  describePlatformBlock,
  expectedLocation,
  getSetCookie,
  isProductionHost,
  normalizeBaseUrl,
  runAuthCallbackChecks,
};
