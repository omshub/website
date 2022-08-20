import { useAuth } from '@context/AuthContext'
import { useMenu } from '@context/MenuContext'
import { FirebaseAuthUser } from '@context/types'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { grey } from '@mui/material/colors'
import Dialog from '@mui/material/Dialog'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from '../Link'
import Login from './LoginContent'
import MobileMenu from './MobileMenu'
import ProfileMenu from './ProfileMenu'

interface NavBarProps {}

export interface MenuLinksProps {
	[key: string]: any
}

export const NavBar = ({ ...props }: NavBarProps) => {
	const authContext = useAuth()

	let user: FirebaseAuthUser | null = null

	if (authContext) {
		;({ user } = authContext)
	}

	const { loginModalOpen, handleLoginModalOpen, handleLoginModalClose } =
		useMenu()

	const navigationMenuItems: MenuLinksProps = {
		Recents: '/recents',
		About: '/about',
	}

	const profileMenuItems: MenuLinksProps = {
		// 'My Account': '/user/...',
		'My Reviews': '/user/reviews',
	}

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
				<Toolbar>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						<Link
							variant='button'
							color='text.primary'
							href='/'
							sx={{
								display: { xs: 'none', md: 'flex' },
								mr: 1,
								textDecoration: 'unset',
								'&:hover': { textDecoration: 'unset' },
							}}
						>
							<Typography
								variant='h6'
								color='inherit'
								noWrap
								sx={{ flexGrow: 1 }}
							>
								OMSHub
							</Typography>
						</Link>
					</Box>
					<Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
						{Object.keys(navigationMenuItems).map(
							(name: string, index: number) => (
								<Link
									variant='button'
									color='text.primary'
									href={`${navigationMenuItems[name]}`}
									key={index}
									sx={{
										my: 1,
										mx: 1.5,
										textDecoration: 'unset',
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									{name}
								</Link>
							)
						)}
					</Box>
					<MobileMenu {...navigationMenuItems} />
					{/* User Profile Side */}
					{!user ? (
						<>
							<Button
								disableRipple
								onClick={handleLoginModalOpen}
								variant='outlined'
								sx={{ my: 1, mx: 1.5 }}
							>
								Login
							</Button>
							<Dialog
								aria-labelledby='spring-modal-title'
								aria-describedby='spring-modal-description'
								open={loginModalOpen}
								onClose={handleLoginModalClose}
								closeAfterTransition
							>
								<Login />
							</Dialog>
						</>
					) : (
						<Box sx={{ flexGrow: 0 }}>
							<ProfileMenu {...profileMenuItems} />
						</Box>
					)}
				</Toolbar>
			</AppBar>
		</Box>
	)
}
