import { TContextProviderProps } from '@context/types';
import { Experimental_CssVarsProvider as CssVarsProvider, experimental_extendTheme as extendTheme } from '@mui/material/styles';
import { getDesignTokens } from '@src/theme';

const { palette: lightPalette } = getDesignTokens('light');
const { palette: darkPalette } = getDesignTokens('dark');

export const theme = extendTheme({
  typography: {
    fontFamily:[
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
  cssVarPrefix:'omshub',
  colorSchemes:{
    light:{
      palette: lightPalette
    },
    dark:{
      palette: darkPalette
    }
  },
  components: {
     MuiDrawer: {
       styleOverrides: {
         paper: {
           backgroundColor: "123",
           boxShadow:"",
           backgroundImage:"",
         }
       }
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