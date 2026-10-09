'use client';

import dynamic from 'next/dynamic';
import { Container, Skeleton, Stack } from '@mantine/core';

const ScheduleContent = dynamic(() => import('./ScheduleContent'), {
  ssr: false,
  loading: () => (
    <Container size="lg" py="xl">
      <Stack gap="md">
        <Skeleton height={200} radius="lg" />
        <Skeleton height={60} radius="md" />
        <Skeleton height={400} radius="lg" />
      </Stack>
    </Container>
  ),
});

import { Course, TCourseId } from '@/lib/types';

interface LazyScheduleContentProps {
  allCourseData: Record<TCourseId, Course>;
}

export default function LazyScheduleContent({ allCourseData }: LazyScheduleContentProps) {
  return <ScheduleContent allCourseData={allCourseData} />;
}
