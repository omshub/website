'use client';

import Link from 'next/link';
import {
  Container,
  Group,
  Stack,
  Text,
  Anchor,
  Divider,
  Box,
  ActionIcon,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconBrandDiscord,
  IconBrandReddit,
  IconBrandSlack,
  IconMail,
  IconBook,
  IconHeart,
  IconExternalLink,
} from '@tabler/icons-react';
import { SOCIAL_LINKS } from '@/lib/socialLinks';
import { GT_COLORS } from '@/lib/theme';

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  links: NavLink[];
}

const navLinks: NavSection[] = [
  {
    title: 'Courses',
    links: [
      { label: 'All Courses', href: '/' },
      { label: 'Course Schedule', href: '/schedule' },
      { label: 'Recent Reviews', href: '/recents' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'About OMSHub', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: SOCIAL_LINKS.github, external: true },
      { label: 'Discord', href: SOCIAL_LINKS.discord, external: true },
      { label: 'Reddit', href: SOCIAL_LINKS.reddit, external: true },
      { label: 'Slack', href: SOCIAL_LINKS.slack, external: true },
    ],
  },
];

const socialLinks = [
  { icon: IconBrandGithub, href: SOCIAL_LINKS.github, label: 'GitHub' },
  { icon: IconBrandDiscord, href: SOCIAL_LINKS.discord, label: 'Discord' },
  { icon: IconBrandSlack, href: SOCIAL_LINKS.slack, label: 'Slack' },
  { icon: IconBrandReddit, href: SOCIAL_LINKS.reddit, label: 'Reddit' },
  { icon: IconMail, href: SOCIAL_LINKS.email, label: 'Email' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: GT_COLORS.navy,
        borderTop: `4px solid ${GT_COLORS.techGold}`,
      }}
    >
      <Container size="xl" py="xl">
        {/* Main Footer Content */}
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 4 }}
          spacing="xl"
          mb="xl"
        >
          {/* Brand Section */}
          <Stack gap="md">
            <Group gap="xs">
              <ThemeIcon
                size={40}
                radius="md"
                variant="gradient"
                gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
              >
                <IconBook size={22} color={GT_COLORS.navy} />
              </ThemeIcon>
              <Text size="xl" fw={700} c="white">
                <Text component="span" style={{ color: GT_COLORS.techGold }} inherit>OMS</Text>Hub
              </Text>
            </Group>
            <Text size="sm" style={{ color: 'rgba(255,255,255,0.7)' }} maw={280} lh={1.6}>
              Community-driven course reviews for Georgia Tech's Online Master's programs. Helping students make informed decisions since 2020.
            </Text>
            {/* Social Icons */}
            <Group gap="xs" mt="xs">
              {socialLinks.map((social) => (
                <ActionIcon
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="subtle"
                  size="lg"
                  radius="md"
                  aria-label={social.label}
                  styles={{
                    root: {
                      color: 'rgba(255,255,255,0.6)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: GT_COLORS.techGold,
                      },
                    },
                  }}
                >
                  <social.icon size={20} stroke={1.5} />
                </ActionIcon>
              ))}
            </Group>
          </Stack>

          {/* Navigation Sections */}
          {navLinks.map((section) => (
            <Stack key={section.title} gap="xs">
              <Text fw={600} c="white" size="sm" tt="uppercase" style={{ letterSpacing: 0.5 }}>
                {section.title}
              </Text>
              {section.links.map((link) =>
                link.external ? (
                  <Anchor
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    c="white"
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'color 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      minHeight: 24,
                      padding: '4px 0',
                    }}
                  >
                    {link.label}
                    <IconExternalLink size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  </Anchor>
                ) : (
                  <Anchor
                    key={link.label}
                    component={Link}
                    href={link.href}
                    size="sm"
                    c="white"
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      transition: 'color 0.2s',
                      minHeight: 24,
                      padding: '4px 0',
                    }}
                  >
                    {link.label}
                  </Anchor>
                )
              )}
            </Stack>
          ))}
        </SimpleGrid>

        <Divider color={`${GT_COLORS.techGold}30`} mb="md" />

        {/* Bottom Bar */}
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            &copy; {currentYear} OMSHub. Not affiliated with Georgia Tech.
          </Text>
          <Group gap={4}>
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Made with
            </Text>
            <IconHeart size={14} color={GT_COLORS.techGold} fill={GT_COLORS.techGold} />
            <Text size="xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              by the OMSCS community
            </Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
