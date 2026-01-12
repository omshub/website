import { Suspense } from 'react';
import { Container, Skeleton, Box, Stack, SimpleGrid } from '@mantine/core';
import backend from '@/lib/firebase/index';
import { getCoursesDataStatic } from '@/lib/staticData';
import { mapDynamicCoursesDataToCourses } from '@/lib/utilities';
import { courseFields } from '@/lib/constants';
import { mapPayloadToArray } from '@/utilities';
import HeroSection from './_components/HeroSection';
import CoursesTable from './_components/CoursesTable';

const { getCourses } = backend;

// Loading skeleton for the table
function TableSkeleton() {
  return (
    <Container size="xl" py="xl">
      <Skeleton height={32} width={200} mb="md" />
      <Skeleton height={400} radius="lg" />
    </Container>
  );
}

export default async function HomePage() {
  const [coursesDataDynamic, coursesDataStatic] = await Promise.all([
    getCourses(),
    getCoursesDataStatic(),
  ]);
  const coursesData = mapDynamicCoursesDataToCourses(
    coursesDataDynamic,
    coursesDataStatic
  );

  // Calculate stats on server
  const coursesArray = mapPayloadToArray(coursesData, courseFields.NAME);
  const stats = {
    totalCourses: coursesArray.length,
    totalReviews: coursesArray.reduce(
      (sum, course) => sum + (course.numReviews || 0),
      0
    ),
    hoursSuffered: Math.round(
      coursesArray.reduce(
        (sum, course) => sum + ((course.avgWorkload || 0) * (course.numReviews || 0)),
        0
      )
    ),
  };

  return (
    <>
      {/* Hero renders immediately on server - no JS required */}
      <HeroSection stats={stats} />

      {/* Table loads with Suspense for streaming */}
      <Suspense fallback={<TableSkeleton />}>
        <CoursesTable allCourseData={coursesData} />
      </Suspense>
    </>
  );
}
