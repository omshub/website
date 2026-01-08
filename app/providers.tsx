'use client';

import React from 'react';
import { AlertBar } from '@components/AlertBar';
import { AlertContextProvider } from '@context/AlertContext';
import { AuthContextProvider } from '@context/AuthContext';
import { MenuContextProvider } from '@context/MenuContext';
import { NavBar } from '@src/components/NavBar';
import ThemeRegistry from './theme/ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AlertContextProvider>
        <AuthContextProvider>
          <MenuContextProvider>
            <NavBar />
            <AlertBar />
          </MenuContextProvider>
          {children}
        </AuthContextProvider>
      </AlertContextProvider>
    </ThemeRegistry>
  );
}
