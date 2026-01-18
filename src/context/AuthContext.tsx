'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { getClient } from '@/lib/supabase/client';
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
  signInWithMagicLink: (email: string) => Promise<boolean>;
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
const getAndClearReturnUrl = (): string => {
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
    const supabase = getClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      previousUserRef.current = session?.user ?? null;
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
    const supabase = getClient();
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

  const signInWithMagicLink = async (email: string): Promise<boolean> => {
    const supabase = getClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      notifyError({
        title: 'Magic link failed',
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
      title: 'Magic Link Sent!',
      message: `Check your inbox at ${email}.${additionalInstructions}`,
      autoClose: 8000,
    });
    return true;
  };

  const logout = async () => {
    const supabase = getClient();
    await supabase.auth.signOut();
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
        signInWithMagicLink,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
