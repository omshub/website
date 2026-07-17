import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

type AuthenticatedClaims = {
  userId: string;
  email?: string;
};

/**
 * Verify the current access token without a per-request Auth API call.
 *
 * OMSHub uses an asymmetric Supabase signing key, so getClaims() verifies the
 * token against the cached JWKS instead of calling /auth/v1/user like
 * getUser(). Database RLS remains the final authorization boundary.
 */
export async function getAuthenticatedClaims(
  supabase: SupabaseClient<Database>
): Promise<AuthenticatedClaims | null> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== 'string' || !userId) return null;

  const email = data.claims.email;
  return {
    userId,
    ...(typeof email === 'string' ? { email } : {}),
  };
}
