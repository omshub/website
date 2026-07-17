import {
  clearSupabaseAuthStorage,
  isSupabaseRefreshTokenRequest,
  makeRefreshRateLimitTerminal,
  shouldOpenSupabaseAuthCircuit,
  SUPABASE_AUTH_CIRCUIT_EVENT,
} from '@/lib/supabase/authCircuitBreaker';

const circuitBreakerFlag = '__omshubSupabaseAuthCircuitInstalled';
const instrumentedWindow = window as typeof window & {
  [circuitBreakerFlag]?: boolean;
};

if (!instrumentedWindow[circuitBreakerFlag]) {
  instrumentedWindow[circuitBreakerFlag] = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);

    if (shouldOpenSupabaseAuthCircuit(input, response.status)) {
      clearSupabaseAuthStorage();
      window.dispatchEvent(new Event(SUPABASE_AUTH_CIRCUIT_EVENT));
    }

    // Supabase auth-js retries refresh-token 429s within the same refresh tick.
    // Returning a terminal 400 only for this internal request ends that retry;
    // the real 429 has already been observed above and the stale session cleared.
    if (
      response.status === 429 &&
      isSupabaseRefreshTokenRequest(input)
    ) {
      return makeRefreshRateLimitTerminal(response);
    }

    return response;
  };
}
