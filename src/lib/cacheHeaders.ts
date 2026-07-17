import { NextResponse } from 'next/server';

// Let browsers absorb quick repeat visits while Vercel serves shared responses
// from its CDN. This reduces Function invocations without creating a long-lived
// stale browser cache.
export const PUBLIC_API_CACHE_CONTROL =
  'public, max-age=120, stale-while-revalidate=300';
export const VERCEL_PUBLIC_API_CACHE_CONTROL =
  'public, s-maxage=900, stale-while-revalidate=21600';

export function publicApiJson<T>(body: T, init?: { status?: number }) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', PUBLIC_API_CACHE_CONTROL);
  response.headers.set(
    'Vercel-CDN-Cache-Control',
    VERCEL_PUBLIC_API_CACHE_CONTROL
  );
  return response;
}

export function uncachedApiJson<T>(body: T, init?: { status?: number }) {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
