'use client';

import ReviewCard from '@/components/ReviewCard';
import { Review, TPayloadCoursesDataStatic, TCourseId } from '@/lib/types';
import {
  Container,
  Title,
  Text,
  Stack,
  Paper,
  Group,
  Badge,
  Box,
  Anchor,
  ThemeIcon,
  Loader,
  Center,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconMessageCircle, IconSearch, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GT_COLORS } from '@/lib/theme';
import type { Database } from '@/lib/supabase/database.types';

type SupabaseReview = Database['public']['Tables']['reviews']['Row'];

interface RecentsContentProps {
  initialReviews: Review[];
  coursesDataStatic: TPayloadCoursesDataStatic;
  initialHasMore: boolean;
}

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

export default function RecentsContent({
  initialReviews,
  coursesDataStatic,
  initialHasMore,
}: RecentsContentProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(initialReviews.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [isSearching, setIsSearching] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset and search when debounced search changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch === '' && reviews === initialReviews) return;

      setIsSearching(true);
      setLoading(true);
      try {
        const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
        const response = await fetch(`/api/reviews/recent?limit=${PAGE_SIZE}&offset=0${searchParam}`);
        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const newReviews = (data.reviews || []).map(mapSupabaseReviewToReview);

        setReviews(newReviews);
        setHasMore(data.pagination?.hasMore ?? false);
        setOffset(newReviews.length);
      } catch (error) {
        console.error('Error searching reviews:', error);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
      const response = await fetch(`/api/reviews/recent?limit=${PAGE_SIZE}&offset=${offset}${searchParam}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const newReviews = (data.reviews || []).map(mapSupabaseReviewToReview);

      setReviews((prev) => [...prev, ...newReviews]);
      setHasMore(data.pagination?.hasMore ?? false);
      setOffset((prev) => prev + newReviews.length);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, debouncedSearch]);

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

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py="xl"
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #00243f 100%)`,
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              Community Reviews
            </Badge>
            <Title order={1} c="white" ta="center">
              Recent Reviews
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={500}>
              The latest course reviews from the Georgia Tech OMS community
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Search Input */}
        <Paper p="md" radius="lg" withBorder mb="xl">
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
            <Text size="sm" c="grayMatter" mt="xs">
              {reviews.length} result{reviews.length !== 1 ? 's' : ''} for "{debouncedSearch}"
            </Text>
          )}
        </Paper>

        {/* Reviews List */}
        <Stack gap="md">
          {reviews.map((review: Review) => (
            <Box key={review.reviewId}>
              {/* Course Link Header */}
              <Group mb="xs" gap="xs">
                <Anchor
                  component={Link}
                  href={`/course/${review.courseId}`}
                  fw={600}
                  size="sm"
                  c="boldBlue"
                >
                  {review.courseId}: {coursesDataStatic[review.courseId]?.name}
                </Anchor>
                <Text size="xs" c="grayMatter" suppressHydrationWarning>
                  {new Date(review.created).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </Text>
              </Group>
              <ReviewCard {...review} searchHighlight={debouncedSearch} />
            </Box>
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
          {!hasMore && reviews.length > 0 && (
            <Center>
              <Text size="sm" c="grayMatter">
                You've reached the end
              </Text>
            </Center>
          )}
        </Box>

        {/* Empty State */}
        {reviews.length === 0 && !loading && (
          <Paper p="xl" radius="lg" withBorder ta="center">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <IconMessageCircle size={30} />
              </ThemeIcon>
              <Title order={3} c="grayMatter">
                No recent reviews
              </Title>
              <Text c="grayMatter" size="sm">
                Be the first to share your course experience!
              </Text>
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
