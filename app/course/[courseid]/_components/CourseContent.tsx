'use client';

import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import CourseActionBar from '@/components/CourseActionBar';
import { useAuth } from '@/context/AuthContext';
import {
  Course,
  Review,
  TCourseId,
} from '@/lib/types';
import {
  IconCopy,
  IconLink,
  IconMessagePlus,
  IconMessageCircle,
  IconSparkles,
  IconClock,
  IconFlame,
  IconStar,
  IconFilter,
  IconCalendar,
  IconChevronDown,
  IconUsers,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Button,
  Center,
  Modal,
  ActionIcon,
  Tooltip,
  Box,
  ThemeIcon,
  SimpleGrid,
  Select,
  Progress,
  Flex,
  TextInput,
  Loader,
} from '@mantine/core';
import { notifyLinkCopied } from '@/utils/notifications';
import { useDisclosure, useDebouncedValue } from '@mantine/hooks';
import Link from 'next/link';
import {
  mapSemesterTermToEmoji,
  mapSemesterTermToName,
} from '@/utilities';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { GT_COLORS } from '@/lib/theme';
import type { Database } from '@/lib/supabase/database.types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

// Map semester id (sp, sm, fa) to term number (1, 2, 3)
const semesterIdToTerm: Record<string, number> = {
  sp: 1,
  sm: 2,
  fa: 3,
};

// Convert Supabase review to Review format
function mapSupabaseReviewToReview(review: SupabaseReview): Review {
  return {
    reviewId: review.id,
    courseId: review.course_id as TCourseId,
    year: review.year,
    semesterId: review.semester as 'sp' | 'sm' | 'fa',
    isLegacy: review.is_legacy,
    reviewerId: review.reviewer_id ?? '',
    isGTVerifiedReviewer: review.is_gt_verified,
    created: new Date(review.created_at).getTime(),
    modified: review.modified_at ? new Date(review.modified_at).getTime() : null,
    body: review.body ?? '',
    upvotes: review.upvotes,
    downvotes: review.downvotes,
    workload: review.workload ?? 0,
    difficulty: (review.difficulty ?? 3) as 1 | 2 | 3 | 4 | 5,
    overall: (review.overall ?? 3) as 1 | 2 | 3 | 4 | 5,
    staffSupport: review.staff_support as 1 | 2 | 3 | 4 | 5 | undefined,
  };
}

const PAGE_SIZE = 20;

interface CourseContentProps {
  courseData: Course;
  initialReviews: Review[];
  initialHasMore: boolean;
  totalReviewCount: number;
}

