import { PaletteMode } from '@mui/material';
import { red } from '@mui/material/colors';
import { navyBlue, techGold } from '@src/colorPalette';



// Design tokens
export const getDesignTokens = (mode: PaletteMode ) => ({
  palette :{
    mode,
    ...(mode == 'light')?
    //Light
    {
      primary: {
        main: '#000',
        contrastText:'#FFF'
      },
      secondary: {
        main: navyBlue,
      },
      error: {
        main: red.A400,
      }
    }:
    //Dark
    {
        primary: {
          main: '#FFF',
          contrastText: '#000',
        },
        secondary: {
          main: techGold,
        },
        error: {
          main: red.A400,
        }
      }
    },
    dark:{
      palette:{
        primary: {
            main: '#000',
            contrastText: '#FFF',
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
    {
      MuiAppBar:{
        styleOverrides:{
          
        }
      }
    }
  }
})
