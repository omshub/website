'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { rem, Group, Text, Badge } from '@mantine/core';
import { Spotlight, SpotlightActionData } from '@mantine/spotlight';
import {
  IconSearch,
  IconFlame,
  IconClock,
  IconStar,
  IconMessageCircle,
} from '@tabler/icons-react';
import { TCourseId, CourseDataDynamic } from '@/lib/types';
import { getCoursesDataStatic } from '@/lib/staticData';

interface SimpleCourse {
  courseId: string;
  name: string;
  aliases: string[];
  numReviews?: number;
  avgDifficulty?: number | null;
  avgWorkload?: number | null;
  avgOverall?: number | null;
}

interface SpotlightSearchProps {
  courses?: Record<TCourseId, SimpleCourse>;
}

export const mapInitialCourses = (
  initialCourses?: Record<TCourseId, SimpleCourse>
): SimpleCourse[] =>
  initialCourses
    ? Object.values(initialCourses).map((c) => ({
        courseId: c.courseId,
        name: c.name,
        aliases: c.aliases || [],
        numReviews: c.numReviews,
        avgDifficulty: c.avgDifficulty,
        avgWorkload: c.avgWorkload,
        avgOverall: c.avgOverall,
      }))
    : [];

export const fetchSimpleCourses = async (): Promise<SimpleCourse[]> => {
  const [courseStatsResponse, coursesDataStatic] = await Promise.all([
    fetch('https://raw.githubusercontent.com/omshub/data/main/static/course-stats.json')
      .then(res => res.ok ? res.json() : {}),
    getCoursesDataStatic(),
  ]);
  const coursesDataDynamic = courseStatsResponse as Record<TCourseId, CourseDataDynamic>;
  // Include ALL courses from data repo, add stats where available
  return (Object.keys(coursesDataStatic) as TCourseId[])
    .filter((courseId) => !coursesDataStatic[courseId]?.isDeprecated)
    .map((courseId) => {
      const staticData = coursesDataStatic[courseId];
      const dynamicData = coursesDataDynamic[courseId];
      return {
        courseId,
        name: staticData.name || courseId,
        aliases: staticData.aliases || [],
        numReviews: dynamicData?.numReviews || 0,
        avgDifficulty: dynamicData?.avgDifficulty ?? null,
        avgWorkload: dynamicData?.avgWorkload ?? null,
        avgOverall: dynamicData?.avgOverall ?? null,
      };
    });
};

export const formatSpotlightRating = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(1);
};

export const buildSpotlightActions = (
  simpleCourses: SimpleCourse[],
  router: ReturnType<typeof useRouter>
) => {
  if (simpleCourses.length === 0) return [];

  return simpleCourses
    .map((course) => {
      // Format aliases like: (IIS) or (GIOS, IOS, OS)
      const aliasStr = course.aliases?.length ? ` (${course.aliases.join(', ')})` : '';

      // Build description with icons for metrics
      const hasStats = course.numReviews && course.numReviews > 0;

      const description = (
        <Group gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed">{course.courseId}{aliasStr}</Text>
          {hasStats && (
            <>
              {course.avgDifficulty !== null && course.avgDifficulty !== undefined && (
                <Badge
                  size="xs"
                  variant="light"
                  color="orange"
                  leftSection={<IconFlame size={10} />}
                >
                  {formatSpotlightRating(course.avgDifficulty)}
                </Badge>
              )}
              {course.avgWorkload !== null && course.avgWorkload !== undefined && (
                <Badge
                  size="xs"
                  variant="light"
                  color="cyan"
                  leftSection={<IconClock size={10} />}
                >
                  {Math.round(course.avgWorkload)}h/wk
                </Badge>
              )}
              {course.avgOverall !== null && course.avgOverall !== undefined && (
                <Badge
                  size="xs"
                  variant="light"
                  color="yellow"
                  leftSection={<IconStar size={10} />}
                >
                  {formatSpotlightRating(course.avgOverall)}
                </Badge>
              )}
              <Badge
                size="xs"
                variant="light"
                color="gray"
                leftSection={<IconMessageCircle size={10} />}
              >
                {course.numReviews}
              </Badge>
            </>
          )}
        </Group>
      );

      // Keywords with aliases FIRST for higher search priority
      // Mantine Spotlight searches keywords in order, so aliases first = higher priority
      const keywords = [
        ...(course.aliases || []).map(a => a.toUpperCase()), // Uppercase aliases
        ...(course.aliases || []).map(a => a.toLowerCase()), // Lowercase aliases
        ...(course.aliases || []), // Original case aliases
        course.courseId.toUpperCase(),
        course.courseId.toLowerCase(),
        course.courseId,
        ...course.name.split(' '), // Individual words from name
        course.name,
      ];

      return {
        id: course.courseId,
        label: course.name,
        description,
        onClick: () => router.push(`/course/${course.courseId}`),
        keywords,
      };
    })
    .sort((a, b) => {
      // Default sort by number of reviews (descending)
      const courseA = simpleCourses.find((c) => c.courseId === a.id);
      const courseB = simpleCourses.find((c) => c.courseId === b.id);
      return (courseB?.numReviews || 0) - (courseA?.numReviews || 0);
    });
};

