import { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Link from 'next/link';
import {
  Container,
  Paper,
  Table,
  Badge,
  Anchor,
  Center,
  Text,
  Box,
  Stack,
  Group,
  Title,
  UnstyledButton,
  Tooltip,
  Progress,
} from '@mantine/core';
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconStar,
  IconExternalLink,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

// Mock course data for stories
const mockCourses = [
  {
    courseId: 'CS-6035',
    name: 'Introduction to Information Security',
    avgDifficulty: 2.3,
    avgWorkload: 10,
    avgOverall: 4.2,
    numReviews: 245,
    url: 'https://omscs.gatech.edu/cs-6035',
  },
  {
    courseId: 'CS-6250',
    name: 'Computer Networks',
    avgDifficulty: 2.8,
    avgWorkload: 12,
    avgOverall: 3.8,
    numReviews: 312,
    url: 'https://omscs.gatech.edu/cs-6250',
  },
  {
    courseId: 'CS-6515',
    name: 'Graduate Algorithms',
    avgDifficulty: 4.5,
    avgWorkload: 22,
    avgOverall: 3.2,
    numReviews: 180,
    url: 'https://omscs.gatech.edu/cs-6515',
  },
  {
    courseId: 'CS-6750',
    name: 'Human-Computer Interaction',
    avgDifficulty: 1.8,
    avgWorkload: 8,
    avgOverall: 4.5,
    numReviews: 420,
    url: 'https://omscs.gatech.edu/cs-6750',
  },
  {
    courseId: 'CS-7637',
    name: 'Knowledge-Based AI',
    avgDifficulty: 3.0,
    avgWorkload: 15,
    avgOverall: 4.0,
    numReviews: 275,
    url: 'https://omscs.gatech.edu/cs-7637',
  },
  {
    courseId: 'CS-7641',
    name: 'Machine Learning',
    avgDifficulty: 4.2,
    avgWorkload: 20,
    avgOverall: 3.5,
    numReviews: 350,
    url: 'https://omscs.gatech.edu/cs-7641',
  },
  {
    courseId: 'CS-8803-O01',
    name: 'AI, Ethics, and Society',
    avgDifficulty: null,
    avgWorkload: null,
    avgOverall: null,
    numReviews: 0,
    url: null,
  },
];

// Sortable table header
interface ThProps {
  children: React.ReactNode;
  reversed?: boolean;
  sorted?: boolean;
  onSort?: () => void;
  ta?: 'left' | 'center' | 'right';
}

function Th({ children, reversed, sorted, onSort, ta = 'left' }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th style={{ textAlign: ta }}>
      <UnstyledButton onClick={onSort} style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: ta === 'center' ? 'center' : 'flex-start' }}>
        <Text fw={600} size="sm" c="white">
          {children}
        </Text>
        {onSort && <Icon size={14} stroke={1.5} color="white" style={{ opacity: 0.7 }} />}
      </UnstyledButton>
    </Table.Th>
  );
}

type SortField = 'name' | 'courseId' | 'difficulty' | 'workload' | 'overall' | 'reviews';

interface CoursesTableStoryProps {
  courses: typeof mockCourses;
}

