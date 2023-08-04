import { ReactNode } from 'react';
import { UserInfo } from 'firebase/auth';

export type TContextProviderProps = {
  children: ReactNode;
};

// eslint-disable-next-line no-unused-vars
export type TSignInAction = (loginEmail: string) => void;

// alias Firebase type `UserInfo` to avoid confusion with internal app data model `User`
export type FirebaseAuthUser = UserInfo;
