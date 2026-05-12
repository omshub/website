import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isAuthTokenCookie(name: string) {
  return /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

function shouldClearAuthCookies(error: unknown) {
  if (!error) return false;
  const message = String((error as { message?: string }).message ?? '');
  return (
    /invalid refresh token/i.test(message) ||
    /refresh token not found/i.test(message)
  );
}

function getProductionCookieDomain(request: NextRequest) {
  const host = (
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  )?.split(',')[0]?.trim().split(':')[0].toLowerCase();
  if (host === 'omshub.org' || host === 'www.omshub.org') {
    return 'omshub.org';
  }
  return undefined;
}

function clearAuthTokenCookies(request: NextRequest, response: NextResponse) {
  const domain = getProductionCookieDomain(request);

  request.cookies
    .getAll()
    .filter((cookie) => isAuthTokenCookie(cookie.name))
    .forEach((cookie) => {
      request.cookies.set(cookie.name, '');
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
      if (domain) {
        response.cookies.set(cookie.name, '', { domain, maxAge: 0, path: '/' });
      }
    });
}

function getSupabaseProxyConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { publishableKey, url };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseConfig = getSupabaseProxyConfig();
  if (!supabaseConfig) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseConfig.url,
    supabaseConfig.publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Only refresh session when a session cookie is present — avoids an
  // unconditional auth-service round-trip for anonymous/unauthenticated requests.
  // Matches sb-{projectRef}-auth-token and chunked variants (e.g. .0, .1),
  // but not the PKCE code_verifier cookie.
  const hasSession = request.cookies.getAll().some((c) => isAuthTokenCookie(c.name));
  if (hasSession) {
    try {
      const { error } = await supabase.auth.getUser();
      if (shouldClearAuthCookies(error)) {
        clearAuthTokenCookies(request, supabaseResponse);
      }
    } catch (error) {
      if (shouldClearAuthCookies(error)) {
        clearAuthTokenCookies(request, supabaseResponse);
      } else {
        throw error;
      }
    }
  }

  return supabaseResponse;
}
