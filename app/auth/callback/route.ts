import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Sanitise the post-login redirect: must be a relative path to prevent
  // open-redirect attacks.
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') ? rawNext : '/';

  // GoTrue redirects here with error params when OAuth fails server-side.
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');
  if (oauthError) {
    const params = new URLSearchParams({
      error: oauthError,
      ...(oauthErrorDescription ? { error_description: oauthErrorDescription } : {}),
    });
    return NextResponse.redirect(`${origin}/?${params}`);
  }

  const cookieStore = await cookies();

  if (code) {
    // Capture cookies from setAll so we can explicitly stamp them onto the
    // redirect response. Next.js does NOT automatically propagate cookies()
    // mutations into a NextResponse.redirect() — omitting this step means the
    // browser never receives Set-Cookie headers and the session is lost.
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
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(
          name,
          value,
          options as Parameters<typeof response.cookies.set>[2]
        );
      });
      return response;
    }
  }

  // Return to home with error. Clear only the PKCE code_verifier cookie so the
  // next sign-in attempt starts with a fresh verifier. Avoid wiping the entire
  // session (all sb-* cookies) to prevent logging out a user who has a valid
  // session but hit a transient error during the exchange.
  const errorResponse = NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  cookieStore
    .getAll()
    .filter((c) => c.name.endsWith('-auth-token-code-verifier'))
    .forEach((c) =>
      errorResponse.cookies.set(c.name, '', { maxAge: 0, path: '/' })
    );
  return errorResponse;
}
