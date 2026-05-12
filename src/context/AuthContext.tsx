'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { notifySuccess, notifyError } from '@/utils/notifications';
import type { User, Session } from '@supabase/supabase-js';
import type { TContextProviderProps } from '@/context/types';
import type { TNullable } from '@/lib/types';

type TAuthContext = {
  user: TNullable<User>;
  session: TNullable<Session>;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signInWithEmailOtp: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

// Storage keys
const RETURN_TO_KEY = 'authReturnTo';
const WELCOME_SHOWN_KEY = 'authWelcomeShown';

// Helper to store return URL before auth
export const storeReturnUrl = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login' && currentPath !== '/') {
      sessionStorage.setItem(RETURN_TO_KEY, currentPath);
    }
  }
};

// Helper to get and clear return URL
export const getAndClearReturnUrl = (): string => {
  if (typeof window !== 'undefined') {
    const returnTo = sessionStorage.getItem(RETURN_TO_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      return returnTo;
    }
  }
  return '/';
};

const AuthContext = createContext<TNullable<TAuthContext>>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: TContextProviderProps) => {
  const [user, setUser] = useState<TNullable<User>>(null);
  const [session, setSession] = useState<TNullable<Session>>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Use refs to track state for the subscription callback without causing re-subscriptions
  const previousUserRef = useRef<TNullable<User>>(null);
  const routerRef = useRef(router);

  // Keep refs up to date
  routerRef.current = router;

  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) {
      setSession(null);
      setUser(null);
      previousUserRef.current = null;
      setLoading(false);
      return;
    }

    let supabase: ReturnType<typeof getClient>;
    try {
      supabase = getClient();
    } catch {
      setSession(null);
      setUser(null);
      previousUserRef.current = null;
      setLoading(false);
      return;
    }

    // Get initial session. If local auth state is corrupt/stale, fail closed
    // to anonymous and ask the server cleanup route to expire any leftover
    // Supabase cookies rather than leaving the app permanently "loading".
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          void fetch('/auth/logout', { method: 'POST' }).catch(() => {});
        }
        const safeSession = error ? null : session;
        setSession(safeSession);
        setUser(safeSession?.user ?? null);
        previousUserRef.current = safeSession?.user ?? null;
      })
      .catch(() => {
        void fetch('/auth/logout', { method: 'POST' }).catch(() => {});
        setSession(null);
        setUser(null);
        previousUserRef.current = null;
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes - subscription should only be created once
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;

      // Update refs and state
      previousUserRef.current = newUser;
      setSession(session);
      setUser(newUser);
      setLoading(false);

      // Show welcome message only on actual sign-in, not on page load/refresh
      // SIGNED_IN fires when user actively signs in (OAuth, magic link, OTP)
      // INITIAL_SESSION fires on page load with existing session - don't show notification
      // Use sessionStorage to ensure notification only shows once per browser session
      if (event === 'SIGNED_IN' && newUser) {
        const welcomeShown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
        if (!welcomeShown) {
          const displayName =
            newUser.user_metadata?.full_name ||
            newUser.email?.split('@')[0] ||
            'there';
          notifySuccess({
            title: 'Welcome back!',
            message: `Signed in as ${displayName}`,
          });
          sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
        }

        // Smart redirect
        const returnTo = getAndClearReturnUrl();
        if (returnTo !== '/') {
          routerRef.current.push(returnTo);
        }
      }

      // Clear welcome flag on sign out so it shows again on next sign-in
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem(WELCOME_SHOWN_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array - subscription should only be created once

  const signInWithProvider = async (
    provider: 'google' | 'github'
  ) => {
    if (!hasSupabaseBrowserConfig()) {
      notifyError({
        title: 'Sign in unavailable',
        message: 'Authentication is not configured for this deployment.',
      });
      return;
    }

    let supabase: ReturnType<typeof getClient>;
    try {
      supabase = getClient();
    } catch {
      notifyError({
        title: 'Sign in unavailable',
        message: 'Authentication is not configured for this deployment.',
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      notifyError({
        title: 'Sign in failed',
        message: error.message,
      });
    }
  };

  const signInWithEmailOtp = async (email: string): Promise<boolean> => {
    if (!hasSupabaseBrowserConfig()) {
      notifyError({
        title: 'Sign in unavailable',
        message: 'Authentication is not configured for this deployment.',
      });
      return false;
    }

    let supabase: ReturnType<typeof getClient>;
    try {
      supabase = getClient();
    } catch {
      notifyError({
        title: 'Sign in unavailable',
        message: 'Authentication is not configured for this deployment.',
      });
      return false;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      notifyError({
        title: 'Failed to send code',
        message: error.message,
      });
      return false;
    }

    const isGTEmail = email.endsWith('@gatech.edu');
    const isOutlookEmail = email.endsWith('@outlook.com');
    const additionalInstructions =
      isGTEmail || isOutlookEmail
        ? ' NOTE: gatech.edu or outlook.com may require release from Quarantine. See https://security.microsoft.com/quarantine'
        : '';

    notifySuccess({
      title: 'Code Sent!',
      message: `Check your inbox at ${email}.${additionalInstructions}`,
      autoClose: 8000,
    });
    return true;
  };

  const logout = async () => {
    let supabase: ReturnType<typeof getClient> | null = null;
    if (hasSupabaseBrowserConfig()) {
      try {
        supabase = getClient();
      } catch {
        // Auth is unavailable in this deployment; still clear local app state.
      }
    }

    try {
      await supabase?.auth.signOut();
    } finally {
      await fetch('/auth/logout', { method: 'POST' }).catch(() => {});
    }
    setUser(null);
    setSession(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithProvider,
        signInWithEmailOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
