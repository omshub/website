import { MenuLinksProps } from '@components/NavBar';
import { useMenu } from '@context/MenuContext';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Container, Drawer, IconButton, ListItemButton, Stack, Typography } from '@mui/material';
import Link from '@src/Link';
import CloseIcon from '@mui/icons-material/Close';


const MobileMenu = (navigationMenuItems: MenuLinksProps) => {
  const {
    mobileNavMenuAnchorEl,
    handleMobileNavMenuOpen,
    handleMobileNavMenuClose,
  } = useMenu();


  // const isMobileNavMenuOpen = Boolean(mobileNavMenuAnchorEl)
  return (
    <>
      <Container
        color='secondary'
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
        <Drawer hideBackdrop PaperProps={{ sx:{width:"100%", boxShadow: 'none', backgroundImage: 'none'}}} open={Boolean(mobileNavMenuAnchorEl)} onClose={handleMobileNavMenuClose}>
        <Box
          m={2}
          p={4}
        >
        <Stack direction="column"  justifyContent={"space-evenly"} spacing={6}>
          <Typography
          style={{ marginBottom: '20px' }}
          variant='h4'
          component='div'
          gutterBottom
        >
          NAVIGATION
        </Typography>
          <ListItemButton onClick={handleMobileNavMenuClose}>
            <Link
              color='inherit'
              href={`/`}
            >
              {`Home`}
            </Link>
            </ListItemButton>
          {Object.keys(navigationMenuItems).map(
            (name: string, index: number) => (
              <ListItemButton key={index} onClick={handleMobileNavMenuClose}>
                <Link
                  color='inherit'
                  href={navigationMenuItems[name][`url`]}
                  key={index}
                >
                  {name}
                </Link>
              </ListItemButton>
            ),
          )}
          <ListItemButton>
            <Link
              color='inherit'
              href={`https://github.com/omshub/website/`}
            >
              {`Github`}
            </Link>
          </ListItemButton>
          <CloseIcon sx={{width:"100%"}} onClick={handleMobileNavMenuClose}/>
        </Stack>
        </Box>
      </Drawer>
      </Container>
    </>
  );
};

export default MobileMenu;
