const mockCreateBrowserClient = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: (...args: unknown[]) => mockCreateBrowserClient(...args),
}));

describe('createClient()', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('keeps browser auth cookies host-only on the default test host', async () => {
    const { createClient, hasSupabaseBrowserConfig } = await import('../client');

    expect(hasSupabaseBrowserConfig()).toBe(true);
    createClient();

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'publishable-key',
      { cookieOptions: { domain: undefined } }
    );
  });

  it('reports missing browser config before constructing Supabase client', async () => {
    process.env = { ...originalEnv };
    const { hasSupabaseBrowserConfig } = await import('../client');

    expect(hasSupabaseBrowserConfig()).toBe(false);
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });

  it('rejects serialized undefined browser config placeholders', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'undefined',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'undefined',
    };
    const { createClient, hasSupabaseBrowserConfig } = await import('../client');

    expect(hasSupabaseBrowserConfig()).toBe(false);
    expect(() => createClient()).toThrow('Supabase browser client is not configured');
    expect(mockCreateBrowserClient).not.toHaveBeenCalled();
  });
});

describe('getClient()', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('memoizes the browser Supabase client', async () => {
    mockCreateBrowserClient.mockReturnValueOnce({ id: 'client' });

    const { getClient } = await import('../client');

    expect(getClient()).toEqual({ id: 'client' });
    expect(getClient()).toEqual({ id: 'client' });
    expect(mockCreateBrowserClient).toHaveBeenCalledTimes(1);
  });
});

describe('getCookieDomain()', () => {
  it('keeps cookies host-only on unknown custom domains', async () => {
    const { getCookieDomain } = await import('../client');

    expect(getCookieDomain('staging.example.com')).toBeUndefined();
  });

  it('scopes cookies to omshub.org on canonical production hosts', async () => {
    const { getCookieDomain } = await import('../client');

    expect(getCookieDomain('omshub.org')).toBe('omshub.org');
    expect(getCookieDomain('www.omshub.org')).toBe('omshub.org');
  });

  it('treats production browser host casing case-insensitively', async () => {
    const { getCookieDomain } = await import('../client');

    expect(getCookieDomain('WWW.OMSHUB.ORG')).toBe('omshub.org');
  });
});
