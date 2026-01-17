import { Suspense } from 'react';
import { Container, Skeleton, Title, Text, Stack, Box, Badge } from '@mantine/core';
import { getCoursesDataStatic, getCourseStats } from '@/lib/staticData';
import { mapDynamicCoursesDataToCourses } from '@/lib/utilities';
import CoursesTable from '../_components/CoursesTable';
import { GT_COLORS } from '@/lib/theme';

export const metadata = {
  title: 'All Courses | OMSHub',
  description: 'Browse all Georgia Tech OMS courses with reviews, ratings, difficulty scores, and workload information.',
};

// Loading skeleton for the table
function TableSkeleton() {
  return (
    <Container size="xl" py="xl">
      <Skeleton height={32} width={200} mb="md" />
      <Skeleton height={400} radius="lg" />
    </Container>
  );
}

export default async function CoursesPage() {
  const [coursesDataDynamic, coursesDataStatic] = await Promise.all([
    getCourseStats(),
    getCoursesDataStatic(),
  ]);
  const coursesData = mapDynamicCoursesDataToCourses(
    coursesDataDynamic,
    coursesDataStatic
  );

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
              Course Catalog
            </Badge>
            <Title order={1} c="white" ta="center" fw={700}>
              All Courses
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={600}>
              Browse all Georgia Tech OMS courses. View reviews, ratings, difficulty scores, and workload information.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Table loads with Suspense for streaming */}
      <Suspense fallback={<TableSkeleton />}>
        <CoursesTable allCourseData={coursesData} />
      </Suspense>
    </Box>
  );
}
