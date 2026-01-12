import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect } from 'storybook/test';
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Group,
  Kbd,
  Text,
  Container,
  Divider,
  ThemeIcon,
  Menu,
  UnstyledButton,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconBrandGithub,
  IconSearch,
  IconChevronDown,
  IconBook,
  IconClock,
  IconCalendar,
  IconInfoCircle,
  IconUser,
  IconFileText,
  IconLogout,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

const navLinks = [
  { label: 'Recents', href: '/recents', icon: IconClock },
  { label: 'Schedule', href: '/schedule', icon: IconCalendar },
  { label: 'About', href: '/about', icon: IconInfoCircle },
];

// Simplified NavBar for Storybook (without context dependencies)
interface NavBarStoryProps {
  isLoggedIn?: boolean;
  isDarkMode?: boolean;
  userName?: string;
  userEmail?: string;
  userPhoto?: string | null;
}

const NavBarStory = ({
  isLoggedIn = false,
  isDarkMode = false,
  userName = 'Test User',
  userEmail = 'user@gatech.edu',
  userPhoto = null,
}: NavBarStoryProps) => {
  const [darkMode, setDarkMode] = useState(isDarkMode);

  return (
    <Box
      component="header"
      style={{
        backgroundColor: GT_COLORS.navy,
        borderBottom: `1px solid ${GT_COLORS.techGold}20`,
      }}
    >
      <Container size="xl">
        <Group h={64} justify="space-between">
          {/* Logo and Nav Links */}
          <Group gap="xl">
            <Box style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <Group gap="xs">
                <ThemeIcon
                  size={36}
                  radius="md"
                  variant="gradient"
                  gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
                >
                  <IconBook size={20} color={GT_COLORS.navy} />
                </ThemeIcon>
                <Text size="xl" fw={700} c="white">
                  <Text component="span" style={{ color: GT_COLORS.techGold }} inherit>OMS</Text>Hub
                </Text>
              </Group>
            </Box>

            {/* Desktop Navigation */}
            <Group gap={4}>
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="subtle"
                  size="sm"
                  fw={500}
                  leftSection={<link.icon size={16} />}
                  onClick={() => console.log('Navigate to:', link.href)}
                  styles={{
                    root: {
                      color: 'rgba(255,255,255,0.85)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Group>
          </Group>

          {/* Right Side Actions */}
          <Group gap="sm">
            {/* Search Button */}
            <Button
              variant="default"
              leftSection={<IconSearch size={14} />}
              rightSection={
                <Group gap={4}>
                  <Kbd size="xs" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>⌘</Kbd>
                  <Kbd size="xs" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}>K</Kbd>
                </Group>
              }
              onClick={() => console.log('Open spotlight search')}
              styles={{
                root: {
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderColor: 'rgba(255,255,255,0.25)',
                  },
                },
              }}
            >
              Search courses...
            </Button>

            <Divider orientation="vertical" color="rgba(255,255,255,0.15)" h={24} style={{ alignSelf: 'center' }} />

            <ActionIcon
              variant="subtle"
              title="GitHub"
              onClick={() => console.log('Open GitHub')}
              styles={{
                root: {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                  },
                },
              }}
            >
              <IconBrandGithub size={18} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle light/dark mode"
              styles={{
                root: {
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                  },
                },
              }}
            >
              {darkMode ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>

            {!isLoggedIn ? (
              <Button
                variant="filled"
                size="sm"
                onClick={() => console.log('Open login drawer')}
                leftSection={<IconUser size={16} />}
                styles={{
                  root: {
                    backgroundColor: GT_COLORS.techGold,
                    color: GT_COLORS.navy,
                    '&:hover': {
                      backgroundColor: GT_COLORS.buzzGold,
                    },
                  },
                }}
              >
                Sign In
              </Button>
            ) : (
              <Menu shadow="lg" width={220} position="bottom-end" radius="md">
                <Menu.Target>
                  <UnstyledButton>
                    <Group gap="xs">
                      <Avatar
                        src={userPhoto}
                        alt={userName}
                        radius="xl"
                        size={36}
                        style={{ border: `2px solid ${GT_COLORS.techGold}` }}
                      />
                      <IconChevronDown size={14} color="rgba(255,255,255,0.7)" />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    <Text size="sm" fw={600} truncate>
                      {userName}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {userEmail}
                    </Text>
                  </Menu.Label>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconFileText size={16} />}
                    onClick={() => console.log('Navigate to My Reviews')}
                  >
                    My Reviews
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    onClick={() => console.log('Sign out')}
                  >
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

const meta: Meta<typeof NavBarStory> = {
  title: 'Navigation/NavBar',
  component: NavBarStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main navigation bar with OMSHub logo, navigation links (Recents, Schedule, About), search button, theme toggle, and user authentication.',
      },
    },
  },
  argTypes: {
    isLoggedIn: { control: 'boolean' },
    isDarkMode: { control: 'boolean' },
    userName: { control: 'text' },
    userEmail: { control: 'text' },
    userPhoto: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof NavBarStory>;

// Logged out state
export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
  },
};

// Logged in state
export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    userName: 'George Burdell',
    userEmail: 'gburdell@gatech.edu',
  },
};

// Logged in with custom photo
export const WithCustomPhoto: Story = {
  args: {
    isLoggedIn: true,
    userName: 'Photo User',
    userEmail: 'photo@gatech.edu',
    userPhoto: 'https://i.pravatar.cc/150?img=3',
  },
};

// Dark mode
export const DarkMode: Story = {
  args: {
    isLoggedIn: true,
    isDarkMode: true,
    userName: 'Night Owl',
    userEmail: 'owl@gatech.edu',
  },
};

// Interaction test: Theme toggle
export const ThemeToggleInteraction: Story = {
  args: {
    isLoggedIn: false,
    isDarkMode: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click the theme toggle button
    const themeToggle = canvas.getByRole('button', { name: /toggle light\/dark mode/i });
    await expect(themeToggle).toBeInTheDocument();

    // Click to toggle theme
    await userEvent.click(themeToggle);
  },
};

// Interaction test: Sign In button
export const SignInInteraction: Story = {
  args: {
    isLoggedIn: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the Sign In button
    const signInButton = canvas.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeInTheDocument();

    // Click sign in button
    await userEvent.click(signInButton);
  },
};

// Interaction test: Search button
export const SearchInteraction: Story = {
  args: {
    isLoggedIn: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find the search button (contains "Search courses..." text)
    const searchButton = canvas.getByText('Search courses...');
    await expect(searchButton).toBeInTheDocument();

    // Click search
    await userEvent.click(searchButton);
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    isLoggedIn: true,
    userName: 'Mobile User',
    userEmail: 'mobile@gatech.edu',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
