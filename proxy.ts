import { updateSession } from '@/lib/supabase/proxy';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Static files and images
     * - /auth/callback: must be excluded so the proxy doesn't clear the PKCE
     *   code_verifier cookie before exchangeCodeForSession() can read it.
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