const CoursesTableStory = ({ courses }: CoursesTableStoryProps) => {
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  // Sort courses
  const sortedCourses = useMemo(() => {
    const sorted = [...courses].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'courseId':
          comparison = a.courseId.localeCompare(b.courseId);
          break;
        case 'difficulty':
          comparison = (a.avgDifficulty || 0) - (b.avgDifficulty || 0);
          break;
        case 'workload':
          comparison = (a.avgWorkload || 0) - (b.avgWorkload || 0);
          break;
        case 'overall':
          comparison = (a.avgOverall || 0) - (b.avgOverall || 0);
          break;
        case 'reviews':
          comparison = (a.numReviews || 0) - (b.numReviews || 0);
          break;
      }
      return reverseSortDirection ? -comparison : comparison;
    });
    return sorted;
  }, [courses, sortBy, reverseSortDirection]);

  const setSorting = (field: SortField) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  // Get difficulty badge
  const getDifficultyBadge = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="grayMatter">-</Text>;

    let bgColor: string;
    let textColor: string;
    let label = 'Easy';

    if (value >= 4) {
      bgColor = '#FDE8E4';
      textColor = '#9E2A20';
      label = 'Hard';
    } else if (value >= 2.5) {
      bgColor = '#FEF3E2';
      textColor = '#8B5A00';
      label = 'Medium';
    } else {
      bgColor = '#E8F5E9';
      textColor = '#256029';
      label = 'Easy';
    }

    return (
      <Tooltip label={`${value.toFixed(1)} / 5`}>
        <Badge
          size="sm"
          variant="filled"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {label}
        </Badge>
      </Tooltip>
    );
  };

  // Get workload display
  const getWorkloadDisplay = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="dimmed">-</Text>;
    const maxWorkload = 30;
    const percentage = Math.min((value / maxWorkload) * 100, 100);
    let color: string = 'teal';
    if (value >= 20) color = 'red';
    else if (value >= 12) color = 'yellow';

    return (
      <Tooltip label={`${value.toFixed(1)} hours per week`}>
        <Box w={80}>
          <Text size="xs" fw={600} ta="center" mb={2} c={color}>
            {Math.round(value)}h/wk
          </Text>
          <Progress value={percentage} size="xs" color={color} radius="xl" />
        </Box>
      </Tooltip>
    );
  };

  // Get overall rating display
  const getOverallDisplay = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="dimmed">-</Text>;
    let color: string = 'red';
    if (value >= 4) color = 'green';
    else if (value >= 3) color = 'teal';

    return (
      <Group gap={4} justify="center">
        <IconStar size={14} fill={`var(--mantine-color-${color}-filled)`} color={`var(--mantine-color-${color}-filled)`} />
        <Text size="sm" fw={600} c={color}>
          {value.toFixed(1)}
        </Text>
      </Group>
    );
  };

  return (
    <Container size="xl" py="xl">
      <Box mb="lg">
        <Title order={2} size="h3" fw={600}>
          All Courses
        </Title>
        <Text size="sm" c="grayMatter">
          {sortedCourses.length} courses available across all OMS programs
        </Text>
      </Box>

      <Paper radius="lg" withBorder style={{ overflow: 'auto' }}>
        <Table.ScrollContainer minWidth={700}>
          <Table verticalSpacing="sm" highlightOnHover style={{ minWidth: 700 }}>
            <Table.Thead style={{ backgroundColor: GT_COLORS.navy }}>
              <Table.Tr>
                <Th
                  sorted={sortBy === 'name'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('name')}
                >
                  Course
                </Th>
                <Th
                  sorted={sortBy === 'difficulty'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('difficulty')}
                  ta="center"
                >
                  Difficulty
                </Th>
                <Th
                  sorted={sortBy === 'workload'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('workload')}
                  ta="center"
                >
                  Workload
                </Th>
                <Th
                  sorted={sortBy === 'overall'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('overall')}
                  ta="center"
                >
                  Rating
                </Th>
                <Th
                  sorted={sortBy === 'reviews'}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting('reviews')}
                  ta="center"
                >
                  Reviews
                </Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedCourses.map((course) => (
                <Table.Tr key={course.courseId}>
                  <Table.Td style={{ minWidth: 200, maxWidth: 280 }}>
                    <Stack gap={2}>
                      <Anchor
                        component={Link}
                        href={`/course/${course.courseId}`}
                        fw={500}
                        size="sm"
                        style={{ color: GT_COLORS.boldBlue }}
                      >
                        {course.name}
                      </Anchor>
                      <Group gap={6}>
                        <Badge size="xs" variant="outline" color="gray">
                          {course.courseId}
                        </Badge>
                        {course.url && (
                          <Tooltip label="View on Georgia Tech website" withArrow>
                            <Anchor
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                lineHeight: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <IconExternalLink size={14} />
                            </Anchor>
                          </Tooltip>
                        )}
                      </Group>
                    </Stack>
                  </Table.Td>
                  <Table.Td ta="center">
                    {getDifficultyBadge(course.avgDifficulty)}
                  </Table.Td>
                  <Table.Td>
                    <Center>
                      {getWorkloadDisplay(course.avgWorkload)}
                    </Center>
                  </Table.Td>
                  <Table.Td ta="center">
                    {getOverallDisplay(course.avgOverall)}
                  </Table.Td>
                  <Table.Td ta="center">
                    <Badge
                      variant="light"
                      size="sm"
                      color={course.numReviews ? 'blue' : 'gray'}
                    >
                      {course.numReviews || 0}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>
    </Container>
  );
};

const meta: Meta<typeof CoursesTableStory> = {
  title: 'Course/CoursesTable',
  component: CoursesTableStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sortable table displaying all OMS courses with difficulty, workload, rating, and review count. Features sortable columns and visual indicators for metrics.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CoursesTableStory>;

// Default with all courses
export const Default: Story = {
  args: {
    courses: mockCourses,
  },
};

// Empty state
export const Empty: Story = {
  args: {
    courses: [],
  },
};

// Single course
export const SingleCourse: Story = {
  args: {
    courses: [mockCourses[0]],
  },
};

// Courses with missing data
export const WithMissingData: Story = {
  args: {
    courses: [
      ...mockCourses.slice(0, 3),
      {
        courseId: 'CS-8803-NEW',
        name: 'New Special Topics Course',
        avgDifficulty: null,
        avgWorkload: null,
        avgOverall: null,
        numReviews: 0,
        url: null,
      },
    ],
  },
};

// High workload courses
export const HighWorkloadCourses: Story = {
  args: {
    courses: mockCourses.filter(c => (c.avgWorkload || 0) >= 15),
  },
};

// Easy courses
export const EasyCourses: Story = {
  args: {
    courses: mockCourses.filter(c => (c.avgDifficulty || 5) < 2.5),
  },
};
