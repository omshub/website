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
 * Refs:
 *   - https://supabase.com/docs/guides/auth/server-side/nextjs (App Router)
 *   - https://nextjs.org/docs/app/api-reference/functions/cookies
 */

/**
 * Build the failure redirect for the home page. Encodes a machine-readable
 * `reason` so the next sign-in attempt is conclusive without needing logs —
 * `removeConsole: true` strips server-side console.error in prod.
 */
function failureRedirect(
  origin: string,
  reason:
    | 'no_code'
    | 'exchange_failed'
    | 'no_session'
    | 'no_pending_cookies'
    | 'oauth_error',
  extras?: Record<string, string>
) {
  const params = new URLSearchParams({ error: 'auth_callback_error', reason });
  if (extras) {
    for (const [k, v] of Object.entries(extras)) params.set(k, v);
  }
  return NextResponse.redirect(`${origin}/?${params}`);
}

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

  if (!code) {
    return failureRedirect(origin, 'no_code');
  }

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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // Full diagnostic dump, only when DEBUG_AUTH=1. `removeConsole` is
  // wired in next.config.js to preserve console.* when that flag is set,
  // so these lines survive `pnpm build && pnpm start` for local repro.
  if (process.env.DEBUG_AUTH === '1') {
    console.log('[auth/callback] exchange result', {
      error: error?.message,
      errorStatus: (error as { status?: number } | null)?.status,
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      pendingCookieCount: pendingCookies.length,
      pendingCookieNames: pendingCookies.map((c) => c.name),
      requestCookieNames: cookieStore.getAll().map((c) => c.name),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // Don't log full key — just enough to tell legacy anon vs sb_publishable_*
      publishableKeyPrefix: (
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''
      ).slice(0, 20),
      forwardedHost: request.headers.get('x-forwarded-host'),
      origin,
    });
  }

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
    return clearVerifierAndReturn(
      cookieStore,
      failureRedirect(origin, 'exchange_failed', {
        message: error.message.slice(0, 120),
      })
    );
  }

  if (!data?.session) {
    return clearVerifierAndReturn(
      cookieStore,
      failureRedirect(origin, 'no_session')
    );
  }

  if (pendingCookies.length === 0) {
    return clearVerifierAndReturn(
      cookieStore,
      failureRedirect(origin, 'no_pending_cookies')
    );
  }

  // Pick the correct redirect target. On Vercel, `origin` can be the
  // internal load-balancer host; prefer x-forwarded-host so the browser
  // lands on the same domain the Set-Cookie header was scoped to.
  // Respect x-forwarded-proto instead of hardcoding https — Next.js 16's
  // dev/start server populates x-forwarded-host as `localhost:PORT` with
  // `x-forwarded-proto: http`, and hardcoding https there causes
  // ERR_SSL_PROTOCOL_ERROR. On Vercel prod, x-forwarded-proto is always
  // `https`, so behavior is unchanged there.
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto =
    request.headers.get('x-forwarded-proto') ?? 'https';

  const redirectUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}${next}`
    : `${origin}${next}`;

  // Resolve the cookie domain from the public host so Set-Cookie attaches
  // to the domain the browser is on, not whatever internal Vercel host
  // answered the request.
  //
  // Dropping the `www.` prefix scopes the cookie to the registrable domain
  // (".omshub.org") so a session set on www.omshub.org is also valid on the
  // bare apex — eliminates the www-vs-apex drift that has repeatedly broken
  // this flow (#830, #832, #833, #835).
  //
  // Leave `domain` unset for localhost / IP literals — some browsers reject
  // `Domain=localhost`, and Host-only is the right scope for local dev anyway.
  const publicHost = (forwardedHost ?? new URL(origin).host).replace(/:\d+$/, '');
  const isLocalHost =
    publicHost === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(publicHost);
  const cookieDomain = isLocalHost ? undefined : publicHost.replace(/^www\./, '');

  const response = NextResponse.redirect(redirectUrl);
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, {
      ...(options as Parameters<typeof response.cookies.set>[2]),
      ...(cookieDomain ? { domain: cookieDomain } : {}),
    });
  }

  // Short-lived, non-HttpOnly diagnostic cookie. Client JS can read it to
  // confirm which branch ran, which host we redirected to, and how many
  // session cookies we attempted to set. Expires in 60s — purely diagnostic.
  const debugPayload = JSON.stringify({
    host: publicHost,
    usedForwardedHost: Boolean(forwardedHost),
    cookieDomain: cookieDomain ?? null,
    pendingCookieCount: pendingCookies.length,
    ts: Date.now(),
  });
  response.cookies.set('auth_debug', debugPayload, {
    path: '/',
    maxAge: 60,
    httpOnly: false,
    sameSite: 'lax',
    ...(cookieDomain ? { domain: cookieDomain } : {}),
  });

  return response;
}

function clearVerifierAndReturn(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  response: NextResponse
) {
  // Clear the PKCE verifier so the next attempt starts fresh.
  // Avoid clearing all sb-* cookies — a valid parallel session should survive.
  for (const c of cookieStore.getAll()) {
    if (c.name.endsWith('-auth-token-code-verifier')) {
      response.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
  return response;
}
