/**
 * @jest-environment node
 */

const mockCreateServerClient = jest.fn();
const mockCookieStore = {
  getAll: jest.fn(),
  set: jest.fn(),
};
const mockCookies = jest.fn();

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

jest.mock('next/headers', () => ({
  cookies: (...args: unknown[]) => mockCookies(...args),
}));

describe('server Supabase client', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'publishable-key',
    };
    mockCookieStore.getAll.mockReturnValue([{ name: 'a', value: '1' }]);
    mockCookies.mockResolvedValue(mockCookieStore);
    mockCreateServerClient.mockReturnValue({ id: 'server-client' });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates an SSR client wired to Next cookies', async () => {
    const { createClient } = await import('../server');

    await expect(createClient()).resolves.toEqual({ id: 'server-client' });
    const options = mockCreateServerClient.mock.calls[0][2];

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'publishable-key',
      expect.any(Object)
    );
    expect(options.cookies.getAll()).toEqual([{ name: 'a', value: '1' }]);
    options.cookies.setAll([{ name: 'b', value: '2', options: { path: '/' } }]);
    expect(mockCookieStore.set).toHaveBeenCalledWith('b', '2', { path: '/' });
  });

  it('ignores cookie writes when called from a read-only server component context', async () => {
    mockCookieStore.set.mockImplementationOnce(() => {
      throw new Error('read only');
    });

    const { createClient } = await import('../server');
    await createClient();
    const options = mockCreateServerClient.mock.calls[0][2];

    expect(() =>
      options.cookies.setAll([{ name: 'b', value: '2', options: { path: '/' } }])
    ).not.toThrow();
  });
});
