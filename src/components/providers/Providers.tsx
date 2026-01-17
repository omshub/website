'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AlertContextProvider } from '@/context/AlertContext';
import { AuthProvider } from '@/context/AuthContext';
import { MenuContextProvider } from '@/context/MenuContext';
import { NavBarMantine } from '@/components/NavBarMantine';
import Footer from '@/components/Footer';
import AutoBreadcrumbs from '@/components/AutoBreadcrumbs';
import MantineThemeProvider from './MantineProvider';
import { useMenu } from '@/context/MenuContext';

// Lazy load non-critical components to improve initial load time
const SpotlightSearch = dynamic(() => import('@/components/SpotlightSearch'), {
  ssr: false,
});
const LoginDrawer = dynamic(() => import('@/components/LoginDrawer'), {
  ssr: false,
});

function LoginDrawerWrapper() {
  const { loginOpen, handleLoginClose } = useMenu();
  return (
    <Suspense fallback={null}>
      <LoginDrawer opened={loginOpen} onClose={handleLoginClose} />
    </Suspense>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineThemeProvider>
      <AlertContextProvider>
        <AuthProvider>
          <MenuContextProvider>
            <NavBarMantine />
            <AutoBreadcrumbs />
            <Suspense fallback={null}>
              <SpotlightSearch />
            </Suspense>
            <LoginDrawerWrapper />
          </MenuContextProvider>
          <main style={{ minHeight: 'calc(100vh - 200px)' }}>
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </AlertContextProvider>
    </MantineThemeProvider>
  );
}
