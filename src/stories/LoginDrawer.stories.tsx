import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
  PinInput,
} from '@mantine/core';
import {
  IconMail,
  IconBrandGoogle,
  IconBrandGithub,
  IconBook,
  IconArrowLeft,
  IconCheck,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

interface LoginDrawerStoryProps {
  opened: boolean;
  isLoading?: boolean;
  loadingProvider?: string | null;
  emailError?: string;
  otpSent?: boolean;
}

// Simplified LoginDrawer for Storybook (without context dependencies)
const LoginDrawerStory = ({
  opened,
  isLoading = false,
  loadingProvider = null,
  emailError = '',
  otpSent: initialOtpSent = false,
}: LoginDrawerStoryProps) => {
  const [isOpen, setIsOpen] = useState(opened);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(emailError);
  const [otpSent, setOtpSent] = useState(initialOtpSent);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail] = useState('user@example.com');

  const providers = [
    { name: 'google', displayName: 'Google', icon: IconBrandGoogle, color: '#4285F4', bg: '#ffffff', textColor: '#1f1f1f' },
    { name: 'github', displayName: 'GitHub', icon: IconBrandGithub, color: '#ffffff', bg: '#24292e', textColor: '#ffffff' },
  ];

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpCode('');
  };

  return (
    <Drawer
      opened={isOpen}
      onClose={() => setIsOpen(false)}
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
              setOtpSent(true);
            }}
          >
            <Stack gap="xs">
              <TextInput
                placeholder="Enter your email address"
                leftSection={<IconMail size={18} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.currentTarget.value);
                  setError('');
                }}
                error={error}
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
};

const meta: Meta<typeof LoginDrawerStory> = {
  title: 'Components/LoginDrawer',
  component: LoginDrawerStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Login drawer with magic link email authentication and social login providers (Google, GitHub). Supports OTP code verification.',
      },
    },
  },
  argTypes: {
    opened: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    loadingProvider: {
      control: 'select',
      options: [null, 'magic', 'otp', 'google', 'github'],
    },
    emailError: { control: 'text' },
    otpSent: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof LoginDrawerStory>;

// Default opened state
export const Default: Story = {
  args: {
    opened: true,
  },
};

// Closed state (shows how to trigger)
export const Closed: Story = {
  args: {
    opened: false,
  },
};

// With email validation error
export const WithEmailError: Story = {
  args: {
    opened: true,
    emailError: 'Please enter a valid email address',
  },
};

// Loading state - magic link
export const LoadingMagicLink: Story = {
  args: {
    opened: true,
    isLoading: true,
    loadingProvider: 'magic',
  },
};

// Loading state - Google
export const LoadingGoogle: Story = {
  args: {
    opened: true,
    isLoading: true,
    loadingProvider: 'google',
  },
};

// Loading state - GitHub
export const LoadingGitHub: Story = {
  args: {
    opened: true,
    isLoading: true,
    loadingProvider: 'github',
  },
};

// OTP Verification View
export const OTPVerification: Story = {
  args: {
    opened: true,
    otpSent: true,
  },
};

// OTP Verification - Loading
export const OTPVerificationLoading: Story = {
  args: {
    opened: true,
    otpSent: true,
    isLoading: true,
    loadingProvider: 'otp',
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    opened: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Mobile view - OTP
export const MobileViewOTP: Story = {
  args: {
    opened: true,
    otpSent: true,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
