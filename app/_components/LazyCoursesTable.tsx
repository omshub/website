'use client';

import dynamic from 'next/dynamic';
import { Container, Skeleton } from '@mantine/core';
import { Course, TCourseId } from '@/lib/types';

const CoursesTable = dynamic(() => import('./CoursesTable'), {
  ssr: false,
  loading: () => (
    <Container size="xl" py="xl">
      <Skeleton height={32} width={200} mb="md" />
      <Skeleton height={400} radius="lg" />
    </Container>
  ),
});

interface LazyCoursesTableProps {
  allCourseData: Record<TCourseId, Course>;
}

export default function LazyCoursesTable({ allCourseData }: LazyCoursesTableProps) {
  return <CoursesTable allCourseData={allCourseData} />;
}
