import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import { grey } from '@mui/material/colors'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from '@src/Link'

interface NavBarProps {}

export const NavBar = ({ ...props }: NavBarProps) => {
	return (
		<AppBar
			position='static'
			color='default'
			elevation={0}
			sx={{
				background: (theme) => `${theme.palette.common.white}`,
				boxShadow: `0 5px 15px 0 ${grey[200]}`,
			}}
			{...props}
		>
			<Toolbar sx={{ flexWrap: 'wrap' }}>
				<Link
					variant='button'
					color='text.primary'
					href='/'
					sx={{ flexGrow: 1, my: 1, mx: 1.5, textDecoration: 'none' }}
				>
					<Typography variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
						OMSHub
					</Typography>
				</Link>
				<nav>
					<Link
						variant='button'
						color='text.primary'
						href='/recents'
						sx={{
							my: 1,
							mx: 1.5,
							textDecoration: 'unset',
							'&:hover': { textDecoration: 'underline' },
						}}
					>
						Recent Reviews
					</Link>
					<Link
						variant='button'
						color='text.primary'
						href='/about'
						sx={{
							my: 1,
							mx: 1.5,
							textDecoration: 'unset',
							'&:hover': { textDecoration: 'underline' },
						}}
					>
						About
					</Link>
				</nav>
				<Button href='#todo' variant='outlined' sx={{ my: 1, mx: 1.5 }}>
					Login
				</Button>
			</Toolbar>
		</AppBar>
	)
}
