'use client';

import { useState, useEffect } from 'react';
import Login from '@components/LoginContent';
import MobileMenu from '@components/MobileMenu';
import ProfileMenu from '@components/ProfileMenu';
import { useAuth } from '@context/AuthContext';
import { useMenu } from '@context/MenuContext';
import { FirebaseAuthUser } from '@context/types';
import { TNullable } from '@globals/types';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import MailIcon from '@mui/icons-material/Mail';
import {
  IconButton,
  AppBar,
  Box,
  Button,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';

import Link from '@src/Link';

export interface MenuLinksProps {
  [key: string]: any;
}

export const NavBar = () => {
  const authContext: TNullable<any> = useAuth();
  const user: TNullable<FirebaseAuthUser> = authContext.user;
  const loading: TNullable<boolean> = authContext.loading;

  const { handleLoginOpen } = useMenu();

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

  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only use mode after mounting to prevent hydration mismatch
  const currentMode = mounted ? mode : undefined;
  const isDark = currentMode === 'dark';

  const handleToggleMode = () => {
    if (!mounted) return;
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position='static'
        elevation={0}
        sx={{
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
        }}
      >
        <Toolbar color='inherit'>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Tooltip arrow title={'Home'}>
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
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            {Object.keys(navigationMenuItems).map(
              (name: string, index: number) => (
                <Tooltip
                  arrow
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
            <Tooltip arrow title={mounted ? `Switch to ${isDark ? 'light' : 'dark'} mode` : 'Toggle theme'}>
              <IconButton
                onClick={handleToggleMode}
                color='inherit'
                aria-label='Toggle light/dark mode'
                sx={{
                  p: 0,
                  height: '100%',
                  my: 1,
                  mx: 1.5,
                }}
              >
                {mounted ? (
                  isDark ? (
                    <Brightness7Icon />
                  ) : (
                    <Brightness4Icon />
                  )
                ) : (
                  <Brightness4Icon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip arrow title={`Website's Github`}>
              <Link
                variant='button'
                color='inherit'
                href={`https://github.com/omshub/website/`}
                target='_blank'
                sx={{
                  my: 1,
                  mx: 1.5,
                }}
              >
                <GitHubIcon />
              </Link>
            </Tooltip>
            <Tooltip arrow title={`Contact OMSHub`}>
              <Link
                variant='button'
                color='inherit'
                href={`mailto:gt.omshub@gmail.com`}
                target='_blank'
                sx={{
                  my: 1,
                  mx: 1.5,
                }}
              >
                <MailIcon />
              </Link>
            </Tooltip>
          </Box>
          <MobileMenu {...navigationMenuItems} />
          <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' }, m: 0 }}>
            <IconButton
              onClick={handleToggleMode}
              color='inherit'
              aria-label='Toggle light/dark mode'
              sx={{
                p: 0.75,
                my: 1,
                mx: 1,
              }}
            >
              {mounted ? (
                isDark ? (
                  <Brightness7Icon sx={{ fontSize: 22 }} />
                ) : (
                  <Brightness4Icon sx={{ fontSize: 22 }} />
                )
              ) : (
                <Brightness4Icon sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Box>
          {/* User Profile Side */}
          {!loading ? (
            <>
              {' '}
              {!user ? (
                <>
                  <Button
                    disableRipple
                    onClick={handleLoginOpen}
                    color='inherit'
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
              )}
            </>
          ) : (
            <Box width={88} height={44}></Box>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};
