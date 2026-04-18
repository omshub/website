import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * OAuth / magic-link callback.
 *
 * Combines two independent fixes so the session survives the redirect on
 * Vercel:
 *
 *   1. Manual cookie stamping. `cookies().set(...)` mutations do NOT
 *      propagate onto a `NextResponse.redirect(...)` response automatically
 *      in a Route Handler, so we buffer whatever @supabase/ssr wants to
 *      write during `exchangeCodeForSession` into `pendingCookies`, then
 *      stamp each one onto the response we actually return.
 *
 *   2. x-forwarded-host redirect target. On Vercel, `new URL(request.url).origin`
 *      can resolve to an internal load-balancer host rather than the public
 *      domain the user is on. If we redirect to the wrong origin, the
 *      browser lands on a different domain than the one `Set-Cookie` was
 *      scoped to and the session appears "lost". Prefer `x-forwarded-host`
 *      in production.
 *
 * A single diagnostic query param (`_fh`) is appended to the redirect so we
 * can confirm from the landed URL which redirect branch actually ran in
 * production. Safe to remove once the auth flow is confirmed working.
 *
 * Refs:
 *   - https://supabase.com/docs/guides/auth/server-side/nextjs (App Router)
 *   - https://nextjs.org/docs/app/api-reference/functions/cookies
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Reject non-relative paths (including //host bypasses) to prevent open-redirect.
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  // GoTrue redirects here with error params when OAuth fails server-side.
  const oauthError = searchParams.get('error');
  if (oauthError) {
    const params = new URLSearchParams({ error: oauthError });
    const desc = searchParams.get('error_description');
    if (desc) params.set('error_description', desc);
    return NextResponse.redirect(`${origin}/?${params}`);
  }

  // cookieStore is needed for both the success and error paths below.
  const cookieStore = await cookies();

  if (code) {
    // Buffer cookies from setAll() so we can explicitly stamp them onto the
    // redirect response. Next.js does not propagate cookies() mutations into
    // NextResponse.redirect() automatically — omitting this loses the session.
    const pendingCookies: Array<{
      name: string;
      value: string;
      options: Record<string, unknown>;
    }> = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Pick the correct redirect target. On Vercel, `origin` can be the
      // internal load-balancer host; prefer x-forwarded-host so the browser
      // lands on the same domain the Set-Cookie header was scoped to.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // Single diagnostic param so we can confirm which redirect branch
      // actually ran in production. Safe to remove once auth is verified.
      const diag = new URLSearchParams({ _fh: forwardedHost ?? '' });
      const sep = next.includes('?') ? '&' : '?';

      const redirectUrl =
        isLocalEnv || !forwardedHost
          ? `${origin}${next}${sep}${diag}`
          : `https://${forwardedHost}${next}${sep}${diag}`;

      const response = NextResponse.redirect(redirectUrl);
      for (const { name, value, options } of pendingCookies) {
        response.cookies.set(
          name,
          value,
          options as Parameters<typeof response.cookies.set>[2]
        );
      }
      return response;
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
  }

  // Clear the PKCE verifier so the next attempt starts fresh.
  // Avoid clearing all sb-* cookies — a valid parallel session should survive.
  const errorResponse = NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  for (const c of cookieStore.getAll()) {
    if (c.name.endsWith('-auth-token-code-verifier')) {
      errorResponse.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
  return errorResponse;
}
