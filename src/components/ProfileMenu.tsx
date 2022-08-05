import {useMenu} from '../../context/MenuContext'
import {useAuth} from '../../context/AuthContext'

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import IconButton from '@mui/material/IconButton'
import AccountCircle from '@mui/icons-material/AccountCircle';

const ProfileMenu = () => {
    const {logout} = useAuth()
    const {profileMenuAnchorEl,handleProfileMenuOpen,handleMenuClose} = useMenu()
    
	const isProfileMenuOpen = Boolean(profileMenuAnchorEl)
  	const menuId = 'primary-search-account-menu';
    return (
        <>
        <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            >
            <AccountCircle />
        </IconButton>
        <Menu
        anchorEl={profileMenuAnchorEl}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        open={isProfileMenuOpen}
        onClose={handleMenuClose}
        >
        {/* <MenuItem onClick={handleMenuClose}>My account</MenuItem> */}
        <MenuItem onClick={()=>{handleMenuClose();logout()}}>Logout</MenuItem>
        </Menu>
        </>
    )
}
export default ProfileMenu;