export const filterSpotlightActions = (
  query: string,
  actions: SpotlightActionData[],
  simpleCourses: SimpleCourse[]
): SpotlightActionData[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return actions;

  // Score each action based on match quality
  const scoredActions = actions.map((action) => {
    const course = simpleCourses.find((c) => c.courseId === action.id);
    let score = 0;

    if (course) {
      // Highest priority: Exact alias match
      if (course.aliases.some((a) => a.toLowerCase() === normalizedQuery)) {
        score = 1000;
      }
      // High priority: Alias starts with query
      else if (course.aliases.some((a) => a.toLowerCase().startsWith(normalizedQuery))) {
        score = 900;
      }
      // High priority: Alias contains query
      else if (course.aliases.some((a) => a.toLowerCase().includes(normalizedQuery))) {
        score = 800;
      }
      // Medium priority: Course ID exact match
      else if (course.courseId.toLowerCase() === normalizedQuery) {
        score = 700;
      }
      // Medium priority: Course ID starts with query
      else if (course.courseId.toLowerCase().startsWith(normalizedQuery)) {
        score = 600;
      }
      // Medium priority: Course ID contains query
      else if (course.courseId.toLowerCase().includes(normalizedQuery)) {
        score = 500;
      }
      // Lower priority: Name starts with query
      else if (course.name.toLowerCase().startsWith(normalizedQuery)) {
        score = 400;
      }
      // Lower priority: Name contains query
      else if (course.name.toLowerCase().includes(normalizedQuery)) {
        score = 300;
      }
      // Lowest priority: Any keyword match
      else if (Array.isArray(action.keywords) && action.keywords.some((k) => k.toLowerCase().includes(normalizedQuery))) {
        score = 100;
      }
    }

    return { action, score };
  });

  // Filter out non-matches and sort by score (descending), then by reviews
  return scoredActions
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // If same score, sort by number of reviews
      const courseA = simpleCourses.find((c) => c.courseId === a.action.id);
      const courseB = simpleCourses.find((c) => c.courseId === b.action.id);
      return (courseB?.numReviews || 0) - (courseA?.numReviews || 0);
    })
    .map((item) => item.action);
};

export default function SpotlightSearch({ courses: initialCourses }: SpotlightSearchProps) {
  const router = useRouter();
  const [simpleCourses, setSimpleCourses] = useState<SimpleCourse[]>([]);

  // Initialize with passed courses
  useEffect(() => {
    if (initialCourses && Object.keys(initialCourses).length > 0) {
      setSimpleCourses(mapInitialCourses(initialCourses));
    } else {
      // Fetch all courses from data repo
      const fetchCourses = async () => {
        try {
          setSimpleCourses(await fetchSimpleCourses());
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };
      fetchCourses();
    }
  }, [initialCourses]);

  const actions = useMemo(() => {
    return buildSpotlightActions(simpleCourses, router);
  }, [simpleCourses, router]);

  // Custom filter function that prioritizes alias matches
  const filter: (query: string, actions: SpotlightActionData[]) => SpotlightActionData[] = (query, actions) => {
    return filterSpotlightActions(query, actions, simpleCourses);
  };

  return (
    <Spotlight
      actions={actions as unknown as SpotlightActionData[]}
      nothingFound="No courses found..."
      highlightQuery
      filter={filter as any}
      searchProps={{
        leftSection: <IconSearch style={{ width: rem(20), height: rem(20) }} stroke={1.5} />,
        placeholder: 'Search courses...',
      }}
      shortcut={['mod + k', '/']}
      limit={10}
      styles={{
        action: {
          padding: 'var(--mantine-spacing-md)',
          borderRadius: 'var(--mantine-radius-sm)',
          '&[data-selected]': {
            backgroundColor: 'var(--mantine-color-navy-5)',
            '& *': {
              color: 'var(--mantine-color-white)',
            },
          },
        },
        actionLabel: {
          fontWeight: 600,
          fontSize: 'var(--mantine-font-size-md)',
        },
        actionDescription: {
          fontSize: 'var(--mantine-font-size-sm)',
        },
      }}
    />
  );
}
