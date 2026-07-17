export const SUPABASE_AUTH_CIRCUIT_EVENT = 'omshub:supabase-restricted';

function getRequestUrl(input: RequestInfo | URL) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  return input.url;
}

function isSupabaseRequest(input: RequestInfo | URL) {
  try {
    return new URL(getRequestUrl(input)).hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export function isSupabaseRefreshTokenRequest(input: RequestInfo | URL) {
  try {
    const url = new URL(getRequestUrl(input));
    return (
      url.hostname.endsWith('.supabase.co') &&
      url.pathname.endsWith('/auth/v1/token') &&
      url.searchParams.get('grant_type') === 'refresh_token'
    );
  } catch {
    return false;
  }
}

export function shouldOpenSupabaseAuthCircuit(
  input: RequestInfo | URL,
  status: number
) {
  if (status === 402) return isSupabaseRequest(input);
  return (
    isSupabaseRefreshTokenRequest(input) &&
    [400, 401, 403, 429].includes(status)
  );
}

export function getSupabaseAuthStorageKey(
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
) {
  if (!supabaseUrl) return null;

  try {
    const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

export function clearSupabaseAuthStorage() {
  if (typeof window === 'undefined') return;

  const storageKey = getSupabaseAuthStorageKey();
  if (!storageKey) return;

  // @supabase/ssr can split a session across several cookies. Remove the base
  // cookie and every chunk so a stale single-use refresh token cannot restart
  // the loop on reload or in another open tab.
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (
      name === storageKey ||
      name?.startsWith(`${storageKey}.`) ||
      name === `${storageKey}-code-verifier`
    ) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    }
  });

  // Older client versions may have persisted the same session locally.
  try {
    window.localStorage.removeItem(storageKey);
    window.localStorage.removeItem(`${storageKey}-code-verifier`);
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function makeRefreshRateLimitTerminal(response: Response) {
  return new Response(response.body, {
    status: 400,
    statusText: 'Bad Request',
    headers: response.headers,
  });
}
