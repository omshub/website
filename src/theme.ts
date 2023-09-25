import { navyBlue, techGold } from '@src/colorPalette';

import { createTheme } from '@mui/material/styles';

import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: navyBlue,
    },
    secondary: {
      main: techGold,
    },
    error: {
      main: red.A400,
    },
  },
});

export default theme;
