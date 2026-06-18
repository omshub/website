import { NextResponse } from 'next/server';

export const PUBLIC_API_CACHE_CONTROL =
  'public, s-maxage=300, stale-while-revalidate=3600';

export function publicApiJson<T>(
  body: T,
  init?: ResponseInit
): NextResponse<T> {
  const response = NextResponse.json(body, init);
  response.headers.set('Cache-Control', PUBLIC_API_CACHE_CONTROL);
  return response;
}
