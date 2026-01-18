'use client';

import { useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  ThemeIcon,
  Paper,
} from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { GT_COLORS } from '@/lib/theme';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <Container size="sm" py={80}>
      <Paper radius="lg" p="xl" withBorder>
        <Stack align="center" gap="lg">
          <ThemeIcon
            size={80}
            radius="xl"
            variant="light"
            color="red"
          >
            <IconAlertTriangle size={40} />
          </ThemeIcon>

          <Stack align="center" gap="xs">
            <Title order={2} ta="center">
              Something went wrong
            </Title>
            <Text c="dimmed" ta="center" maw={400}>
              We encountered an unexpected error. Please try again or return to
              the home page.
            </Text>
          </Stack>

          {process.env.NODE_ENV === 'development' && error.message && (
            <Paper
              p="md"
              radius="md"
              withBorder
              style={{
                backgroundColor: 'var(--mantine-color-red-0)',
                borderColor: 'var(--mantine-color-red-3)',
              }}
            >
              <Text size="sm" c="red.8" style={{ fontFamily: 'monospace' }}>
                {error.message}
              </Text>
            </Paper>
          )}

          <Group>
            <Button
              variant="filled"
              leftSection={<IconRefresh size={18} />}
              onClick={reset}
              styles={{
                root: {
                  backgroundColor: GT_COLORS.techGold,
                  color: GT_COLORS.navy,
                  '&:hover': {
                    backgroundColor: '#EAAA00',
                  },
                },
              }}
            >
              Try again
            </Button>
            <Button
              component={Link}
              href="/"
              variant="outline"
              leftSection={<IconHome size={18} />}
              color="dark"
            >
              Go home
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
