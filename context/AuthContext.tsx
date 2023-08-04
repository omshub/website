import { auth } from '@backend/FirebaseConfig';
import { useAlert } from '@context/AlertContext';
import {
  FirebaseAuthUser,
  TContextProviderProps,
  TSignInAction,
} from '@context/types';
import { isGTEmail, isOutlookEmail } from '@globals/utilities';
import {
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GithubAuthProvider,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  OAuthProvider,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

type TAuthContext = {
  user: FirebaseAuthUser | null;
  signInWithProvider: TSignInAction;
  signWithMagic: TSignInAction;
  logout: () => void;
};

const AuthContext = createContext<TAuthContext | null>(null);

export const useAuth = () => useContext(AuthContext);

// eslint-disable-next-line no-undef
export const AuthContextProvider = ({ children }: TContextProviderProps) => {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null);
  const { setAlert } = useAlert();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user: FirebaseAuthUser | null) => {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
      },
    );
    // OAuth Providers
    const email = window.localStorage.getItem('emailForSignIn');

    if (isSignInWithEmailLink(auth, window.location.href) && !!email) {
      // Sign the user in
      signInWithEmailLink(auth, email, window.location.href);
    }

    // Remove all listeners from firebase when unmounting
    return () => unsubscribe();
  }, []);
  // Providers
  const providerMap: any = {
    Google: [GoogleAuthProvider, new GoogleAuthProvider()],
    Apple: [OAuthProvider, new OAuthProvider('apple.com')],
    Github: [GithubAuthProvider, new GithubAuthProvider()],
    Facebook: [GithubAuthProvider, new FacebookAuthProvider()],
  };
  const logout = async () => {
    setUser(null);
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
      window.localStorage.setItem('emailForSignIn', email);
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
    const [currentProvider, currentProviderAuth] = providerMap[provider];
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
      value={{ user, signInWithProvider, signWithMagic, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
