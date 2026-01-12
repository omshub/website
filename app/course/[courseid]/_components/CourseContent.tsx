'use client';

import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import CourseActionBar from '@/components/CourseActionBar';
import { useAuth } from '@/context/AuthContext';
import { FirebaseAuthUser } from '@/context/types';
import { DESC, REVIEW_ID } from '@/lib/constants';
import {
  Course,
  Review,
  TPayloadReviews,
  TNullable,
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
  IconTrendingUp,
  IconUsers,
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
  Loader,
  Center,
  Modal,
  Anchor,
  ActionIcon,
  Tooltip,
  Box,
  ThemeIcon,
  SimpleGrid,
  Select,
  Progress,
  RingProgress,
  Flex,
} from '@mantine/core';
import { notifyLinkCopied } from '@/utils/notifications';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import {
  mapPayloadToArray,
  mapSemesterTermToEmoji,
  mapSemesterTermToName,
} from '@/utilities';
import { useEffect, useState, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import backend from '@/lib/firebase/index';
import { GT_COLORS } from '@/lib/theme';

const { getReviews } = backend;

type TActiveSemesters = {
  [semesterTerm: number]: boolean;
};

interface CourseContentProps {
  courseData: Course;
  courseTimeline: Record<number, Record<string, number>> | null;
  courseYears: number[] | null;
  defaultYear: number | null;
  defaultSemester: string | null;
  defaultSemesterToggles: Record<string, boolean> | null;
  defaultReviews: TPayloadReviews | null;
}

function getDifficultyInfo(value: number) {
  // Using CSS custom properties for proper dark/light mode contrast
  // statCssVar references --stat-color-* variables defined in globals.css
  if (value >= 4) return { label: 'Hard', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
  if (value >= 2.5) return { label: 'Medium', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Easy', color: GT_COLORS.canopyLime, statCssVar: 'var(--stat-color-green)', bgColor: '#F0F7E6', textColor: '#1e4620' };
}

function getWorkloadInfo(value: number) {
  // Using CSS custom properties for proper dark/light mode contrast
  if (value >= 20) return { label: 'Heavy', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
  if (value >= 12) return { label: 'Moderate', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Light', color: GT_COLORS.olympicTeal, statCssVar: 'var(--stat-color-teal)', bgColor: '#E6F5F6', textColor: '#134e4a' };
}

function getRatingInfo(value: number) {
  // Using CSS custom properties for proper dark/light mode contrast
  if (value >= 4) return { label: 'Excellent', color: GT_COLORS.canopyLime, statCssVar: 'var(--stat-color-green)', bgColor: '#F0F7E6', textColor: '#1e4620' };
  if (value >= 3) return { label: 'Good', color: GT_COLORS.olympicTeal, statCssVar: 'var(--stat-color-teal)', bgColor: '#E6F5F6', textColor: '#134e4a' };
  if (value >= 2) return { label: 'Average', color: GT_COLORS.buzzGold, statCssVar: 'var(--stat-color-yellow)', bgColor: '#FEF3E2', textColor: '#594200' };
  return { label: 'Poor', color: GT_COLORS.newHorizon, statCssVar: 'var(--stat-color-red)', bgColor: '#FDE8E4', textColor: '#5c1008' };
}

export default function CourseContent({
  courseData,
  courseTimeline,
  courseYears,
  defaultYear,
  defaultSemester,
  defaultSemesterToggles,
  defaultReviews,
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

  const [loading, setLoading] = useState<boolean>(false);
  const [reviewModalOpened, { open: openReviewModal, close: closeReviewModal }] = useDisclosure(false);

  const authContext: TNullable<any> = useAuth();
  const user: TNullable<FirebaseAuthUser> = authContext?.user;

  const [activeSemesters, setActiveSemesters] = useState<TActiveSemesters>(
    defaultSemesterToggles || {}
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(
    defaultSemester || ''
  );
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear || 0);
  const [courseReviews, setCourseReviews] = useState<TPayloadReviews>(
    defaultReviews || {}
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { mutate } = useSWRConfig();
  const { data: course_reviews } = useSWR(
    `/course/${courseId}/${selectedYear}/${selectedSemester}`
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    notifyLinkCopied();
  };

  const handleSemester = (value: string | null) => {
    if (value) setSelectedSemester(value);
  };

  const handleYear = (value: string | null) => {
    if (value) setSelectedYear(Number(value));
  };

  useEffect(() => {
    if (course_reviews) {
      setCourseReviews(course_reviews);
    }
  }, [course_reviews]);

  useEffect(() => {
    if (selectedYear && selectedSemester && courseTimeline) {
      setLoading(true);
      const yearData = courseTimeline[selectedYear];
      const newAvailableSemesters: string[] = yearData
        ? Object.keys(yearData)
        : [];
      const newActiveSemesters: Record<string, boolean> = Object.keys(
        mapSemesterTermToName
      ).reduce(
        (attrs, key) => ({
          ...attrs,
          [key]: !(newAvailableSemesters.indexOf(key.toString()) > -1),
        }),
        {}
      );
      if (newActiveSemesters[selectedSemester]) {
        setSelectedSemester(
          newAvailableSemesters[newAvailableSemesters.length - 1]
        );
      }
      setActiveSemesters(newActiveSemesters);
    }
    mutate(
      selectedYear && selectedSemester
        ? `/course/${courseId}/${selectedYear}/${selectedSemester}`
        : null,
      () => {
        return getReviews(
          courseId,
          String(selectedYear),
          String(selectedSemester)
        );
      }
    );
    setLoading(false);
  }, [selectedYear, selectedSemester, courseTimeline, courseId, mutate]);

  const semesterOptions = useMemo(() => {
    if (!mounted) return [];
    return Object.entries(mapSemesterTermToName)
      .filter(([key]) => !activeSemesters[Number(key)])
      .map(([key, name]) => ({
        value: key,
        label: `${name} ${mapSemesterTermToEmoji[Number(key)]}`,
      }));
  }, [mounted, activeSemesters]);

  const yearOptions = useMemo(() => {
    if (!courseYears) return [];
    return courseYears.map((year) => ({
      value: String(year),
      label: String(year),
    }));
  }, [courseYears]);

  const reviewsArray = useMemo(() => {
    return mapPayloadToArray(courseReviews, REVIEW_ID, DESC);
  }, [courseReviews]);

  const difficultyInfo = courseAvgDifficulty ? getDifficultyInfo(Number(courseAvgDifficulty)) : null;
  const workloadInfo = courseAvgWorkload ? getWorkloadInfo(Number(courseAvgWorkload)) : null;
  const ratingInfo = courseAvgOverall ? getRatingInfo(Number(courseAvgOverall)) : null;

  const hasStats = Boolean(courseNumReviews && courseNumReviews > 0);

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

        {/* Filters */}
        {courseYears && courseYears.length > 0 && mounted && (
          <Paper p="md" radius="lg" withBorder mb="xl">
            <Group gap="md" wrap="wrap">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconFilter size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500} c="grayMatter">Filter reviews:</Text>
              </Group>

              {yearOptions.length > 0 && (
                <Select
                  value={String(selectedYear)}
                  onChange={handleYear}
                  data={yearOptions}
                  size="sm"
                  w={120}
                  searchable
                  comboboxProps={{ withinPortal: true }}
                  leftSection={<IconCalendar size={14} />}
                  rightSection={<IconChevronDown size={14} />}
                  aria-label="Select year"
                  styles={{
                    input: {
                      fontWeight: 500,
                    },
                  }}
                />
              )}

              {semesterOptions.length > 0 && (
                <Group gap="xs">
                  {semesterOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={selectedSemester === option.value ? 'filled' : 'light'}
                      size="sm"
                      radius="xl"
                      onClick={() => handleSemester(option.value)}
                      style={
                        selectedSemester === option.value
                          ? { backgroundColor: GT_COLORS.navy, color: 'white' }
                          : {}
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </Group>
              )}
            </Group>
          </Paper>
        )}

        {/* Reviews Section */}
        <Group justify="space-between" mb="lg" data-reviews-section>
          <Group gap="xs">
            <Title order={2} size="h3">
              Reviews
            </Title>
            {reviewsArray.length > 0 && selectedYear && selectedSemester && (
              <Badge
                variant="light"
                styles={{
                  root: { backgroundColor: '#f1f3f5', color: '#495057' },
                }}
              >
                {mapSemesterTermToName[Number(selectedSemester)]} {selectedYear}
              </Badge>
            )}
          </Group>
          {reviewsArray.length > 0 && (
            <Text size="sm" c="grayMatter">
              {reviewsArray.length} review{reviewsArray.length !== 1 ? 's' : ''}
            </Text>
          )}
        </Group>

        {loading ? (
          <Center h={200}>
            <Loader color={GT_COLORS.techGold} />
          </Center>
        ) : (
          <>
            {reviewsArray.length > 0 ? (
              <Stack gap="md">
                {reviewsArray.map((value: Review) => (
                  <ReviewCard key={value.reviewId} {...value} courseName={courseName} />
                ))}
              </Stack>
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
                      No reviews for this period
                    </Title>
                    <Text c="grayMatter" ta="center" maw={400}>
                      {hasStats
                        ? `No reviews found for ${selectedSemester ? mapSemesterTermToName[Number(selectedSemester)] : ''} ${selectedYear}. Try selecting a different semester or year.`
                        : `Be the first to share your experience with ${courseName}! Your review helps other students make informed decisions.`
                      }
                    </Text>
                  </Stack>
                  {user && !hasStats && (
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
          </>
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
        reviewCount={reviewsArray.length}
      />
    </>
  );
}
