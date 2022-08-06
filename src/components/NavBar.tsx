import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import { grey } from '@mui/material/colors'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from '../Link'
import Dialog from '@mui/material/Dialog';
import Login from './LoginContent'
import {useAuth} from '../../context/AuthContext'
import {useMenu} from '../../context/MenuContext'
import Box from '@mui/material/Box';
import ProfileMenu from './ProfileMenu'

interface NavBarProps {}

export const NavBar = ({ ...props }: NavBarProps) => {
	
	const {user} = useAuth()
	const {loginModalOpen,handleLoginModalOpen,handleLoginModalClose} = useMenu()
	
	return (
		<Box sx={{ flexGrow: 1 }}>
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
						href='/about'
						sx={{ my: 1, mx: 1.5 }}
					>
						About
					</Link>
				</nav>
				{!user ? 
					<>
						<Button disableRipple onClick={handleLoginModalOpen} variant='outlined' sx={{ my: 1, mx: 1.5 }}>Login</Button>
						<Dialog
							aria-labelledby="spring-modal-title"
							aria-describedby="spring-modal-description"
							open={loginModalOpen}
							onClose={handleLoginModalClose}
							closeAfterTransition
							>
							<Login/>
						</Dialog>
					</>
					:
					<Box sx={{ flexGrow: 0 }}>
						<ProfileMenu/>
			  		</Box>
				}
			</Toolbar>
		</AppBar>
		</Box>
	)
}
