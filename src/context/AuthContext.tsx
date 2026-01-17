'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getClient } from '@/lib/supabase/client';
import { useAlert } from '@/context/AlertContext';
import { useRouter } from 'next/navigation';
import type { User, Session } from '@supabase/supabase-js';
import type { TContextProviderProps } from '@/context/types';
import type { TNullable } from '@/lib/types';

type TAuthContext = {
  user: TNullable<User>;
  session: TNullable<Session>;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Storage keys
const RETURN_TO_KEY = 'authReturnTo';

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
  const [previousUser, setPreviousUser] = useState<TNullable<User>>(null);
  const { setAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    const supabase = getClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUser = session?.user ?? null;
      const isNewSignIn = !previousUser && newUser;

      setPreviousUser(user);
      setSession(session);
      setUser(newUser);
      setLoading(false);

      // Show welcome message on new sign-in
      if (isNewSignIn && newUser) {
        const displayName =
          newUser.user_metadata?.full_name ||
          newUser.email?.split('@')[0] ||
          'there';
        setAlert({
          severity: 'success',
          text: `Welcome back, ${displayName}!`,
          variant: 'outlined',
        });

        // Smart redirect
        const returnTo = getAndClearReturnUrl();
        if (returnTo !== '/') {
          router.push(returnTo);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [previousUser, router, setAlert, user]);

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
      setAlert({
        severity: 'error',
        text: error.message,
        variant: 'outlined',
      });
    }
  };

  const signInWithMagicLink = async (email: string) => {
    const supabase = getClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setAlert({
        severity: 'error',
        text: error.message,
        variant: 'outlined',
      });
      return;
    }

    const isGTEmail = email.endsWith('@gatech.edu');
    const isOutlookEmail = email.endsWith('@outlook.com');
    const additionalInstructions =
      isGTEmail || isOutlookEmail
        ? ' NOTE: gatech.edu or outlook.com domain may require release from Quarantine. See https://security.microsoft.com/quarantine'
        : '';

    setAlert({
      severity: 'success',
      text: `A Magic Link was sent to ${email}! Check your spam folder just in-case.${additionalInstructions}`,
      variant: 'outlined',
    });
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
