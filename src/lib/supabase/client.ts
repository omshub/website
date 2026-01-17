import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
