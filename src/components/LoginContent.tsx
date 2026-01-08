import { useAuth } from '@context/AuthContext';
import { useMenu } from '@context/MenuContext';
import { TSignInAction } from '@context/types';
import { TProviderName } from '@globals/types';
import {
  Stack,
  TextField,
  Typography,
  Box,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import SocialButton from '@components/SocialButton';
import CloseIcon from '@mui/icons-material/Close';

const Login: NextPage = () => {
  const authContext = useAuth();

  let signInWithProvider: TSignInAction = () => {};
  let signWithMagic: TSignInAction = () => {};

  if (authContext) {
    ({ signInWithProvider, signWithMagic } = authContext);
  }
  const { loginOpen, handleLoginClose } = useMenu();
  const [email, setEmail] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const handleEmailChange = (event: any) => {
    setEmail(event?.target?.value);
  };
  const handleKeyPress = (event: any) => {
    if (event?.charCode === 13) {
      signWithMagic(email);
      handleLoginClose();
    }
  };
  const isDesktopQuery = useMediaQuery('(min-width:1025px)', { noSsr: true });
  const isDesktop = mounted ? isDesktopQuery : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const providers: TProviderName[] = ['Google', 'Facebook', 'Github'];

  return (
    <Drawer
      PaperProps={{
        sx: {
          width: `${isDesktop ? 'auto' : '100%'}`,
          boxShadow: '0 0px 5px 0 #bdbdbd',
          backgroundImage: 'none',
        },
      }}
      open={loginOpen}
      onClose={handleLoginClose}
      anchor={'right'}
    >
      <Box m={2} p={4}>
        <Stack
          direction='column'
          justifyContent={'space-evenly'}
          spacing={isDesktop ? 8 : 6}
        >
          <Typography
            style={{ marginBottom: '20px' }}
            variant='h4'
            component='div'
            gutterBottom
          >
            LOGIN
          </Typography>
          <TextField
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            sx={{ textAlign: 'center' }}
            label={`🔮 Enter an email address`}
          ></TextField>
          {providers.map((provider: TProviderName, index) => (
            <SocialButton
              key={index}
              onClick={() => {
                signInWithProvider(provider);
                handleLoginClose();
              }}
              provider={provider}
            />
          ))}
          <Box mt={2}>
            <CloseIcon sx={{ width: '100%' }} onClick={handleLoginClose} />
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default Login;
