'use client';

import { useState } from 'react';
import {
  Drawer,
  Stack,
  Button,
  Text,
  TextInput,
  Group,
  ThemeIcon,
  Box,
  Loader,
  PinInput,
  Divider,
} from '@mantine/core';
import {
  IconMail,
  IconBrandGoogle,
  IconBrandGithub,
  IconBook,
  IconArrowLeft,
  IconCheck,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { getClient } from '@/lib/supabase/client';
import { notifyError } from '@/utils/notifications';
import { GT_COLORS } from '@/lib/theme';

interface LoginDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export default function LoginDrawer({ opened, onClose }: LoginDrawerProps) {
  const authContext = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  // OTP flow state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!authContext) {
      notifyError({
        title: 'Error',
        message: 'Authentication not available. Please refresh the page.',
      });
      return;
    }

    setEmailError('');
    setIsLoading(true);
    setLoadingProvider('magic');

    try {
      const success = await authContext.signInWithMagicLink(email);
      if (success) {
        // Show OTP input only if email was sent successfully
        setOtpEmail(email);
        setOtpSent(true);
      }
      // If not successful, error notification is shown by signInWithMagicLink
    } catch {
      notifyError({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 8) {
      notifyError({
        title: 'Invalid Code',
        message: 'Please enter the 8-digit code from your email',
      });
      return;
    }

    setIsLoading(true);
    setLoadingProvider('otp');

    try {
      const supabase = getClient();
      const { error } = await supabase.auth.verifyOtp({
        email: otpEmail,
        token: otpCode,
        type: 'email',
      });

      if (error) {
        notifyError({
          title: 'Invalid Code',
          message: error.message,
        });
        setOtpCode('');
      } else {
        // Success - close drawer (welcome notification handled by AuthContext)
        handleClose();
      }
    } catch {
      notifyError({
        title: 'Verification Failed',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpCode('');
    setOtpEmail('');
    // Also reset loading state to ensure button is enabled
    setIsLoading(false);
    setLoadingProvider(null);
  };

  const handleClose = () => {
    // Reset loading and error states, but preserve OTP state
    // so user can reopen drawer and continue entering code
    setEmailError('');
    setIsLoading(false);
    setLoadingProvider(null);
    onClose();
  };

  const handleProviderLogin = async (provider: 'google' | 'github') => {
    if (!authContext) {
      return;
    }

    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      authContext.signInWithProvider(provider);
      handleClose();
    } finally {
      // Reset after a delay to allow popup to open
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProvider(null);
      }, 1000);
    }
  };

  const providers: Array<{
    name: 'google' | 'github';
    displayName: string;
    icon: typeof IconBrandGoogle;
    color: string;
    bg: string;
    textColor: string;
  }> = [
    { name: 'google', displayName: 'Google', icon: IconBrandGoogle, color: '#4285F4', bg: '#ffffff', textColor: '#1f1f1f' },
    { name: 'github', displayName: 'GitHub', icon: IconBrandGithub, color: '#ffffff', bg: '#24292e', textColor: '#ffffff' },
  ];

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      size={420}
      padding="xl"
      withCloseButton
      title={null}
      withinPortal
      zIndex={1000}
      lockScroll
      closeOnClickOutside={false}
      closeOnEscape={false}
      keepMounted
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        content: {
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack gap="lg" style={{ flex: 1 }}>
        {/* Header with Logo */}
        <Box ta="center" pt="md">
          <Group justify="center" gap="xs" mb="md">
            <ThemeIcon
              size={44}
              radius="md"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              <IconBook size={24} color={GT_COLORS.navy} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700} c={GT_COLORS.navy}>
            {otpSent ? 'Enter Code' : 'Sign in to OMSHub'}
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            {otpSent
              ? `We sent a code to ${otpEmail}`
              : 'Access course reviews, submit your own, and track your progress'}
          </Text>
        </Box>

        {otpSent ? (
          /* OTP Verification View */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVerifyOtp();
            }}
          >
            <Stack gap="xl">
              {/* Code Input Section */}
              <Stack gap="lg" align="center">
                <Box
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <PinInput
                    length={8}
                    value={otpCode}
                    onChange={setOtpCode}
                    onComplete={handleVerifyOtp}
                    size="md"
                    type="number"
                    placeholder=""
                    disabled={isLoading}
                    autoFocus
                    styles={{
                      root: {
                        gap: 4,
                      },
                      input: {
                        width: 36,
                        height: 44,
                        fontWeight: 600,
                        fontSize: 18,
                        borderRadius: 8,
                      },
                    }}
                  />
                </Box>

                <Text size="sm" c="dimmed" ta="center">
                  Enter the code from your email, or click the magic link
                </Text>
              </Stack>

              {/* Verify Button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loadingProvider === 'otp'}
                disabled={isLoading || otpCode.length !== 8}
                leftSection={<IconCheck size={20} />}
                styles={{
                  root: {
                    backgroundColor: GT_COLORS.techGold,
                    color: GT_COLORS.navy,
                    height: 48,
                    '&:hover': {
                      backgroundColor: GT_COLORS.buzzGold,
                    },
                    '&:disabled': {
                      backgroundColor: 'var(--mantine-color-gray-2)',
                      color: 'var(--mantine-color-gray-5)',
                    },
                  },
                }}
              >
                Verify Code
              </Button>

              {/* Secondary Actions */}
              <Stack gap="xs">
                <Group justify="center" gap="xs">
                  <Text size="sm" c="dimmed">Didn't receive it?</Text>
                  <Button
                    type="button"
                    variant="transparent"
                    size="compact-sm"
                    color="blue"
                    onClick={handleMagicLink}
                    loading={loadingProvider === 'magic'}
                    disabled={isLoading}
                    p={0}
                    styles={{
                      root: {
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      },
                    }}
                  >
                    Resend code
                  </Button>
                </Group>

                <Button
                  type="button"
                  fullWidth
                  variant="subtle"
                  color="gray"
                  size="sm"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleBackToEmail}
                  disabled={isLoading}
                >
                  Use different email
                </Button>
              </Stack>
            </Stack>
          </form>
        ) : (
          /* Email Entry View */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMagicLink();
            }}
          >
            <Stack gap="xs">
              <TextInput
                placeholder="Enter your email address"
                leftSection={<IconMail size={18} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setEmailError('');
                }}
                error={emailError}
                disabled={isLoading}
                size="md"
              />
              <Button
                type="submit"
                fullWidth
                size="md"
                disabled={isLoading}
                loading={loadingProvider === 'magic'}
                styles={{
                  root: {
                    backgroundColor: GT_COLORS.techGold,
                    color: GT_COLORS.navy,
                    '&:hover': {
                      backgroundColor: GT_COLORS.buzzGold,
                    },
                    '&:disabled': {
                      backgroundColor: GT_COLORS.techGold,
                      opacity: 0.6,
                    },
                  },
                }}
              >
                Send Magic Link
              </Button>
              <Text size="xs" c="dimmed" ta="center">
                We'll email you a sign-in link and a one-time code.
              </Text>
            </Stack>

            <Divider label="or continue with" labelPosition="center" />

            {/* Provider Buttons */}
            <Stack gap="sm">
              {providers.map((provider) => (
                <Button
                  key={provider.name}
                  type="button"
                  fullWidth
                  size="md"
                  onClick={() => handleProviderLogin(provider.name)}
                  disabled={isLoading}
                  leftSection={
                    loadingProvider === provider.name ? (
                      <Loader size={18} color={provider.textColor} />
                    ) : (
                      <provider.icon size={20} />
                    )
                  }
                  styles={{
                    root: {
                      backgroundColor: provider.bg,
                      color: provider.textColor,
                      border: provider.name === 'google' ? '1px solid #dadce0' : 'none',
                      '&:hover': {
                        backgroundColor: provider.bg,
                        opacity: 0.9,
                      },
                      '&:disabled': {
                        backgroundColor: provider.bg,
                        opacity: 0.6,
                      },
                    },
                  }}
                >
                  Continue with {provider.displayName}
                </Button>
              ))}
            </Stack>
          </form>
        )}

        {/* Footer */}
        <Box mt="auto" pt="xl">
          <Text size="xs" c="dimmed" ta="center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </Box>
      </Stack>
    </Drawer>
  );
}
