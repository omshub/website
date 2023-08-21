import { PaletteMode } from '@mui/material';
import { red } from '@mui/material/colors';
import { navyBlue, techGold } from '@src/colorPalette';


// Design tokens
export const getDesignTokens = (mode: PaletteMode ) => ({
  palette :{
    mode,
    ...(mode == 'light')?
    {
      primary: {
        main: navyBlue,
      },
      secondary: {
        main: techGold,
      },
      error: {
        main: red.A400,
      }
    }:
    {
      primary: {
        main: navyBlue,
      },
      secondary: {
        main: techGold,
      },
      error: {
        main: red.A400,
      }
    }
  }
})
// Create a theme instance.

export const getThemeComponents = (mode : PaletteMode ) =>({
  mode,
    ...(mode == 'light')?
    {}:
    {}
})
