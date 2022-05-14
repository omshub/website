import { createTheme } from '@mui/material/styles'
import { red } from '@mui/material/colors'

// Create a theme instance.
const theme = createTheme({
	palette: {
		primary: {
			main: '#A4925A',
			light: '#AF9E66',
		},
		secondary: {
			main: '#A4925A',
			light: '#AF9E66',
		},
		error: {
			main: red.A400,
		},
	},
})

export default theme