function getDifficultyInfo(value: number) {
  if (value >= 4) return { label: 'Hard', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
  if (value >= 2.5) return { label: 'Medium', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Easy', color: GT_COLORS.canopyLime, statCssVar: 'var(--stat-color-green)', bgColor: '#F0F7E6', textColor: '#1e4620' };
}

function getWorkloadInfo(value: number) {
  if (value >= 20) return { label: 'Heavy', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
  if (value >= 12) return { label: 'Moderate', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Light', color: GT_COLORS.olympicTeal, statCssVar: 'var(--stat-color-teal)', bgColor: '#E6F5F6', textColor: '#134e4a' };
}

function getRatingInfo(value: number) {
  if (value >= 4) return { label: 'Excellent', color: GT_COLORS.canopyLime, statCssVar: 'var(--stat-color-green)', bgColor: '#F0F7E6', textColor: '#1e4620' };
  if (value >= 3) return { label: 'Good', color: GT_COLORS.olympicTeal, statCssVar: 'var(--stat-color-teal)', bgColor: '#E6F5F6', textColor: '#134e4a' };
  if (value >= 2) return { label: 'Average', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Poor', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
}

export default function CourseContent({
  courseData,
  initialReviews,
  initialHasMore,
  totalReviewCount,
}: CourseContentProps) {
  const {
    courseId,
    name: courseName,
    numReviews: courseNumReviews,
    url: courseUrl,
    avgWorkload: courseAvgWorkload,
    avgDifficulty: courseAvgDifficulty,
    avgOverall: courseAvgOverall,
  } = courseData;

  const [reviewModalOpened, { open: openReviewModal, close: closeReviewModal }] = useDisclosure(false);

  const authContext = useAuth();
  const user = authContext?.user;

  // Infinite scroll state
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialReviews.length);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    notifyLinkCopied();
  };

  // Build query params for API calls
  const buildQueryParams = useCallback((currentOffset: number) => {
    const params = new URLSearchParams({
      courseId,
      paginated: 'true',
      limit: String(PAGE_SIZE),
      offset: String(currentOffset),
    });
    if (selectedYear !== 'all') params.set('year', selectedYear);
    if (selectedSemester !== 'all') params.set('semester', selectedSemester);
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  }, [courseId, selectedYear, selectedSemester, debouncedSearch]);

  // Reset and fetch when filters/search change
  useEffect(() => {
    const fetchFiltered = async () => {
      // Skip if we're at initial state with no filters
      if (selectedYear === 'all' && selectedSemester === 'all' && !debouncedSearch) {
        // Reset to initial state if filters were cleared
        if (reviews !== initialReviews) {
          setReviews(initialReviews);
          setHasMore(initialHasMore);
          setOffset(initialReviews.length);
        }
        return;
      }

      setIsSearching(true);
      setLoading(true);
      try {
        const response = await fetch(`/api/reviews?${buildQueryParams(0)}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const newReviews = Object.values(data.reviews || {}) as Review[];

        setReviews(newReviews);
        setHasMore(data.pagination?.hasMore ?? false);
        setOffset(newReviews.length);
      } catch (error) {
        console.error('Error fetching filtered reviews:', error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    fetchFiltered();
  }, [selectedYear, selectedSemester, debouncedSearch, buildQueryParams]);

  // Load more reviews
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reviews?${buildQueryParams(offset)}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const newReviews = Object.values(data.reviews || {}) as Review[];

      setReviews((prev) => [...prev, ...newReviews]);
      setHasMore(data.pagination?.hasMore ?? false);
      setOffset((prev) => prev + newReviews.length);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, buildQueryParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loaderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  // Get all reviews as array (already an array now)
  const allReviewsArray = useMemo(() => {
    return reviews;
  }, [reviews]);

  // Extract available years and semesters from all reviews
  const { availableYears, availableSemesters } = useMemo(() => {
    const years = new Set<number>();
    const semesters = new Set<string>();

    allReviewsArray.forEach((review) => {
      years.add(review.year);
      semesters.add(review.semesterId);
    });

    return {
      availableYears: Array.from(years).sort((a, b) => b - a), // Descending
      availableSemesters: Array.from(semesters).sort((a, b) => {
        const order = { sp: 1, sm: 2, fa: 3 };
        return (order[a as keyof typeof order] || 0) - (order[b as keyof typeof order] || 0);
      }),
    };
  }, [allReviewsArray]);

  // Reviews are now filtered server-side, so we just use the reviews array directly
  const filteredReviews = useMemo(() => {
    return allReviewsArray;
  }, [allReviewsArray]);

  // Build year options
  const yearOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Years' }];
    availableYears.forEach((year) => {
      options.push({ value: String(year), label: String(year) });
    });
    return options;
  }, [availableYears]);

  // Build semester options
  const semesterOptions = useMemo(() => {
    const options = [{ value: 'all', label: 'All Semesters' }];
    availableSemesters.forEach((sem) => {
      const term = semesterIdToTerm[sem];
      if (term) {
        options.push({
          value: sem,
          label: `${mapSemesterTermToName[term]} ${mapSemesterTermToEmoji[term]}`,
        });
      }
    });
    return options;
  }, [availableSemesters]);

  const difficultyInfo = courseAvgDifficulty ? getDifficultyInfo(Number(courseAvgDifficulty)) : null;
  const workloadInfo = courseAvgWorkload ? getWorkloadInfo(Number(courseAvgWorkload)) : null;
  const ratingInfo = courseAvgOverall ? getRatingInfo(Number(courseAvgOverall)) : null;

  const hasStats = Boolean(courseNumReviews && courseNumReviews > 0);
  const hasReviews = allReviewsArray.length > 0;

  // Current filter description
  const filterDescription = useMemo(() => {
    const parts = [];
    if (selectedYear !== 'all') parts.push(selectedYear);
    if (selectedSemester !== 'all') {
      const term = semesterIdToTerm[selectedSemester];
      if (term) parts.push(mapSemesterTermToName[term]);
    }
    return parts.length > 0 ? parts.join(' ') : null;
  }, [selectedYear, selectedSemester]);

  return (
    <>
      {/* Hero Section - Compact */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          borderBottom: `3px solid ${GT_COLORS.techGold}`,
        }}
      >
        <Container size="lg" py="xl">
          {/* Course Title Row */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            gap="lg"
          >
            <Stack gap="xs" style={{ flex: 1 }}>
              <Group gap="sm">
                <Badge
                  size="lg"
                  radius="sm"
                  variant="gradient"
                  gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
                  style={{ fontWeight: 700 }}
                >
                  {courseId}
                </Badge>
                {courseUrl && (
                  <Tooltip label="Course Website">
                    <ActionIcon
                      component={Link}
                      href={courseUrl}
                      target="_blank"
                      variant="subtle"
                      size="sm"
                      style={{ color: 'rgba(255,255,255,0.7)' }}
                      aria-label="Course Website"
                    >
                      <IconLink size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Copy URL">
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    onClick={handleCopyUrl}
                    aria-label="Copy URL"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    <IconCopy size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
              <Title order={1} c="white" fw={700} size="2rem" lh={1.2}>
                {courseName}
              </Title>
              {hasStats && (
                <Group gap="xs">
                  <Badge
                    variant="light"
                    color="gray"
                    leftSection={<IconUsers size={12} />}
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                  >
                    {courseNumReviews} reviews
                  </Badge>
                </Group>
              )}
            </Stack>

            {/* Add Review Button */}
            {user && (
              <Button
                leftSection={<IconMessagePlus size={18} />}
                size="md"
                onClick={openReviewModal}
                style={{
                  backgroundColor: GT_COLORS.techGold,
                  color: GT_COLORS.navy,
                }}
              >
                Add Review
              </Button>
            )}
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container size="lg" py="xl">
        {/* Course Stats - Single consolidated section */}
        {hasStats && courseAvgWorkload && courseAvgDifficulty && courseAvgOverall && (
          <Paper
            radius="lg"
            withBorder
            mb="xl"
            style={{
              overflow: 'hidden',
            }}
          >
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing={0}>
              {/* Workload */}
              <Box
                p="xl"
                style={{
                  borderRight: '1px solid var(--mantine-color-gray-2)',
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                <Group justify="space-between" align="flex-start" mb="md">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="cyan" radius="xl">
                        <IconClock size={14} />
                      </ThemeIcon>
                      <Text size="sm" c="grayMatter" fw={500}>Weekly Workload</Text>
                    </Group>
                    <Group gap="xs" align="baseline">
                      <Text size="2rem" fw={700} lh={1} style={{ color: workloadInfo?.statCssVar }}>
                        {Number(courseAvgWorkload).toFixed(1)}
                      </Text>
                      <Text size="sm" c="grayMatter">hrs/week</Text>
                    </Group>
                  </Stack>
                  <Badge
                    variant="filled"
                    size="sm"
                    style={{ backgroundColor: workloadInfo?.bgColor, color: workloadInfo?.textColor }}
                  >
                    {workloadInfo?.label}
                  </Badge>
                </Group>
                <Progress
                  value={Math.min((Number(courseAvgWorkload) / 30) * 100, 100)}
                  size="sm"
                  radius="xl"
                  color={workloadInfo?.color}
                  style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}
                  aria-label={`Workload: ${Number(courseAvgWorkload).toFixed(1)} hours per week`}
                />
                <Text size="xs" c="grayMatter" mt="xs">
                  Based on {courseNumReviews} student reports
                </Text>
              </Box>

              {/* Difficulty */}
              <Box
                p="xl"
                style={{
                  borderRight: '1px solid var(--mantine-color-gray-2)',
                  borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
              >
                <Group justify="space-between" align="flex-start" mb="md">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="orange" radius="xl">
                        <IconFlame size={14} />
                      </ThemeIcon>
                      <Text size="sm" c="grayMatter" fw={500}>Difficulty</Text>
                    </Group>
                    <Group gap="xs" align="baseline">
                      <Text size="2rem" fw={700} lh={1} style={{ color: difficultyInfo?.statCssVar }}>
                        {Number(courseAvgDifficulty).toFixed(1)}
                      </Text>
                      <Text size="sm" c="grayMatter">/ 5</Text>
                    </Group>
                  </Stack>
                  <Badge
                    variant="filled"
                    size="sm"
                    style={{ backgroundColor: difficultyInfo?.bgColor, color: difficultyInfo?.textColor }}
                  >
                    {difficultyInfo?.label}
                  </Badge>
                </Group>
                <Progress
                  value={(Number(courseAvgDifficulty) / 5) * 100}
                  size="sm"
                  radius="xl"
                  color={difficultyInfo?.color}
                  style={{ backgroundColor: 'var(--mantine-color-gray-1)' }}
                  aria-label={`Difficulty: ${Number(courseAvgDifficulty).toFixed(1)} out of 5`}
                />
                <Group gap={4} mt="xs">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      w={6}
                      h={6}
                      style={{
                        borderRadius: '50%',
                        backgroundColor: i <= Math.round(Number(courseAvgDifficulty))
                          ? difficultyInfo?.color
                          : 'var(--mantine-color-gray-3)',
                      }}
                    />
                  ))}
                  <Text size="xs" c="grayMatter" ml={4}>
                    {difficultyInfo?.label === 'Hard' ? 'Challenging content' :
                     difficultyInfo?.label === 'Medium' ? 'Moderate challenge' :
                     'Beginner friendly'}
                  </Text>
                </Group>
              </Box>

              {/* Overall Rating */}
              <Box p="xl" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
                <Group justify="space-between" align="flex-start" mb="md">
                  <Stack gap={4}>
                    <Group gap="xs">
                      <ThemeIcon size="sm" variant="light" color="yellow" radius="xl">
                        <IconStar size={14} />
                      </ThemeIcon>
                      <Text size="sm" c="grayMatter" fw={500}>Overall Rating</Text>
                    </Group>
                    <Group gap="xs" align="baseline">
                      <Text size="2rem" fw={700} lh={1} style={{ color: ratingInfo?.statCssVar }}>
                        {Number(courseAvgOverall).toFixed(1)}
                      </Text>
                      <Text size="sm" c="grayMatter">/ 5</Text>
                    </Group>
                  </Stack>
                  <Badge
                    variant="filled"
                    size="sm"
                    style={{ backgroundColor: ratingInfo?.bgColor, color: ratingInfo?.textColor }}
                  >
                    {ratingInfo?.label}
                  </Badge>
                </Group>
                <Group gap={4}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <IconStar
                      key={i}
                      size={18}
                      fill={i <= Math.round(Number(courseAvgOverall)) ? GT_COLORS.buzzGold : 'none'}
                      color={i <= Math.round(Number(courseAvgOverall)) ? GT_COLORS.buzzGold : 'var(--mantine-color-gray-4)'}
                    />
                  ))}
                </Group>
                <Text size="xs" c="grayMatter" mt="xs">
                  {Number(courseAvgOverall) >= 4 ? 'Highly recommended by students' :
                   Number(courseAvgOverall) >= 3 ? 'Generally well received' :
                   'Mixed student feedback'}
                </Text>
              </Box>
            </SimpleGrid>
          </Paper>
        )}

        {/* Search and Filters */}
        {hasReviews && (
          <Paper p="md" radius="lg" withBorder mb="xl">
            <Stack gap="md">
              {/* Search */}
              <TextInput
                placeholder="Search reviews..."
                leftSection={<IconSearch size={16} />}
                rightSection={
                  searchQuery ? (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : isSearching ? (
                    <Loader size="xs" />
                  ) : null
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                aria-label="Search reviews"
              />
              {debouncedSearch && (
                <Text size="sm" c="grayMatter">
                  {filteredReviews.length} result{filteredReviews.length !== 1 ? 's' : ''} for "{debouncedSearch}"
                </Text>
              )}

              {/* Filters */}
              <Group gap="md" wrap="wrap">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="gray">
                    <IconFilter size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500} c="grayMatter">Filter:</Text>
                </Group>

                <Select
                  value={selectedYear}
                  onChange={(value) => setSelectedYear(value || 'all')}
                  data={yearOptions}
                  size="sm"
                  w={140}
                  comboboxProps={{ withinPortal: true }}
                  leftSection={<IconCalendar size={14} />}
                  rightSection={<IconChevronDown size={14} />}
                  aria-label="Filter by year"
                  styles={{
                    input: {
                      fontWeight: 500,
                    },
                  }}
                />

                <Select
                  value={selectedSemester}
                  onChange={(value) => setSelectedSemester(value || 'all')}
                  data={semesterOptions}
                  size="sm"
                  w={180}
                  comboboxProps={{ withinPortal: true }}
                  rightSection={<IconChevronDown size={14} />}
                  aria-label="Filter by semester"
                  styles={{
                    input: {
                      fontWeight: 500,
                    },
                  }}
                />

                {(selectedYear !== 'all' || selectedSemester !== 'all' || searchQuery) && (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      setSelectedYear('all');
                      setSelectedSemester('all');
                      setSearchQuery('');
                    }}
                    leftSection={<IconX size={14} />}
                  >
                    Clear filters
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Reviews Section */}
        <Group justify="space-between" mb="lg" data-reviews-section>
          <Group gap="xs">
            <Title order={2} size="h3">
              Reviews
            </Title>
            {filterDescription && (
              <Badge
                variant="light"
                styles={{
                  root: { backgroundColor: '#f1f3f5', color: '#495057' },
                }}
              >
                {filterDescription}
              </Badge>
            )}
          </Group>
          {filteredReviews.length > 0 && (
            <Text size="sm" c="grayMatter">
              {filteredReviews.length} of {totalReviewCount} review{totalReviewCount !== 1 ? 's' : ''}
              {hasMore && ' (scroll for more)'}
            </Text>
          )}
        </Group>

        {filteredReviews.length > 0 ? (
          <>
            <Stack gap="md">
              {filteredReviews.map((value: Review) => (
                <ReviewCard key={value.reviewId} {...value} courseName={courseName} searchHighlight={debouncedSearch} />
              ))}
            </Stack>

            {/* Loading indicator / Intersection target */}
            <Box ref={loaderRef} py="xl">
              {loading && (
                <Center>
                  <Loader color={GT_COLORS.techGold} size="md" />
                </Center>
              )}
              {!loading && hasMore && (
                <Center>
                  <Text size="sm" c="grayMatter">
                    Scroll to load more reviews
                  </Text>
                </Center>
              )}
              {!hasMore && reviews.length > 0 && reviews.length < totalReviewCount && (
                <Center>
                  <Text size="sm" c="grayMatter">
                    All reviews loaded
                  </Text>
                </Center>
              )}
            </Box>
          </>
        ) : (
          <Paper p="xl" radius="lg" withBorder>
            <Stack align="center" gap="lg" py="xl">
              <ThemeIcon
                size={80}
                radius="xl"
                variant="light"
                style={{ backgroundColor: `${GT_COLORS.techGold}20` }}
              >
                <IconMessageCircle size={40} stroke={1.5} color={GT_COLORS.techGold} />
              </ThemeIcon>
              <Stack align="center" gap="xs">
                <Title order={3} ta="center">
                  {hasReviews ? 'No reviews match your filters' : 'No reviews yet'}
                </Title>
                <Text c="grayMatter" ta="center" maw={400}>
                  {hasReviews
                    ? 'Try adjusting your search or filter criteria to see more reviews.'
                    : `Be the first to share your experience with ${courseName}! Your review helps other students make informed decisions.`
                  }
                </Text>
              </Stack>
              {hasReviews && (selectedYear !== 'all' || selectedSemester !== 'all' || searchQuery) && (
                <Button
                  variant="light"
                  onClick={() => {
                    setSelectedYear('all');
                    setSelectedSemester('all');
                    setSearchQuery('');
                  }}
                  leftSection={<IconX size={16} />}
                >
                  Clear all filters
                </Button>
              )}
              {user && !hasReviews && (
                <Button
                  leftSection={<IconSparkles size={18} />}
                  size="lg"
                  onClick={openReviewModal}
                  radius="md"
                  style={{
                    backgroundColor: GT_COLORS.techGold,
                    color: GT_COLORS.navy,
                  }}
                >
                  Write the First Review
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* Review Modal */}
        <Modal
          opened={reviewModalOpened}
          onClose={closeReviewModal}
          title={
            <Group gap="xs">
              <IconMessagePlus size={20} color={GT_COLORS.navy} />
              <Text fw={600}>Add Review for {courseId}</Text>
            </Group>
          }
          size="lg"
          centered
          radius="lg"
        >
          <ReviewForm
            courseId={courseId}
            courseName={courseName}
            reviewInput={null}
            handleReviewModalClose={closeReviewModal}
          />
        </Modal>
      </Container>

      {/* Floating Action Bar */}
      <CourseActionBar
        courseId={courseId}
        courseName={courseName}
        onAddReview={openReviewModal}
        isLoggedIn={!!user}
        reviewCount={filteredReviews.length}
      />
    </>
  );
}
