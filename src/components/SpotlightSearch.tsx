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
import { TCourseId } from '@/lib/types';
import backend from '@/lib/firebase/index';
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

// Cache keys and expiration
const CACHE_KEY = 'omshub_spotlight_courses';
const CACHE_TIMESTAMP_KEY = 'omshub_spotlight_courses_timestamp';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

export default function SpotlightSearch({ courses: initialCourses }: SpotlightSearchProps) {
  const router = useRouter();
  const [simpleCourses, setSimpleCourses] = useState<SimpleCourse[]>([]);

  // Initialize with passed courses or fetch from Firebase with caching
  useEffect(() => {
    if (initialCourses && Object.keys(initialCourses).length > 0) {
      setSimpleCourses(
        Object.values(initialCourses).map((c) => ({
          courseId: c.courseId,
          name: c.name,
          aliases: c.aliases || [],
          numReviews: c.numReviews,
          avgDifficulty: c.avgDifficulty,
          avgWorkload: c.avgWorkload,
          avgOverall: c.avgOverall,
        }))
      );
    } else {
      // Check localStorage cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTimestamp) {
        const age = Date.now() - parseInt(cachedTimestamp);
        if (age < CACHE_DURATION_MS) {
          // Use cached data
          setSimpleCourses(JSON.parse(cachedData));
          return;
        }
      }

      // Fetch from Firebase and use static data for names/aliases
      // IMPORTANT: Only include courses that exist in Firebase (not all courses from courses.json)
      const fetchCourses = async () => {
        try {
          const [coursesDataDynamic, coursesDataStatic] = await Promise.all([
            backend.getCourses(),
            getCoursesDataStatic(),
          ]);
          // Only include courses that exist in Firebase (have dynamic data)
          // Use static data for name/aliases, dynamic data for metrics
          const courses: SimpleCourse[] = Object.keys(coursesDataDynamic).map((courseId) => {
            const dynamicData = coursesDataDynamic[courseId as TCourseId];
            const staticData = coursesDataStatic[courseId as TCourseId] || {};
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
          setSimpleCourses(courses);

          // Cache the result
          localStorage.setItem(CACHE_KEY, JSON.stringify(courses));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };
      fetchCourses();
    }
  }, [initialCourses]);

  const actions = useMemo(() => {
    if (simpleCourses.length === 0) return [];

    const formatRating = (value: number | null | undefined): string => {
      if (value === null || value === undefined) return '-';
      return value.toFixed(1);
    };

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
                    {formatRating(course.avgDifficulty)}
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
                    {formatRating(course.avgOverall)}
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
  }, [simpleCourses, router]);

  // Custom filter function that prioritizes alias matches
  const filter: (query: string, actions: SpotlightActionData[]) => SpotlightActionData[] = (query, actions) => {
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
        },
        actionLabel: {
          fontWeight: 600,
          fontSize: 'var(--mantine-font-size-md)',
        },
        actionDescription: {
          color: 'var(--mantine-color-dimmed)',
          fontSize: 'var(--mantine-font-size-sm)',
        },
      }}
    />
  );
}
