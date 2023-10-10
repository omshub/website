import Login from '@components/LoginContent';
import MobileMenu from '@components/MobileMenu';
import ProfileMenu from '@components/ProfileMenu';
import { useAuth } from '@context/AuthContext';
import { useMenu } from '@context/MenuContext';
import { FirebaseAuthUser } from '@context/types';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import { IconButton, Skeleton, Tooltip, useColorScheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Link from '@src/Link';
interface NavBarProps {}

export interface MenuLinksProps {
  [key: string]: any;
}

export const NavBar = ({ ...props }: NavBarProps) => {
  const {user, loading} = useAuth();

  const {  handleLoginOpen } =
    useMenu();

  const navigationMenuItems: MenuLinksProps = {
    Recents: {
      url: '/recents',
      tooltip: 'Recent 50 reviews',
    },
    About: { url: '/about', tooltip: 'Our background' },
  };

  const profileMenuItems: MenuLinksProps = {
    // 'My Account': '/user/',
    'My Reviews': '/user/reviews',
  };

  const theme = useTheme();
  const { mode, setMode } = useColorScheme();
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        color='secondary'
        position='static'
        elevation={0}
        {...props}
      >
        <Toolbar color='inherit'>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Link
              variant='button'
              color='inherit'
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
                    color='inherit'
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
              sx={{ 
                p: 0,
                height: "100%",
                my: 1,
                mx: 1.5, }}
              onClick={()=>setMode(mode == 'light' ? 'dark' : 'light')}
              color="inherit"
            >
            <Tooltip disableInteractive disableFocusListener disableTouchListener title={`${theme.palette.mode} mode`}>
              {theme.palette.mode === 'dark' ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
              </Tooltip>
            </IconButton>
            <Link
              variant='button'
              color='inherit'
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
          {!loading ? <> {!user ? (
            <>
              <Button
                disableRipple
                onClick={handleLoginOpen}
                color="inherit"
                variant='outlined'
                sx={{ my: 1, mx: 1.5 }}
              >
                Login
              </Button>
                <Login />
            </>
          ) : (
            <Box sx={{ flexGrow: 0 }}>
              <ProfileMenu {...profileMenuItems} />
            </Box>
          )}</> : 
          <Box width={88} height={44}></Box>
          }
         
        </Toolbar>
      </AppBar>
    </Box>
  );
};
