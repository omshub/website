'use client';

import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import { navyBlue } from '@src/colorPalette';
import EmotionCache from './EmotionCache';

const theme = createTheme({
  cssVariables: {
    cssVarPrefix: 'omshub',
    colorSchemeSelector: 'data-omshub-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#FFFFFF',
          contrastText: '#000000',
        },
        secondary: {
          main: navyBlue,
          contrastText: '#FFFFFF',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#FFFFFF',
          paper: '#FFFFFF',
        },
        text: {
          primary: '#000000',
          secondary: '#54585a',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#121212',
          contrastText: '#FFFFFF',
        },
        secondary: {
          main: '#121212',
          light: '#232428',
          contrastText: '#FFFFFF',
        },
        error: {
          main: red.A400,
        },
        background: {
          default: '#1A1A1C',
          paper: '#1A1A1C',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
        },
      },
    },
  },
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
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: navyBlue,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: navyBlue,
          },
        },
      },
    },
  },
});

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <EmotionCache>
      <ThemeProvider
        theme={theme}
        defaultMode="system"
        disableTransitionOnChange
        modeStorageKey="omshub-mode"
      >
        <CssBaseline />
        {children}
      </ThemeProvider>
    </EmotionCache>
  );
}
