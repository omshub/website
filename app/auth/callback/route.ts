import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / magic-link callback.
 *
 * Uses Next.js's `redirect()` from `next/navigation` instead of
 * `NextResponse.redirect(...)` so that cookie mutations performed by
 * @supabase/ssr via `cookies().set(...)` inside `createClient()` are
 * automatically attached to the redirect response.
 *
 * Why this matters:
 *   `NextResponse.redirect(...)` returns a standalone response object that
 *   Next.js forwards as-is — the pending cookie-mutation buffer from
 *   `cookies().set()` is not merged onto it. `redirect()` instead throws
 *   NEXT_REDIRECT which the framework catches and converts to a redirect
 *   response that DOES inherit the cookie mutations. This is the pattern
 *   Supabase uses in their canonical `/auth/confirm` example and is the
 *   one constraint that fixes the "Set-Cookie never reaches the browser"
 *   class of failures on Vercel.
 *
 * `x-forwarded-host` is honoured so that on Vercel (where
 * `new URL(request.url).origin` can resolve to an internal host) the
 * redirect target matches the domain the session cookies were set on.
 *
 * Refs:
 *   - https://supabase.com/docs/guides/auth/server-side/nextjs (App Router)
 *   - https://nextjs.org/docs/app/api-reference/functions/redirect
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
    redirect(`${origin}/?${params}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // On Vercel, `origin` can be the internal load-balancer host rather
      // than the public domain. Redirecting to the wrong origin cross-
      // domains the browser away from where @supabase/ssr stamped the
      // session cookies. Prefer x-forwarded-host in production.
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      // Single diagnostic param so we can confirm which branch ran in
      // production. Safe to remove once the auth flow is confirmed working.
      const diag = new URLSearchParams({ _fh: forwardedHost ?? '' });
      const sep = next.includes('?') ? '&' : '?';

      if (isLocalEnv) {
        redirect(`${origin}${next}${sep}${diag}`);
      } else if (forwardedHost) {
        redirect(`https://${forwardedHost}${next}${sep}${diag}`);
      } else {
        redirect(`${origin}${next}${sep}${diag}`);
      }
    }

    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
  }

  // Clear the PKCE verifier so the next attempt starts fresh.
  // Avoid clearing all sb-* cookies — a valid parallel session should survive.
  const cookieStore = await cookies();
  for (const c of cookieStore.getAll()) {
    if (c.name.endsWith('-auth-token-code-verifier')) {
      cookieStore.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
  redirect(`${origin}/?error=auth_callback_error`);
}
