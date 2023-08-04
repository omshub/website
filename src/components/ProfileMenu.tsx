import { useAuth } from '@context/AuthContext';
import { useMenu } from '@context/MenuContext';
import { FirebaseAuthUser } from '@context/types';
import Link from '@src/Link';

import { Avatar, Container } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

export interface MenuLinksProps {
  [key: string]: any;
}

const ProfileMenu = (profileMenuItems: MenuLinksProps) => {
  const authContext = useAuth();

  let user: FirebaseAuthUser | null = null;
  let logout = () => {};

  if (authContext) {
    ({ user, logout } = authContext);
  }

  const { profileMenuAnchorEl, handleProfileMenuOpen, handleProfileMenuClose } =
    useMenu();

  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
  const menuId = 'primary-search-account-menu';
  return (
    <>
      <Container>
        <Tooltip title='Profile Menu'>
          <Avatar
            aria-controls={menuId}
            onClick={handleProfileMenuOpen}
            src={user?.photoURL ?? undefined}
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
          {Object.keys(profileMenuItems).map((key: string, index: number) => (
            <MenuItem key={index} onClick={handleProfileMenuClose}>
              <Link
                color='text.primary'
                href={`${profileMenuItems[key]}`}
                as={`${profileMenuItems[key]}`}
                sx={{
                  mr: 1,
                }}
              >
                {key}
              </Link>
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => {
              handleProfileMenuClose();
              logout();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Container>
    </>
  );
};

export default ProfileMenu;
