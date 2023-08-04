import { MenuLinksProps } from '@components/NavBar';
import { useMenu } from '@context/MenuContext';
import MenuIcon from '@mui/icons-material/Menu';
import { Container, IconButton, Menu, MenuItem } from '@mui/material';
import Link from '@src/Link';

const MobileMenu = (navigationMenuItems: MenuLinksProps) => {
  const {
    mobileNavMenuAnchorEl,
    handleMobileNavMenuOpen,
    handleMobileNavMenuClose,
  } = useMenu();

  // const isMobileNavMenuOpen = Boolean(mobileNavMenuAnchorEl)
  const menuId = 'mobile-navigation-menu';
  return (
    <>
      <Container
        sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' }, m: 0 }}
      >
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
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          open={Boolean(mobileNavMenuAnchorEl)}
          onClose={handleMobileNavMenuClose}
          sx={{
            display: { xs: 'block', md: 'none' },
          }}
        >
          <MenuItem onClick={handleMobileNavMenuClose}>
            <Link
              color='text.primary'
              href={`/`}
              sx={{
                my: 1,
                mx: 1.5,
              }}
            >
              {`Home`}
            </Link>
          </MenuItem>
          {Object.keys(navigationMenuItems).map(
            (name: string, index: number) => (
              <MenuItem key={index} onClick={handleMobileNavMenuClose}>
                <Link
                  color='text.primary'
                  href={navigationMenuItems[name][`url`]}
                  key={index}
                  sx={{
                    my: 1,
                    mx: 1.5,
                  }}
                >
                  {name}
                </Link>
              </MenuItem>
            ),
          )}
          <MenuItem>
            <Link
              color='text.primary'
              href={`https://github.com/omshub/website/`}
              sx={{
                my: 1,
                mx: 1.5,
              }}
            >
              {`Github`}
            </Link>
          </MenuItem>
        </Menu>
      </Container>
    </>
  );
};

export default MobileMenu;
