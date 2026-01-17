import { ReactNode } from 'react';

export type TContextProviderProps = {
  children: ReactNode;
};

export type TSignInAction = (loginEmail: string) => void;
