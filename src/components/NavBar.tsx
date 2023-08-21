import Login from '@components/LoginContent';
import MobileMenu from '@components/MobileMenu';
import ProfileMenu from '@components/ProfileMenu';
import { useAuth } from '@context/AuthContext';
import { useColorMode } from '@context/ColorContext';
import { useMenu } from '@context/MenuContext';
import { FirebaseAuthUser } from '@context/types';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import { IconButton, Tooltip } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { grey } from '@mui/material/colors';
import { useTheme } from '@mui/material/styles';
import Link from '@src/Link';
interface NavBarProps {}

export interface MenuLinksProps {
  [key: string]: any;
}

export const NavBar = ({ ...props }: NavBarProps) => {
  const authContext = useAuth();

  let user: FirebaseAuthUser | null = null;

  if (authContext) {
    ({ user } = authContext);
  }

  const { loginModalOpen, handleLoginModalOpen, handleLoginModalClose } =
    useMenu();

  const navigationMenuItems: MenuLinksProps = {
    Recents: {
      url: '/recents',
      tooltip: 'Recent 50 reviews',
    },
    About: { url: '/about', tooltip: 'Our background' },
  };

  const profileMenuItems: MenuLinksProps = {
    // 'My Account': '/user/...',
    'My Reviews': '/user/reviews',
  };

  const theme = useTheme();
  const { colorMode } = useColorMode();
  
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
                <Tooltip
                  key={index}
                  title={`${navigationMenuItems[name][`tooltip`]}`}
                >
                  <Link
                    variant='button'
                    color='text.primary'
                    href={`${navigationMenuItems[name][`url`]}`}
                    key={index}
                    sx={{
                      my: 1,
                      mx: 1.5,
                    }}
                  >
                    {name}
                  </Link>
                </Tooltip>
              ),
            )}
            <IconButton
              sx={{ ml: 1 }}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
            <Link
              variant='button'
              color='text.primary'
              href={`https://github.com/omshub/website/`}
              sx={{
                my: 1,
                mx: 1.5,
              }}
            >
              <Tooltip title={`Website's Github`}>
                <GitHubIcon />
              </Tooltip>
            </Link>
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
  );
};
