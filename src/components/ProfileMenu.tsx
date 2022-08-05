import {useMenu} from '../../context/MenuContext'
import {useAuth} from '../../context/AuthContext'

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { Avatar } from '@mui/material';

const ProfileMenu = () => {
    const {user,logout} = useAuth()
    const {profileMenuAnchorEl,handleProfileMenuOpen,handleMenuClose} = useMenu()
    
	const isProfileMenuOpen = Boolean(profileMenuAnchorEl)
  	const menuId = 'primary-search-account-menu';
    return (
        <>
        <Avatar
            aria-controls={menuId}
            onClick={handleProfileMenuOpen}
            src={user.photoURL}
        />
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
        <MenuItem onClick={handleMenuClose}>My account</MenuItem>
        <MenuItem onClick={()=>{handleMenuClose();logout()}}>Logout</MenuItem>
        </Menu>
        </>
    )
}
export default ProfileMenu;