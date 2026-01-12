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
} from '@mantine/core';
import {
  IconMail,
  IconBrandGoogle,
  IconBrandGithub,
  IconBrandFacebook,
  IconBook,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

interface LoginDrawerStoryProps {
  opened: boolean;
  isLoading?: boolean;
  loadingProvider?: string | null;
  emailError?: string;
}

// Simplified LoginDrawer for Storybook (without context dependencies)
const LoginDrawerStory = ({
  opened,
  isLoading = false,
  loadingProvider = null,
  emailError = '',
}: LoginDrawerStoryProps) => {
  const [isOpen, setIsOpen] = useState(opened);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(emailError);

  const providers = [
    { name: 'Google', icon: IconBrandGoogle, color: '#4285F4', bg: '#ffffff', textColor: '#1f1f1f' },
    { name: 'Github', icon: IconBrandGithub, color: '#ffffff', bg: '#24292e', textColor: '#ffffff' },
    { name: 'Facebook', icon: IconBrandFacebook, color: '#ffffff', bg: '#1877F2', textColor: '#ffffff' },
  ];

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
              setError('');
            }}
            error={error}
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
            onClick={() => console.log('Send magic link to:', email)}
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
              onClick={() => console.log('Login with:', provider.name)}
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
                  border: provider.name === 'Google' ? '1px solid #dadce0' : 'none',
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
              Continue with {provider.name === 'Github' ? 'GitHub' : provider.name}
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
};

const meta: Meta<typeof LoginDrawerStory> = {
  title: 'Components/LoginDrawer',
  component: LoginDrawerStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Login drawer with magic link email authentication and social login providers (Google, GitHub, Facebook).',
      },
    },
  },
  argTypes: {
    opened: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    loadingProvider: {
      control: 'select',
      options: [null, 'magic', 'Google', 'Github', 'Facebook'],
    },
    emailError: { control: 'text' },
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
    loadingProvider: 'Google',
  },
};

// Loading state - GitHub
export const LoadingGitHub: Story = {
  args: {
    opened: true,
    isLoading: true,
    loadingProvider: 'Github',
  },
};

// Loading state - Facebook
export const LoadingFacebook: Story = {
  args: {
    opened: true,
    isLoading: true,
    loadingProvider: 'Facebook',
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
