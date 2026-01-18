'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Course, TCourseId } from '@/lib/types';
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
import { courseFields } from '@/lib/constants';
import { mapPayloadToArray } from '@/utilities';
import { GT_COLORS } from '@/lib/theme';

interface CoursesTableProps {
  allCourseData: Record<TCourseId, Course>;
}

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

export default function CoursesTable({ allCourseData }: CoursesTableProps) {
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const coursesArray: Course[] = mapPayloadToArray(
    allCourseData,
    courseFields.NAME
  );

  // Sort courses
  const sortedCourses = useMemo(() => {
    const sorted = [...coursesArray].sort((a, b) => {
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
  }, [coursesArray, sortBy, reverseSortDirection]);

  const setSorting = (field: SortField) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  // Get difficulty badge
  const getDifficultyBadge = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="grayMatter">-</Text>;

    // Use darker colors for better contrast (4.5:1 minimum)
    let bgColor: string;
    let textColor: string;
    let label = 'Easy';

    if (value >= 4) {
      bgColor = '#FDE8E4'; // Light red background
      textColor = '#9E2A20'; // Dark red text (contrast 5.8:1)
      label = 'Hard';
    } else if (value >= 2.5) {
      bgColor = '#FEF3E2'; // Light amber background
      textColor = '#8B5A00'; // Dark amber text (contrast 5.5:1)
      label = 'Medium';
    } else {
      bgColor = '#E8F5E9'; // Light green background
      textColor = '#256029'; // Dark green text (contrast 5.5:1)
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

  // Get workload display - using accessible colors (4.5:1 contrast on white)
  const getWorkloadDisplay = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="dimmed">-</Text>;
    const maxWorkload = 30;
    const percentage = Math.min((value / maxWorkload) * 100, 100);
    // Use accessible text colors and Mantine progress colors
    let textColor: string = '#0d6650'; // Dark teal for text
    let progressColor: string = 'teal';
    if (value >= 20) {
      textColor = '#c92a2a'; // Dark red
      progressColor = 'red';
    } else if (value >= 12) {
      textColor = '#7a5d00'; // Dark amber/gold (5.2:1 on white)
      progressColor = 'yellow';
    }

    return (
      <Tooltip label={`${value.toFixed(1)} hours per week`}>
        <Box w={80}>
          <Text size="xs" fw={600} ta="center" mb={2} style={{ color: textColor }}>
            {Math.round(value)}h/wk
          </Text>
          <Progress value={percentage} size="xs" color={progressColor} radius="xl" aria-label={`Workload: ${Math.round(value)} hours per week`} />
        </Box>
      </Tooltip>
    );
  };

  // Get overall rating display - using accessible colors (4.5:1 contrast on white)
  const getOverallDisplay = (value: number | null | undefined) => {
    if (value === null || value === undefined) return <Text size="sm" c="dimmed">-</Text>;
    // Use accessible text colors and Mantine icon colors
    let textColor: string = '#c92a2a'; // Dark red
    let iconColor: string = 'var(--mantine-color-red-filled)';
    if (value >= 4) {
      textColor = '#256029'; // Dark green (5.5:1 on white)
      iconColor = 'var(--mantine-color-green-filled)';
    } else if (value >= 3) {
      textColor = '#0d6650'; // Dark teal (5.3:1 on white)
      iconColor = 'var(--mantine-color-teal-filled)';
    }

    return (
      <Group gap={4} justify="center">
        <IconStar size={14} fill={iconColor} color={iconColor} />
        <Text size="sm" fw={600} style={{ color: textColor }}>
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
                        <Badge size="xs" variant="filled" color="dark">
                          {course.courseId}
                        </Badge>
                        {course.url && (
                          <Tooltip label="View on Georgia Tech website" withArrow>
                            <Anchor
                              href={course.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`View ${course.name} on Georgia Tech website (opens in new tab)`}
                              style={{
                                lineHeight: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 24,
                                minHeight: 24,
                                padding: 4,
                              }}
                            >
                              <IconExternalLink size={14} aria-hidden="true" />
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
                      variant="filled"
                      size="sm"
                      style={course.numReviews ? { backgroundColor: '#1971c2', color: 'white' } : undefined}
                      color={course.numReviews ? undefined : 'gray'}
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
}
