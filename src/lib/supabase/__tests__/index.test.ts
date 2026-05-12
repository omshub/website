/**
 * @jest-environment node
 */

import * as supabaseExports from '../index';

describe('Supabase module exports', () => {
  it('re-exports Supabase helpers', () => {
    expect(supabaseExports).toHaveProperty('createBrowserClient');
    expect(supabaseExports.createBrowserClient).toEqual(expect.any(Function));
    expect(supabaseExports.getClient).toEqual(expect.any(Function));
    expect(supabaseExports).toHaveProperty('createServerClient');
    expect(supabaseExports).toHaveProperty('updateSession');
    expect(supabaseExports).toHaveProperty('mapSupabaseReviewToReview');
    expect(supabaseExports).toHaveProperty('mapSupabaseReviewsToArray');
  });
});
