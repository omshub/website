import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link callback.
 *
 * Follows the canonical @supabase/ssr Next.js App Router pattern:
 *   - `createClient()` from `@/lib/supabase/server` handles `setAll` by
 *     writing cookies through `cookies().set(...)`, and Next.js propagates
 *     those onto the outgoing response automatically.
 *   - `x-forwarded-host` is honoured so that on Vercel (where
 *     `new URL(request.url).origin` can resolve to an internal host) the
 *     redirect target matches the domain the session cookies were set on.
 *     Without this branch the browser lands on a different origin than the
 *     one Set-Cookie was scoped to, and the session appears "lost".
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

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // On Vercel, `origin` can be the internal load-balancer host rather
      // than the public domain the user is actually on. Redirecting to the
      // wrong origin cross-domains the browser away from where
      // @supabase/ssr just stamped the session cookies, so the session
      // appears to be dropped. Prefer x-forwarded-host in production.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // Single diagnostic param so we can confirm the x-forwarded-host branch
      // is what's actually running in production. Safe to remove once the
      // auth flow is confirmed working.
      const diag = new URLSearchParams({ _fh: forwardedHost ?? '' });
      const sep = next.includes('?') ? '&' : '?';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}${sep}${diag}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}${sep}${diag}`);
      } else {
        return NextResponse.redirect(`${origin}${next}${sep}${diag}`);
      }
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
  }

  // Clear the PKCE verifier so the next attempt starts fresh.
  // Avoid clearing all sb-* cookies — a valid parallel session should survive.
  const cookieStore = await cookies();
  const errorResponse = NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  for (const c of cookieStore.getAll()) {
    if (c.name.endsWith('-auth-token-code-verifier')) {
      errorResponse.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
  return errorResponse;
}
