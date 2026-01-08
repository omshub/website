'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { CssVarsProvider, extendTheme } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { getDesignTokens } from '@src/theme';

const { palette: lightPalette } = getDesignTokens('light');
const { palette: darkPalette } = getDesignTokens('dark');

const theme = extendTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
  cssVarPrefix: 'omshub',
  colorSchemes: {
    light: {
      palette: lightPalette,
    },
    dark: {
      palette: darkPalette,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '123',
          boxShadow: '',
          backgroundImage: '',
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'css', prepend: true }}>
      <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </AppRouterCacheProvider>
  );
}
