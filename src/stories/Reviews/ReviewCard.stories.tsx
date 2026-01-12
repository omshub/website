import React, { createContext, useContext, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SimpleGrid, Box } from '@mantine/core';
import { Review, TRatingScale, TSemesterId } from '@/lib/types';

// Since ReviewCard depends on AuthContext and course data, we create a simplified version for stories
import {
  Card,
  Badge,
  Divider,
  Group,
  ActionIcon,
  Spoiler,
  Stack,
  Tooltip,
  Text,
} from '@mantine/core';
import {
  IconCamera,
  IconAlertCircle,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import Markdown from 'react-markdown';

// Simplified ReviewCard for Storybook (without context dependencies)
interface ReviewCardStoryProps {
  reviewId: string;
  courseId: string;
  courseName: string;
  body: string;
  overall: TRatingScale;
  difficulty: TRatingScale;
  workload: number;
  semesterId: TSemesterId;
  year: number;
  created: number;
  isLegacy?: boolean;
  isGTVerifiedReviewer?: boolean;
  isOwner?: boolean;
}

const mapSemesterIdToName: Record<string, string> = {
  sp: 'Spring',
  sm: 'Summer',
  fa: 'Fall',
};

const mapDifficulty: Record<number, string> = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

const mapOverall: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

const mapRatingToColor = (rating: number): string => {
  if (rating >= 4) return '#22c55e';
  if (rating >= 3) return '#eab308';
  return '#ef4444';
};

const mapRatingToColorInverted = (rating: number): string => {
  if (rating <= 2) return '#22c55e';
  if (rating <= 3) return '#eab308';
  return '#ef4444';
};

const techGold = '#b3a369';

const ReviewCardStory = ({
  reviewId,
  courseId,
  courseName,
  body,
  overall,
  difficulty,
  workload,
  semesterId,
  year,
  created,
  isLegacy = false,
  isGTVerifiedReviewer = false,
  isOwner = false,
}: ReviewCardStoryProps) => {
  const createdDate = new Date(created);
  const timestamp = `${createdDate.getUTCMonth() + 1}/${createdDate.getUTCDate()}/${createdDate.getUTCFullYear()}`;

  return (
    <Card padding="lg" radius="md" shadow="sm" withBorder>
      <Group justify="space-between" mb="sm" wrap="wrap">
        <Group gap="xs">
          <Badge size="md" variant="filled" color="navyBlue">
            {mapSemesterIdToName[semesterId]} {year}
          </Badge>
          {isGTVerifiedReviewer && (
            <Badge size="sm" variant="light" color="yellow" style={{ color: techGold }}>
              Verified GT
            </Badge>
          )}
          {isLegacy && (
            <Badge
              size="sm"
              variant="outline"
              color="yellow"
              leftSection={<IconAlertCircle size={12} />}
            >
              Legacy
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed">
          {timestamp}
        </Text>
      </Group>

      <Stack gap={4} mb="sm">
        <Text size="sm" fw={600}>
          {courseId}: {courseName}
        </Text>
      </Stack>

      <Group gap="xs" mb="md" wrap="wrap">
        <Badge variant="light" color="gray" size="sm">
          {workload} hrs/wk
        </Badge>
        <Badge
          variant="light"
          size="sm"
          style={{
            backgroundColor: `${mapRatingToColorInverted(difficulty)}20`,
            color: mapRatingToColorInverted(difficulty),
          }}
        >
          {mapDifficulty[difficulty]}
        </Badge>
        <Badge
          variant="light"
          size="sm"
          style={{
            backgroundColor: `${mapRatingToColor(overall)}20`,
            color: mapRatingToColor(overall),
          }}
        >
          {mapOverall[overall]}
        </Badge>
      </Group>

      <Divider mb="md" />

      <Spoiler
        maxHeight={200}
        showLabel="Show more"
        hideLabel="Show less"
        styles={{
          control: {
            color: 'var(--mantine-color-navyBlue-6)',
            fontWeight: 500,
          },
        }}
      >
        <Box>
          <Markdown>{body}</Markdown>
        </Box>
      </Spoiler>

      <Group justify="flex-end" mt="md">
        <Tooltip label="Screenshot Review" withArrow>
          <ActionIcon variant="subtle" aria-label="Screenshot review">
            <IconCamera size={20} />
          </ActionIcon>
        </Tooltip>

        {isOwner && (
          <>
            <Tooltip label="Update review" withArrow>
              <ActionIcon variant="subtle" aria-label="Edit review">
                <IconEdit size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete Review" withArrow>
              <ActionIcon variant="subtle" color="red" aria-label="Delete review">
                <IconTrash size={20} />
              </ActionIcon>
            </Tooltip>
          </>
        )}
      </Group>
    </Card>
  );
};

const meta: Meta<typeof ReviewCardStory> = {
  title: 'Reviews/ReviewCard',
  component: ReviewCardStory,
  parameters: {
    docs: {
      description: {
        component: 'Card displaying a course review with ratings, metadata, and actions.',
      },
    },
  },
  argTypes: {
    overall: { control: { type: 'range', min: 1, max: 5, step: 1 } },
    difficulty: { control: { type: 'range', min: 1, max: 5, step: 1 } },
    workload: { control: { type: 'range', min: 1, max: 60, step: 1 } },
    semesterId: { control: 'select', options: ['sp', 'sm', 'fa'] },
    year: { control: { type: 'range', min: 2015, max: 2025, step: 1 } },
    isLegacy: { control: 'boolean' },
    isGTVerifiedReviewer: { control: 'boolean' },
    isOwner: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <Box p="md" maw={600}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReviewCardStory>;

// Default review
export const Default: Story = {
  args: {
    reviewId: 'review-1',
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    body: 'This course was excellent! The professor explained concepts clearly and the assignments were challenging but fair. I learned a lot about knowledge-based AI and would highly recommend it to anyone interested in cognitive systems.\n\nThe projects were particularly engaging and helped solidify my understanding of the material.',
    overall: 5 as TRatingScale,
    difficulty: 3 as TRatingScale,
    workload: 15,
    semesterId: 'fa' as TSemesterId,
    year: 2024,
    created: Date.now() - 86400000,
    isGTVerifiedReviewer: true,
    isOwner: false,
  },
};

// Excellent review (high ratings)
export const ExcellentReview: Story = {
  args: {
    reviewId: 'review-2',
    courseId: 'CS-6750',
    courseName: 'Human-Computer Interaction',
    body: 'Absolutely loved this course! Dr. Joyner is an amazing instructor. The workload is very manageable and you learn so much about HCI principles. The peer review system is well-designed and the projects are engaging.',
    overall: 5 as TRatingScale,
    difficulty: 1 as TRatingScale,
    workload: 8,
    semesterId: 'sp' as TSemesterId,
    year: 2024,
    created: Date.now() - 172800000,
    isGTVerifiedReviewer: true,
    isOwner: false,
  },
};

// Poor review (low ratings)
export const PoorReview: Story = {
  args: {
    reviewId: 'review-3',
    courseId: 'CS-6515',
    courseName: 'Graduate Algorithms',
    body: 'Very difficult course with unclear expectations. The exams were brutal and didn\'t align well with the homework. Would not recommend unless you have a strong algorithms background.',
    overall: 2 as TRatingScale,
    difficulty: 5 as TRatingScale,
    workload: 25,
    semesterId: 'fa' as TSemesterId,
    year: 2023,
    created: Date.now() - 31536000000,
    isGTVerifiedReviewer: false,
    isOwner: false,
  },
};

// Legacy review
export const LegacyReview: Story = {
  args: {
    reviewId: 'review-4',
    courseId: 'CS-7641',
    courseName: 'Machine Learning',
    body: 'This review was imported from the original OMSCentral. The course has changed significantly since then, so take this with a grain of salt. Overall it was a solid ML course.',
    overall: 4 as TRatingScale,
    difficulty: 4 as TRatingScale,
    workload: 20,
    semesterId: 'sm' as TSemesterId,
    year: 2019,
    created: Date.now() - 157680000000,
    isLegacy: true,
    isGTVerifiedReviewer: false,
    isOwner: false,
  },
};

// Owner view (with edit/delete buttons)
export const OwnerView: Story = {
  args: {
    reviewId: 'review-5',
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    body: 'My own review that I can edit or delete. The course was great and I learned a lot about AI systems.',
    overall: 4 as TRatingScale,
    difficulty: 3 as TRatingScale,
    workload: 15,
    semesterId: 'fa' as TSemesterId,
    year: 2024,
    created: Date.now() - 604800000,
    isGTVerifiedReviewer: true,
    isOwner: true,
  },
};

// Long review with markdown
export const LongReviewWithMarkdown: Story = {
  args: {
    reviewId: 'review-6',
    courseId: 'CS-6250',
    courseName: 'Computer Networks',
    body: `## Course Overview

This course provides a comprehensive introduction to computer networking concepts.

### Pros
- Well-structured lectures
- Interesting projects
- Good TA support

### Cons
- Some outdated material
- Exams can be tricky

### Tips for Success
1. Start projects early
2. Review the textbook chapters
3. Attend office hours

Overall, I would **highly recommend** this course to anyone interested in networking. The workload is manageable if you stay on top of things.

*Last updated: Fall 2024*`,
    overall: 4 as TRatingScale,
    difficulty: 3 as TRatingScale,
    workload: 12,
    semesterId: 'fa' as TSemesterId,
    year: 2024,
    created: Date.now() - 259200000,
    isGTVerifiedReviewer: true,
    isOwner: false,
  },
};

// Summer semester
export const SummerSemester: Story = {
  args: {
    reviewId: 'review-7',
    courseId: 'CS-6035',
    courseName: 'Intro to Information Security',
    body: 'Taking this in summer was intense but doable. The compressed schedule means more work per week, but you finish faster.',
    overall: 4 as TRatingScale,
    difficulty: 2 as TRatingScale,
    workload: 18,
    semesterId: 'sm' as TSemesterId,
    year: 2024,
    created: Date.now() - 7776000000,
    isGTVerifiedReviewer: false,
    isOwner: false,
  },
};

// High workload
export const HighWorkload: Story = {
  args: {
    reviewId: 'review-8',
    courseId: 'CS-6515',
    courseName: 'Graduate Algorithms',
    body: 'Expect to spend 30+ hours per week on this course. The material is challenging but rewarding if you put in the effort.',
    overall: 3 as TRatingScale,
    difficulty: 5 as TRatingScale,
    workload: 35,
    semesterId: 'sp' as TSemesterId,
    year: 2024,
    created: Date.now() - 15552000000,
    isGTVerifiedReviewer: true,
    isOwner: false,
  },
};

// Multiple reviews grid
export const ReviewsGrid: Story = {
  render: () => (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      <ReviewCardStory
        reviewId="grid-1"
        courseId="CS-7637"
        courseName="Knowledge-Based AI"
        body="Great course for learning AI fundamentals."
        overall={5 as TRatingScale}
        difficulty={3 as TRatingScale}
        workload={15}
        semesterId="fa"
        year={2024}
        created={Date.now() - 86400000}
        isGTVerifiedReviewer={true}
      />
      <ReviewCardStory
        reviewId="grid-2"
        courseId="CS-7641"
        courseName="Machine Learning"
        body="Challenging but rewarding ML course."
        overall={4 as TRatingScale}
        difficulty={4 as TRatingScale}
        workload={20}
        semesterId="sp"
        year={2024}
        created={Date.now() - 172800000}
        isGTVerifiedReviewer={false}
      />
    </SimpleGrid>
  ),
};

// Mobile view
export const MobileView: Story = {
  args: {
    reviewId: 'mobile-1',
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    body: 'Great course! Highly recommend for anyone interested in AI.',
    overall: 5 as TRatingScale,
    difficulty: 3 as TRatingScale,
    workload: 15,
    semesterId: 'fa' as TSemesterId,
    year: 2024,
    created: Date.now(),
    isGTVerifiedReviewer: true,
    isOwner: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
