'use client';

import { Container, Skeleton, Stack, Group } from '@mantine/core';

export default function Loading() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Hero skeleton */}
        <Skeleton height={200} radius="md" />

        {/* Content skeleton */}
        <Group gap="md">
          <Skeleton height={40} width={120} radius="md" />
          <Skeleton height={40} width={120} radius="md" />
          <Skeleton height={40} width={120} radius="md" />
        </Group>

        {/* Cards skeleton */}
        <Group gap="md" grow>
          <Skeleton height={150} radius="md" />
          <Skeleton height={150} radius="md" />
          <Skeleton height={150} radius="md" />
        </Group>

        <Skeleton height={100} radius="md" />
        <Skeleton height={100} radius="md" />
      </Stack>
    </Container>
  );
}
