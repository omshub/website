import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import Link from '../Link'

interface NavBarProps {}

export const NavBar = ({ ...props }: NavBarProps) => {
	return (
		<AppBar
			position='static'
			color='default'
			elevation={0}
			sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}
			{...props}
		>
			<Toolbar sx={{ flexWrap: 'wrap' }}>
				<Typography variant='h6' color='inherit' noWrap sx={{ flexGrow: 1 }}>
					OMSHub
				</Typography>
				<nav>
					<Link
						variant='button'
						color='text.primary'
						href='/'
						sx={{ my: 1, mx: 1.5 }}
					>
						Home
					</Link>
					<Link
						variant='button'
						color='text.primary'
						href='about'
						sx={{ my: 1, mx: 1.5 }}
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
