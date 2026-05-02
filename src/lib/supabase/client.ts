import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Scope auth cookies (including PKCE code_verifier) to the registrable domain
// so they survive www <-> apex navigations on the canonical production host.
// Return undefined for all other environments so the browser uses host-only
// semantics (correct for localhost, Vercel preview URLs, and IP literals).
function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname;
  // localhost / IPs / Vercel preview domains — use host-only cookies
  if (
    host === 'localhost' ||
    /^\d+\.\d+\.\d+\.\d+$/.test(host) ||
    host.endsWith('.vercel.app')
  ) {
    return undefined;
  }
  // Strip leading subdomain (e.g. www.omshub.org -> omshub.org)
  const parts = host.split('.');
  return parts.length > 2 ? parts.slice(-2).join('.') : host;
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookieOptions: { domain: getCookieDomain() } }
  );
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (typeof window === 'undefined') {
    throw new Error('getClient() should only be called on the client side');
  }
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
