import { useAuth } from '@context/AuthContext'
import { useMenu } from '@context/MenuContext'

import { Avatar, Container } from '@mui/material'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import { MenuLinksProps } from './NavBar'

const ProfileMenu = (profileMenuItems: MenuLinksProps) => {
	const { user, logout } = useAuth()
	const { profileMenuAnchorEl, handleProfileMenuOpen, handleProfileMenuClose } =
		useMenu()

	const isProfileMenuOpen = Boolean(profileMenuAnchorEl)
	const menuId = 'primary-search-account-menu'
	return (
		<>
			<Container>
				<Tooltip title='Profile Menu'>
					<Avatar
						aria-controls={menuId}
						onClick={handleProfileMenuOpen}
						src={user?.displayName?.photoURL}
					/>
				</Tooltip>
				<Menu
					anchorEl={profileMenuAnchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					id={menuId}
					keepMounted
					open={isProfileMenuOpen}
					onClose={handleProfileMenuClose}
				>
					{Object.keys(profileMenuItems).map((key: string, index: number) => {
						return (
							<MenuItem key={index} onClick={handleProfileMenuClose}>
								{key}
							</MenuItem>
						)
					})}
					<MenuItem
						onClick={() => {
							handleProfileMenuClose()
							logout()
						}}
					>
						Logout
					</MenuItem>
				</Menu>
			</Container>
		</>
	)
}
export default ProfileMenu
