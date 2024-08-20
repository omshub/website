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
import { useState } from 'react';
import SocialButton from '@components/SocialButton';
import CloseIcon from '@mui/icons-material/Close';

const Login: NextPage = () => {
  const authContext = useAuth();

  /* eslint-disable no-unused-vars */
  let signInWithProvider: TSignInAction = (email: string) => {};
  let signWithMagic: TSignInAction = (email: string) => {};
  /* eslint-enable no-unused-vars */

  if (authContext) {
    ({ signInWithProvider, signWithMagic } = authContext);
  }
  const { loginOpen, handleLoginClose } = useMenu();
  const [email, setEmail] = useState<string>('');
  const handleEmailChange = (event: any) => {
    setEmail(event?.target?.value);
  };
  const handleKeyPress = (event: any) => {
    if (event?.charCode === 13) {
      signWithMagic(email);
      handleLoginClose();
    }
  };
  const isDesktop = useMediaQuery('(min-width:1025px)');

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
      ModalProps={{ onBackdropClick: handleLoginClose }}
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
            <>
              <SocialButton
                key={index}
                onClick={() => {
                  signInWithProvider(provider);
                  handleLoginClose();
                }}
                provider={provider}
              ></SocialButton>
            </>
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
