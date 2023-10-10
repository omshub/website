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
      },
      background:{
        default: '#FFF',
        paper: '#FFF',
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
        },
        background:{
          default: '#000',
          paper: '#000',
        }
      }
    },
})
// Create a theme instance.

// export const getThemeComponents = (mode : PaletteMode ) =>({
//   typography: {
//     fontFamily:[
//       '-apple-system',
//       'BlinkMacSystemFont',
//       '"Segoe UI"',
//       'Roboto',
//       '"Helvetica Neue"',
//       'Arial',
//       'sans-serif',
//       '"Apple Color Emoji"',
//       '"Segoe UI Emoji"',
//       '"Segoe UI Symbol"',
//     ].join(','),
//   },
//   mode,
//   components: {
//      ...(mode == 'light')?
//     {

//     }:
//     {
//       MuiAppBar:{
//         styleOverrides:{
          
//         },
//       },
//       MuiDrawer: {
//         styleOverrides: {
//           paper: {
//             backgroundColor: "000",
//           }
//         }
//       }
//     }
//   }
// })
