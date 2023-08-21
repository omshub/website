import { TContextProviderProps } from '@context/types';
import { PaletteMode, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import { getDesignTokens, getThemeComponents } from '@src/theme';
import { createContext, useContext, useMemo, useState } from 'react';

const ColorContext = createContext<any>('light');

export const useColorMode = () => useContext(ColorContext);

export const ColorProvider = ({ children }: TContextProviderProps) => {
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<PaletteMode>('light');
  const theme = useMemo(()=>createTheme(deepmerge(getDesignTokens(mode),getThemeComponents(mode))),[mode])
  const colorMode = useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) =>
          prevMode === 'light' ? 'dark' : 'light',
        );
      },
    }),
    [],
  );
  return (
    <ColorContext.Provider value={{ mode, colorMode }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ColorContext.Provider>
  );
};
