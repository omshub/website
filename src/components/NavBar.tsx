import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import { grey } from '@mui/material/colors'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Link from '../Link'
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
// import IconButton from '@mui/material/IconButton'
// import AccountCircle from '@mui/icons-material/AccountCircle';

interface NavBarProps {}

export const NavBar = ({ ...props }: NavBarProps) => {
	// const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	
	// const isMenuOpen = Boolean(anchorEl);

	// const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
	// 	setAnchorEl(event.currentTarget);
	// };

	// const handleMenuClose = () => {
	// 	setAnchorEl(null);
	// };

  	// const menuId = 'primary-search-account-menu';
	
	// const renderMenu = (
	// 	<>
	// 	<IconButton
    //           size="large"
    //           edge="end"
    //           aria-label="account of current user"
    //           aria-controls={menuId}
    //           aria-haspopup="true"
    //           onClick={handleProfileMenuOpen}
    //           color="inherit"
    //         >
    //           <AccountCircle />
	// 	</IconButton>
	// 	<Menu
	// 	  anchorEl={anchorEl}
	// 	  anchorOrigin={{
	// 		vertical: 'bottom',
	// 		horizontal: 'right',
	// 	  }}
	// 	  id={menuId}
	// 	  keepMounted
	// 	  open={isMenuOpen}
	// 	  onClose={handleMenuClose}
	// 	>
	// 	  <MenuItem onClick={handleMenuClose}>My account</MenuItem>
	// 	  <MenuItem component={Link} href="/api/auth/signout">Logout</MenuItem>
	// 	</Menu>
	// 	</>
	//   );
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
				<Link
						variant='button'
						color='text.primary'
						href='/api/auth/signin'
						sx={{ my: 1, mx: 1.5 }}
					>
					<Button variant='outlined' sx={{ my: 1, mx: 1.5 }}>
						Login
					</Button>
				</Link>
				{/* :
				<Box sx={{ flexGrow: 0 }}>
					{renderMenu}
			  	</Box> */}
			</Toolbar>
		</AppBar>
		</Box>
	)
}
