import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function isAuthTokenCookie(name: string) {
  return /^sb-.+-auth-token(?:\.\d+)?$/.test(name);
}

function shouldRefreshSession(request: NextRequest) {
  const pathname = request.nextUrl?.pathname ?? '/';
  if (pathname.startsWith('/api/')) return false;
  if (request.headers.get('next-router-prefetch')) return false;
  if (request.headers.get('purpose') === 'prefetch') return false;
  return true;
}

function shouldClearAuthCookies(error: unknown) {
  if (!error) return false;
  const status = (error as { status?: number }).status;
  const message = String((error as { message?: string }).message ?? '');
  return (
    status === 429 ||
    /invalid refresh token/i.test(message) ||
    /refresh token not found/i.test(message)
  );
}

function clearAuthTokenCookies(request: NextRequest, response: NextResponse) {
  request.cookies
    .getAll()
    .filter((cookie) => isAuthTokenCookie(cookie.name))
    .forEach((cookie) => {
      request.cookies.set(cookie.name, '');
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
    });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
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
  if (hasSession && shouldRefreshSession(request)) {
    const { error } = await supabase.auth.getUser();
    if (shouldClearAuthCookies(error)) {
      clearAuthTokenCookies(request, supabaseResponse);
    }
  }

  return supabaseResponse;
}
