'use client';

import { useState } from 'react';
import {
  Drawer,
  Stack,
  Button,
  Text,
  Divider,
  TextInput,
  Group,
  ThemeIcon,
  Box,
  Loader,
} from '@mantine/core';
import {
  IconMail,
  IconBrandGoogle,
  IconBrandGithub,
  IconBook,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
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
      return;
    }

    setEmailError('');
    setIsLoading(true);
    setLoadingProvider('magic');

    try {
      await authContext.signInWithMagicLink(email);
      // Close drawer and reset AFTER the magic link is sent
      // so the user sees the success alert
      setEmail('');
      onClose();
    } catch {
      // Error alert is shown by signInWithMagicLink, keep drawer open
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github') => {
    if (!authContext) {
      return;
    }

    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      authContext.signInWithProvider(provider);
      onClose();
    } finally {
      // Reset after a delay to allow popup to open
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProvider(null);
      }, 1000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleMagicLink();
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
      onClose={onClose}
      position="right"
      size={420}
      padding="xl"
      withCloseButton
      title={null}
      withinPortal
      zIndex={1000}
      lockScroll
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
            Sign in to OMSHub
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Access course reviews, submit your own, and track your progress
          </Text>
        </Box>

        {/* Magic Link Section */}
        <Stack gap="xs">
          <TextInput
            placeholder="Enter your email address"
            leftSection={<IconMail size={18} />}
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              setEmailError('');
            }}
            onKeyDown={handleKeyPress}
            error={emailError}
            disabled={isLoading}
            size="md"
            styles={{
              input: {
                '&:focus': {
                  borderColor: GT_COLORS.navy,
                },
              },
            }}
          />
          <Button
            fullWidth
            size="md"
            onClick={handleMagicLink}
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
            We'll email you a sign-in link. No password needed.
          </Text>
        </Stack>

        <Divider label="or continue with" labelPosition="center" />

        {/* Provider Buttons */}
        <Stack gap="sm">
          {providers.map((provider) => (
            <Button
              key={provider.name}
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
