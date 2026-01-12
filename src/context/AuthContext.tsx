import { auth } from '@/lib/firebase/FirebaseConfig';
import { useAlert } from '@/context/AlertContext';
import {
  FirebaseAuthUser,
  TContextProviderProps,
  TSignInAction,
} from '@/context/types';
import { TNullable } from '@/lib/types';
import { isGTEmail, isOutlookEmail } from '@/lib/utilities';
import {
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GithubAuthProvider,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

type TAuthContext = {
  user: TNullable<FirebaseAuthUser>;
  loading: boolean;
  signInWithProvider: TSignInAction;
  signWithMagic: TSignInAction;
  logout: () => void;
};

// Storage keys
const EMAIL_FOR_SIGN_IN = 'emailForSignIn';
const RETURN_TO_KEY = 'authReturnTo';

// Helper to store return URL before auth
export const storeReturnUrl = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    // Don't store login-related paths
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
    // Validate it's an internal path
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
      return returnTo;
    }
  }
  return '/';
};

const AuthContext = createContext<TNullable<TAuthContext>>(null);

export const useAuth = () => useContext(AuthContext);

 
export const AuthContextProvider = ({ children }: TContextProviderProps) => {
  const [user, setUser] = useState<TNullable<FirebaseAuthUser>>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [previousUser, setPreviousUser] = useState<TNullable<FirebaseAuthUser>>(null);
  const { setAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(
      auth,
      (newUser: TNullable<FirebaseAuthUser>) => {
        // Check if this is a new sign-in (was null, now has user)
        const isNewSignIn = !previousUser && newUser;

        setPreviousUser(user);

        if (newUser) {
          setUser(newUser);
          setLoading(false);

          // Show welcome message and redirect on new sign-in
          if (isNewSignIn) {
            const displayName = newUser.displayName || newUser.email?.split('@')[0] || 'there';
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
        } else {
          setUser(null);
          setLoading(false);
        }
      },
    );
    // OAuth Providers
    const email = window.localStorage.getItem(EMAIL_FOR_SIGN_IN);

    if (isSignInWithEmailLink(auth, window.location.href) && !!email) {
      // Sign the user in
      signInWithEmailLink(auth, email, window.location.href);
    }

    // Remove all listeners from firebase when unmounting
    return () => unsubscribe();
  }, [previousUser, router, setAlert, user]);
  // Providers - lazy instantiate to reduce initial bundle impact
  const getProvider = (provider: string): [typeof GoogleAuthProvider | typeof GithubAuthProvider | typeof FacebookAuthProvider, GoogleAuthProvider | GithubAuthProvider | FacebookAuthProvider] => {
    switch (provider) {
      case 'Google':
        return [GoogleAuthProvider, new GoogleAuthProvider()];
      case 'Github':
        return [GithubAuthProvider, new GithubAuthProvider()];
      case 'Facebook':
        return [FacebookAuthProvider, new FacebookAuthProvider()];
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  };
  const logout = async () => {
    setUser(null);
    window.localStorage.removeItem(EMAIL_FOR_SIGN_IN);
    await signOut(auth);
    router.push('/');
  };
  const signWithMagic = (email: string) => {
    // If the user is re-entering their email address but already has a code
    sendSignInLinkToEmail(auth, email, {
      url: window.location.origin,
      handleCodeInApp: true,
    }).then(() => {
      // Save the users email to verify it after they access their email
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN, email);
      const additionalInstructions =
        isGTEmail(email) || isOutlookEmail(email)
          ? ' NOTE: gatech.edu or outlook.com domain may require release from Quarantine. See https://security.microsoft.com/quarantine'
          : '';
      const text = `A Magic Link was sent to ${email}! Check your spam folder just in-case.${additionalInstructions}`;
      setAlert({
        severity: 'success',
        text,
        variant: 'outlined',
      });
    });
  };
  const signInWithProvider = (provider: string) => {
    const [currentProvider, currentProviderAuth] = getProvider(provider);
    signInWithPopup(auth, currentProviderAuth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        currentProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        // The signed-in user info.
        // const user = result.user;
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        // const errorMessage = error.message;
        const email = error.customData.email;
        // The email of the user's account used.
        switch (errorCode) {
          case 'auth/account-exists-with-different-credential': {
            fetchSignInMethodsForEmail(auth, email).then(
              (providers: string[]) => {
                const providersArray = providers.map((provider: string) => {
                  const lowerCaseName = provider.split('.')[0];
                  const normalCaseName =
                    lowerCaseName.charAt(0).toUpperCase() +
                    lowerCaseName.slice(1).toLowerCase();
                  if (normalCaseName === 'Emaillink') {
                    return 'Email';
                  }
                  return normalCaseName;
                });

                setAlert({
                  severity: 'error',
                  text:
                    `You already have an account${
                      providersArray.length > 1 ? 's' : ''
                    } with the following sign-in method${
                      providersArray.length > 1 ? 's' : ''
                    }: ${providersArray.join(', ')}.` +
                    '\n' +
                    `Please login with ${
                      providersArray.length > 1
                        ? 'one of those methods'
                        : 'that method'
                    } to link the new OAuth method for future use.`,
                  variant: 'outlined',
                });
              },
            );
          }
        }
        // The credential that was used.
        currentProvider.credentialFromError(error);

        // ...
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithProvider, signWithMagic, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
