import { TContextProviderProps } from '@context/types';
import { Experimental_CssVarsProvider as CssVarsProvider, experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { getDesignTokens } from '@src/theme';

const { palette: lightPalette } = getDesignTokens('light');
const { palette: darkPalette } = getDesignTokens('dark');
export const theme = extendTheme({
  cssVarPrefix:'omshub',
  colorSchemes:{
    light:{
      palette: lightPalette
    },
    dark:{
      palette: darkPalette
    }
  }
})

export const ColorProvider = ({ children }: TContextProviderProps) => {
  

  return (
      <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange> 
        {children}
      </CssVarsProvider>
  );
};