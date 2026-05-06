/**
 * @jest-environment node
 */

const mockCreateBrowserClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

describe('getClient() on the server', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('throws when used outside the browser', async () => {
    const { getClient, getCookieDomain } = await import('../client');

    expect(getCookieDomain()).toBeUndefined();
    expect(() => getClient()).toThrow('getClient() should only be called on the client side');
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });
});
