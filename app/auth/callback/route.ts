import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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
      const response = NextResponse.redirect(`${origin}${next}`);
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
