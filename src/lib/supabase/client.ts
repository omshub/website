import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Scope auth cookies (including PKCE code_verifier) to the registrable domain
// so they survive www <-> apex navigations on the canonical production host.
// Return undefined for all other environments so the browser uses host-only
// semantics (correct for localhost, Vercel preview URLs, and IP literals).
export function getCookieDomain(hostname?: string): string | undefined {
  if (typeof window === 'undefined' && !hostname) return undefined;
  const host = (hostname ?? window.location.hostname).toLowerCase();
  if (host === 'omshub.org' || host === 'www.omshub.org') {
    return 'omshub.org';
  }
  return undefined;
}

export function hasSupabaseBrowserConfig() {
  return getSupabaseBrowserConfig() !== null;
}

function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (
    !url ||
    !publishableKey ||
    url === 'undefined' ||
    publishableKey === 'undefined' ||
    !/^https?:\/\//.test(url)
  ) {
    return null;
  }

  return { publishableKey, url };
}

export function createClient() {
  const config = getSupabaseBrowserConfig();
  if (!config) {
    throw new Error('Supabase browser client is not configured');
  }

  return createBrowserClient<Database>(
    config.url,
    config.publishableKey,
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
