'use client';

import Link from 'next/link';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Box,
  Paper,
} from '@mantine/core';
import { IconHome, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, var(--mantine-color-dark-8) 0%, var(--mantine-color-dark-9) 100%)',
      }}
    >
      <Container size="sm" py="xl">
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Stack align="center" gap="lg">
            {/* 404 Display */}
            <Box ta="center">
              <Text
                fw={900}
                style={{
                  fontSize: '8rem',
                  lineHeight: 1,
                  background: 'linear-gradient(135deg, #B3A369 0%, #E5A823 50%, #B3A369 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                404
              </Text>
              <Title order={2} c="white" mt="xs">
                Page Not Found
              </Title>
            </Box>

            {/* Message */}
            <Text c="dimmed" ta="center" maw={400}>
              Looks like this page got lost on the way to class. The page you're looking for doesn't exist or has been moved.
            </Text>

            {/* Search Suggestion */}
            <Paper
              p="md"
              radius="md"
              withBorder
              style={{
                borderColor: 'var(--mantine-color-yellow-6)',
                background: 'rgba(179, 163, 105, 0.1)',
              }}
            >
              <Group gap="sm">
                <IconSearch size={20} color="var(--mantine-color-yellow-5)" />
                <Text size="sm" c="white">
                  Try searching for a course using <kbd style={{
                    background: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '12px'
                  }}>Ctrl+K</kbd>
                </Text>
              </Group>
            </Paper>

            {/* Action Buttons */}
            <Group gap="md" mt="md">
              <Button
                variant="outline"
                color="gray"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => router.back()}
              >
                Go Back
              </Button>
              <Button
                variant="gradient"
                gradient={{ from: 'yellow', to: 'orange', deg: 90 }}
                leftSection={<IconHome size={16} />}
                component={Link}
                href="/"
              >
                Back to Home
              </Button>
            </Group>

            {/* Quick Links */}
            <Stack gap="xs" align="center" mt="lg">
              <Text size="xs" c="dimmed">
                Popular pages:
              </Text>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  component={Link}
                  href="/schedule"
                >
                  Course Schedule
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={() => spotlight.open()}
                >
                  Search Courses
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
