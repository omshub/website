import type { SupabaseClient } from '@supabase/supabase-js';
import { getAuthenticatedClaims } from '../auth';
import type { Database } from '../database.types';

function mockClient(result: unknown) {
  return {
    auth: {
      getClaims: jest.fn().mockResolvedValue(result),
    },
  } as unknown as SupabaseClient<Database>;
}

describe('getAuthenticatedClaims()', () => {
  it('returns the verified user id and email', async () => {
    const result = await getAuthenticatedClaims(
      mockClient({
        data: { claims: { sub: 'user-123', email: 'student@gatech.edu' } },
        error: null,
      })
    );

    expect(result).toEqual({
      userId: 'user-123',
      email: 'student@gatech.edu',
    });
  });

  it('rejects errors and claims without a subject', async () => {
    await expect(
      getAuthenticatedClaims(mockClient({ data: null, error: new Error('bad token') }))
    ).resolves.toBeNull();
    await expect(
      getAuthenticatedClaims(mockClient({ data: { claims: {} }, error: null }))
    ).resolves.toBeNull();
  });
});
