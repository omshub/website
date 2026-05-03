import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function isSupabaseAuthCookie(name: string) {
  return /^sb-.+-(?:auth-token(?:\.\d+)?|auth-token-code-verifier)$/.test(name);
}

function getProductionCookieDomain(request: Request) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const normalizedHost = host?.split(',')[0]?.trim().split(':')[0].toLowerCase();
  if (normalizedHost === 'omshub.org' || normalizedHost === 'www.omshub.org') {
    return 'omshub.org';
  }
  return undefined;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const response = NextResponse.json({ ok: true });
  const domain = getProductionCookieDomain(request);

  for (const cookie of cookieStore.getAll()) {
    if (!isSupabaseAuthCookie(cookie.name)) continue;

    response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
    if (domain) {
      response.cookies.set(cookie.name, '', { domain, maxAge: 0, path: '/' });
    }
  }

  return response;
}
