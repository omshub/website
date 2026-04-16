import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
  const hasSession = request.cookies.getAll().some(
    c => /^sb-.+-auth-token/.test(c.name) && !c.name.endsWith('-code-verifier')
  );
  if (hasSession) {
    await supabase.auth.getUser();
  }

  return supabaseResponse;
}
