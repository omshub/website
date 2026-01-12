'use client';

import ReviewCard from '@/components/ReviewCard';
import { REVIEWS_RECENT_LEN } from '@/lib/constants';
import { Review } from '@/lib/types';
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
} from '@mantine/core';
import { IconMessageCircle } from '@tabler/icons-react';
import Link from 'next/link';

interface RecentsContentProps {
  reviewsRecent: Review[];
}

export default function RecentsContent({ reviewsRecent }: RecentsContentProps) {
  const sortedReviews = reviewsRecent
    .sort((a, b) => b.created - a.created)
    .slice(0, REVIEWS_RECENT_LEN);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        py="xl"
        style={{
          background: 'linear-gradient(135deg, #003057 0%, #00243f 100%)',
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: 'yellow', to: 'orange' }}
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
        {/* Reviews List */}
        <Stack gap="md">
          {sortedReviews.map((review: Review) => (
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
                  {review.courseId}
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
              <ReviewCard {...review} />
            </Box>
          ))}
        </Stack>

        {/* Empty State */}
        {sortedReviews.length === 0 && (
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
