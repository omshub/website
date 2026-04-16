import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // GoTrue redirects here with error params when OAuth fails server-side
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');
  if (oauthError) {
    const params = new URLSearchParams({ error: oauthError, ...(oauthErrorDescription ? { error_description: oauthErrorDescription } : {}) });
    return NextResponse.redirect(`${origin}/?${params}`);
  }

  const cookieStore = await cookies();

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Handle cookie errors
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return to home with error. Clear only the PKCE code_verifier cookie so the
  // next sign-in attempt starts with a fresh verifier. We avoid wiping the
  // entire session (all sb-* cookies) to prevent logging out a user who has a
  // valid session but hit a transient Supabase error during the exchange.
  const errorResponse = NextResponse.redirect(`${origin}/?error=auth_callback_error`);
  cookieStore.getAll()
    .filter(c => c.name.endsWith('-auth-token-code-verifier'))
    .forEach(c => errorResponse.cookies.set(c.name, '', { maxAge: 0, path: '/' }));
  return errorResponse;
}
