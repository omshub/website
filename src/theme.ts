import { PaletteMode } from '@mui/material';
import { red } from '@mui/material/colors';
import { navyBlue } from '@src/colorPalette';

// Design tokens
export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode == 'light'
      ? //Light
        {
          primary: {
            main: '#FFF',
            contrastText: '#000',
          },
          secondary: {
            main: navyBlue,
            contrastText: '#FFF',
          },
          error: {
            main: red.A400,
          },
          background: {
            default: '#FFF',
            paper: '#FFF',
          },
        }
      : //Dark
        {
          primary: {
            main: '#121212',
            contrastText: '#FFF',
          },
          secondary: {
            main: '#121212',
            light: '#232428',
            contrastText: '#FFF',
          },
          error: {
            main: red.A400,
          },
          background: {
            default: '#1A1A1C',
            paper: '#1A1A1C',
          },
        }),
  },
});
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
