import { useMenu } from '@context/MenuContext'
import MenuIcon from '@mui/icons-material/Menu'
import { Container, IconButton, Link, Menu, MenuItem } from '@mui/material'
import { MenuLinksProps } from './NavBar'

const MobileMenu = (navigationMenuItems: MenuLinksProps) => {
	const {
		mobileNavMenuAnchorEl,
		handleMobileNavMenuOpen,
		handleMobileNavMenuClose,
	} = useMenu()

	// const isMobileNavMenuOpen = Boolean(mobileNavMenuAnchorEl)
	const menuId = 'mobile-navigation-menu'
	return (
		<>
			<Container sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
				<IconButton
					size='large'
					aria-label='account of current user'
					aria-controls='menu-appbar'
					aria-haspopup='true'
					onClick={handleMobileNavMenuOpen}
					color='inherit'
				>
					<MenuIcon />
				</IconButton>
				<Menu
					id={menuId}
					anchorEl={mobileNavMenuAnchorEl}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					keepMounted
					open={Boolean(mobileNavMenuAnchorEl)}
					onClose={handleMobileNavMenuClose}
					sx={{
						display: { xs: 'block', md: 'none' },
					}}
				>
					{Object.keys(navigationMenuItems).map(
						(key: string, index: number) => (
							<MenuItem key={index} onClick={handleMobileNavMenuClose}>
								<Link
									color='text.primary'
									href={navigationMenuItems[key]}
									key={index}
									sx={{
										my: 1,
										mx: 1.5,
										textDecoration: 'unset',
										'&:hover': { textDecoration: 'underline' },
									}}
								>
									{key}
								</Link>
							</MenuItem>
						)
					)}
				</Menu>
			</Container>
		</>
	)
}

export default MobileMenu
