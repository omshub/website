import { PaletteMode } from '@mui/material';
import { grey, red } from '@mui/material/colors';
import { techGold, white } from '@src/colorPalette';



// Design tokens
export const getDesignTokens = (mode: PaletteMode ) => ({
  palette :{
    mode,
    ...(mode == 'light')?
    {
      primary: {
        main: '#000',
        contrastText: grey[200],
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
        main: white,
        contrastText: '#000',
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
  components: {
     ...(mode == 'light')?
    {

    }:
    {}
  }
})
