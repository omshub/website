'use client';

import {
  Container,
  Title,
  Text,
  Paper,
  Box,
  Badge,
  Stack,
  List,
  ThemeIcon,
} from '@mantine/core';
import {
  IconShield,
  IconEye,
  IconDatabase,
  IconLock,
  IconTrash,
  IconMail,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <Paper p="xl" radius="lg" withBorder mb="lg">
      <Stack gap="md">
        <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeIcon size="lg" radius="md" variant="light" color="violet">
            {icon}
          </ThemeIcon>
          <Title order={2} size="h4" fw={600}>
            {title}
          </Title>
        </Box>
        <Box>{children}</Box>
      </Stack>
    </Paper>
  );
}

export default function PrivacyPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        py="xl"
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          borderBottom: `3px solid ${GT_COLORS.techGold}`,
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              Privacy First
            </Badge>
            <Title order={1} c="white" ta="center" fw={700}>
              Privacy Policy
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={600}>
              Your privacy matters to us. Here&apos;s how we handle your data with transparency and respect.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="md" py="xl">
        <Text size="sm" c="dimmed" mb="xl">
          Last updated: January 2025
        </Text>

        <Section icon={<IconEye size={20} />} title="Information We Collect">
          <Text size="sm" c="dimmed" mb="sm">
            When you use OMSHub, we collect minimal information necessary to provide our services:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              <Text size="sm" c="dimmed">
                <strong>Account Information:</strong> When you sign in with Google, we receive your name, email, and profile picture to identify your account.
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">
                <strong>Reviews:</strong> Course reviews you submit, including ratings and comments.
              </Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">
                <strong>Usage Data:</strong> Anonymous analytics to understand how the site is used and improve the experience.
              </Text>
            </List.Item>
          </List>
        </Section>

        <Section icon={<IconDatabase size={20} />} title="How We Use Your Information">
          <Text size="sm" c="dimmed" mb="sm">
            We use your information solely to:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              <Text size="sm" c="dimmed">Display your reviews to help other students</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">Allow you to manage and delete your own reviews</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">Improve the website based on usage patterns</Text>
            </List.Item>
          </List>
        </Section>

        <Section icon={<IconShield size={20} />} title="What We Don't Do">
          <Text size="sm" c="dimmed" mb="sm">
            OMSHub is committed to respecting your privacy:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              <Text size="sm" c="dimmed">We never sell your personal information</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">We don&apos;t share your email with third parties</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">We don&apos;t use your data for advertising</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">We don&apos;t track you across other websites</Text>
            </List.Item>
          </List>
        </Section>

        <Section icon={<IconLock size={20} />} title="Data Security">
          <Text size="sm" c="dimmed">
            Your data is stored securely using Supabase, which provides enterprise-grade security with PostgreSQL. We use HTTPS encryption for all data transmission and follow security best practices for our codebase.
          </Text>
        </Section>

        <Section icon={<IconTrash size={20} />} title="Your Rights">
          <Text size="sm" c="dimmed" mb="sm">
            You have full control over your data:
          </Text>
          <List size="sm" spacing="xs">
            <List.Item>
              <Text size="sm" c="dimmed">Delete any of your reviews at any time</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">Request deletion of your account and all associated data</Text>
            </List.Item>
            <List.Item>
              <Text size="sm" c="dimmed">Access and export your review data</Text>
            </List.Item>
          </List>
        </Section>

        <Section icon={<IconMail size={20} />} title="Contact Us">
          <Text size="sm" c="dimmed">
            If you have questions about this privacy policy or your data, you can reach us through our GitHub repository or community Discord. As an open-source project, our practices are transparent and open to community feedback.
          </Text>
        </Section>

        <Paper p="lg" radius="lg" withBorder mt="xl">
          <Text size="sm" c="dimmed" ta="center">
            OMSHub is an open-source, non-profit project. Our code is publicly available on GitHub, so you can verify exactly how we handle your data.
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
