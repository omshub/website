'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Group,
  Button,
  Text,
  Box,
  Burger,
  Drawer,
  Stack,
  ActionIcon,
  useMantineColorScheme,
  Menu,
  Avatar,
  UnstyledButton,
  Container,
  Kbd,
  Divider,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { spotlight } from '@mantine/spotlight';
import {
  IconSun,
  IconMoon,
  IconBrandGithub,
  IconMail,
  IconChevronDown,
  IconLogout,
  IconFileText,
  IconSearch,
  IconBook,
  IconClock,
  IconCalendar,
  IconInfoCircle,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useMenu } from '@/context/MenuContext';
import { FirebaseAuthUser } from '@/context/types';
import { TNullable } from '@/lib/types';
import { GT_COLORS } from '@/lib/theme';

const navLinks = [
  { label: 'Recents', href: '/recents', icon: IconClock },
  { label: 'Schedule', href: '/schedule', icon: IconCalendar },
  { label: 'About', href: '/about', icon: IconInfoCircle },
];

export function NavBarMantine() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const [mounted, setMounted] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === 'dark';

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const authContext: TNullable<any> = useAuth();
  const user: TNullable<FirebaseAuthUser> = authContext?.user;
  const loading: TNullable<boolean> = authContext?.loading;
  const logout = authContext?.logout;

  const { handleLoginOpen, loginOpen, handleLoginClose } = useMenu();

  return (
    <Box
      component="header"
      style={{
        backgroundColor: GT_COLORS.navy,
        borderBottom: `1px solid ${GT_COLORS.techGold}20`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Container size="xl">
        <Group h={64} justify="space-between">
          {/* Logo and Nav Links */}
          <Group gap="xl">
            <Link href="/" style={{ textDecoration: 'none' }}>
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
            </Link>

            {/* Desktop Navigation */}
            <Group gap={4} visibleFrom="md">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  variant="subtle"
                  size="sm"
                  fw={500}
                  leftSection={<link.icon size={16} />}
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
          <Group gap="sm" visibleFrom="sm">
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
              onClick={() => spotlight.open()}
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
              component="a"
              href="https://github.com/omshub/website/"
              target="_blank"
              title="GitHub"
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
              onClick={() => toggleColorScheme()}
              title={mounted ? (dark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle color scheme'}
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
              {mounted ? (dark ? <IconSun size={18} /> : <IconMoon size={18} />) : <IconSun size={18} />}
            </ActionIcon>

            {!loading && (
              <>
                {!user ? (
                  <Button
                    variant="filled"
                    size="sm"
                    onClick={handleLoginOpen}
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
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            radius="xl"
                            size={36}
                            style={{ border: `2px solid ${GT_COLORS.techGold}` }}
                            imageProps={{ referrerPolicy: 'no-referrer' }}
                          />
                          <IconChevronDown size={14} color="rgba(255,255,255,0.7)" />
                        </Group>
                      </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>
                        <Text size="sm" fw={600} truncate>
                          {user.displayName || user.email}
                        </Text>
                        {user.displayName && (
                          <Text size="xs" c="dimmed" truncate>
                            {user.email}
                          </Text>
                        )}
                      </Menu.Label>
                      <Menu.Divider />
                      <Menu.Item
                        leftSection={<IconFileText size={16} />}
                        component={Link}
                        href="/user/reviews"
                      >
                        My Reviews
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        color="red"
                        leftSection={<IconLogout size={16} />}
                        onClick={logout}
                      >
                        Sign Out
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </>
            )}
          </Group>

          {/* Mobile Menu Button */}
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="sm"
            color="white"
            size="sm"
            aria-label={drawerOpened ? 'Close navigation menu' : 'Open navigation menu'}
          />
        </Group>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="lg"
        title={
          <Group gap="xs">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              <IconBook size={18} color={GT_COLORS.navy} />
            </ThemeIcon>
            <Text size="xl" fw={700}>
              <Text component="span" style={{ color: GT_COLORS.techGold }} inherit>OMS</Text>Hub
            </Text>
          </Group>
        }
        hiddenFrom="sm"
        zIndex={1000}
        styles={{
          header: {
            borderBottom: `1px solid var(--mantine-color-gray-2)`,
          },
        }}
      >
        <Stack gap="xs">
          {/* Search */}
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconSearch size={18} />}
            onClick={() => { spotlight.open(); closeDrawer(); }}
            fullWidth
            size="md"
            justify="flex-start"
          >
            Search courses...
          </Button>

          <Divider />

          {/* Navigation Links */}
          {navLinks.map((link) => (
            <Button
              key={link.href}
              component={Link}
              href={link.href}
              variant="subtle"
              color="gray"
              fullWidth
              justify="flex-start"
              size="md"
              leftSection={<link.icon size={18} />}
              onClick={closeDrawer}
            >
              {link.label}
            </Button>
          ))}

          <Divider />

          {/* Actions */}
          <Group>
            <ActionIcon
              variant="light"
              color="gray"
              onClick={() => toggleColorScheme()}
              size="lg"
            >
              {mounted ? (dark ? <IconSun size={18} /> : <IconMoon size={18} />) : <IconSun size={18} />}
            </ActionIcon>

            <ActionIcon
              variant="light"
              color="gray"
              component="a"
              href="https://github.com/omshub/website/"
              target="_blank"
              size="lg"
            >
              <IconBrandGithub size={18} />
            </ActionIcon>
          </Group>

          <Divider />

          {/* Auth */}
          {!loading && !user && (
            <Button
              variant="filled"
              size="md"
              onClick={() => { handleLoginOpen(); closeDrawer(); }}
              leftSection={<IconUser size={18} />}
              style={{
                backgroundColor: GT_COLORS.techGold,
                color: GT_COLORS.navy,
              }}
            >
              Sign In
            </Button>
          )}

          {!loading && user && (
            <Stack gap="xs">
              <Group gap="sm" p="xs" style={{ backgroundColor: 'var(--mantine-color-default)', borderRadius: 8 }}>
                <Avatar
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  radius="xl"
                  size="md"
                  imageProps={{ referrerPolicy: 'no-referrer' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={600} truncate>
                    {user.displayName || 'User'}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user.email}
                  </Text>
                </div>
              </Group>
              <Button
                component={Link}
                href="/user/reviews"
                variant="light"
                leftSection={<IconFileText size={18} />}
                fullWidth
                justify="flex-start"
                onClick={closeDrawer}
              >
                My Reviews
              </Button>
              <Button
                variant="light"
                color="red"
                leftSection={<IconLogout size={18} />}
                fullWidth
                justify="flex-start"
                onClick={() => { logout(); closeDrawer(); }}
              >
                Sign Out
              </Button>
            </Stack>
          )}
        </Stack>
      </Drawer>

    </Box>
  );
}
