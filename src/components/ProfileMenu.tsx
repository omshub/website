import { useAuth } from '@context/AuthContext';
import { useMenu } from '@context/MenuContext';
import { FirebaseAuthUser } from '@context/types';
import Link from '@src/Link';

import { isGTEmail } from '@globals/utilities';
import { Avatar, Container, Menu, MenuItem, Tooltip } from '@mui/material';

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

  const isGatech = isGTEmail(user?.email!);
  const BuzzProfile = 'buzz-profile.jpg';
  const LamaProfile = 'lama-profile.png';
  const isProfileMenuOpen = Boolean(profileMenuAnchorEl);
  const menuId = 'primary-search-account-menu';
  return (
    <>
      <Container sx={{ color: 'inherit' }}>
        <Tooltip arrow title='Profile Menu'>
          <Avatar
            aria-controls={menuId}
            onClick={handleProfileMenuOpen}
            src={user?.photoURL ?? (isGatech ? BuzzProfile : LamaProfile)}
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
