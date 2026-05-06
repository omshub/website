const push = jest.fn();
const unsubscribe = jest.fn();
const notifySuccess = jest.fn();
const notifyError = jest.fn();
const signInWithOAuth = jest.fn();
const signInWithOtp = jest.fn();
const signOut = jest.fn();
const getSession = jest.fn();
let authCallback: ((event: string, session: any) => void) | undefined;
const setters: jest.Mock[] = [];

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/utils/notifications', () => ({
  notifySuccess: (...args: unknown[]) => notifySuccess(...args),
  notifyError: (...args: unknown[]) => notifyError(...args),
}));

jest.mock('@/lib/supabase/client', () => ({
  getClient: () => ({
    auth: {
      getSession,
      onAuthStateChange: (callback: typeof authCallback) => {
        authCallback = callback;
        return { data: { subscription: { unsubscribe } } };
      },
      signInWithOAuth,
      signInWithOtp,
      signOut,
    },
  }),
}));

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    useContext: jest.fn((context) => ({ context })),
    useEffect: (fn: () => void | (() => void)) => {
      const cleanup = fn();
      if (typeof cleanup === 'function') cleanup();
    },
    useRef: (value: unknown) => ({ current: value }),
    useState: (initial: unknown) => {
      const setter = jest.fn();
      setters.push(setter);
      return [typeof initial === 'function' ? (initial as () => unknown)() : initial, setter];
    },
  };
});

describe('context providers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setters.length = 0;
    authCallback = undefined;
    window.sessionStorage.clear();
    window.history.pushState({}, '', '/course/CS-6200');
    getSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'student@gatech.edu' } } },
      error: null,
    });
    signInWithOAuth.mockResolvedValue({ error: null });
    signInWithOtp.mockResolvedValue({ error: null });
    signOut.mockResolvedValue(undefined);
    global.fetch = jest.fn(async () => ({ ok: true })) as any;
  });

  it('stores return urls and exposes alert and menu handlers', async () => {
    const { getAndClearReturnUrl, storeReturnUrl } = await import('@/context/AuthContext');
    const { AlertContextProvider, useAlert } = await import('@/context/AlertContext');
    const { MenuContextProvider, useMenu } = await import('@/context/MenuContext');

    storeReturnUrl();
    expect(window.sessionStorage.getItem('authReturnTo')).toBe('/course/CS-6200');
    window.sessionStorage.setItem('authReturnTo', '//evil.test');
    expect(getAndClearReturnUrl()).toBe('/');

    const alertElement = AlertContextProvider({ children: 'alert child' } as any) as any;
    expect(alertElement.props.value).toHaveProperty('setAlert');
    expect(useAlert()).toHaveProperty('context');

    const menuElement = MenuContextProvider({ children: 'menu child' } as any) as any;
    menuElement.props.value.handleLoginOpen();
    menuElement.props.value.handleLoginClose();
    menuElement.props.value.handleProfileMenuOpen({ currentTarget: document.body });
    menuElement.props.value.handleProfileMenuClose();
    menuElement.props.value.handleMobileNavMenuOpen({ currentTarget: document.body });
    menuElement.props.value.handleMobileNavMenuClose();
    expect(useMenu()).toHaveProperty('context');
  });

  it('exercises auth provider sign-in, otp, logout, and auth events', async () => {
    const { AuthProvider, useAuth } = await import('@/context/AuthContext');
    const element = AuthProvider({ children: 'auth child' } as any) as any;
    const value = element.props.value;

    await value.signInWithProvider('google');
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    await expect(value.signInWithEmailOtp('student@gatech.edu')).resolves.toBe(true);
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Code Sent!' })
    );

    window.sessionStorage.setItem('authReturnTo', '/course/CS-6200');
    authCallback?.('SIGNED_IN', {
      user: { id: 'user-2', email: 'person@example.com', user_metadata: { full_name: 'Person' } },
    });
    expect(notifySuccess).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Welcome back!' })
    );
    expect(push).toHaveBeenCalledWith('/course/CS-6200');

    authCallback?.('SIGNED_OUT', null);
    expect(window.sessionStorage.getItem('authWelcomeShown')).toBeNull();

    await value.logout();
    expect(signOut).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith('/');
    expect(useAuth()).toHaveProperty('context');
  });

  it('reports auth errors and clears stale sessions', async () => {
    getSession.mockResolvedValueOnce({ data: { session: null }, error: new Error('stale') });
    signInWithOAuth.mockResolvedValueOnce({ error: new Error('oauth failed') });
    signInWithOtp.mockResolvedValueOnce({ error: new Error('otp failed') });

    const { AuthProvider } = await import('@/context/AuthContext');
    const element = AuthProvider({ children: null } as any) as any;

    await element.props.value.signInWithProvider('github');
    await expect(element.props.value.signInWithEmailOtp('student@example.com')).resolves.toBe(false);

    expect(global.fetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Sign in failed' }));
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Failed to send code' }));
  });

  it('handles rejected initial sessions and cleanup unsubscribe', async () => {
    getSession.mockRejectedValueOnce(new Error('broken local session'));

    const { AuthProvider } = await import('@/context/AuthContext');
    AuthProvider({ children: null } as any);

    await Promise.resolve();
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledWith('/auth/logout', { method: 'POST' });
    expect(unsubscribe).toHaveBeenCalled();
  });
});
