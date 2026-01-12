import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  Loader,
  Select,
  Rating,
  Text,
  Stack,
  NumberInput,
  Paper,
  Group,
  Divider,
  ThemeIcon,
  Badge,
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconPencil,
  IconCheck,
  IconBrain,
  IconThumbUp,
} from '@tabler/icons-react';
import { TRatingScale, TSemesterId } from '@/lib/types';
import { GT_COLORS } from '@/lib/theme';

const difficultyLabels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
const overallLabels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

interface ReviewFormStoryProps {
  courseId: string;
  courseName: string;
  isEditMode?: boolean;
  isSubmitting?: boolean;
  initialYear?: number | null;
  initialSemester?: TSemesterId | null;
  initialWorkload?: number | null;
  initialDifficulty?: TRatingScale | null;
  initialOverall?: TRatingScale | null;
  initialBody?: string;
}

const ReviewFormStory = ({
  courseId: _courseId,
  courseName: _courseName,
  isEditMode = false,
  isSubmitting = false,
  initialYear = null,
  initialSemester = null,
  initialWorkload = null,
  initialDifficulty = null,
  initialOverall = null,
  initialBody = '',
}: ReviewFormStoryProps) => {
  const [year, setYear] = useState<number | null>(initialYear);
  const [semester, setSemester] = useState<string | null>(initialSemester);
  const [workload, setWorkload] = useState<number | string | ''>(initialWorkload ?? '');
  const [difficulty, setDifficulty] = useState<number>(initialDifficulty ?? 0);
  const [overall, setOverall] = useState<number>(initialOverall ?? 0);

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 7 }, (_, i) => currentYear - i);

  const isValid = year && semester && workload && difficulty > 0 && overall > 0;
  const isDirty = year || semester || workload || difficulty > 0 || overall > 0;

  return (
    <Stack gap="lg">
      {/* Semester & Year Selection */}
      <Paper p="md" radius="md" withBorder>
        <Group gap="xs" mb="md">
          <ThemeIcon size="sm" variant="light" color="blue">
            <IconCalendar size={14} />
          </ThemeIcon>
          <Text size="sm" fw={600}>When did you take this course?</Text>
        </Group>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}
        >
          <Select
            label="Semester"
            placeholder="Select semester"
            value={semester}
            onChange={setSemester}
            disabled={isEditMode}
            data={[
              { value: 'sp', label: 'Spring' },
              { value: 'sm', label: 'Summer' },
              { value: 'fa', label: 'Fall' },
            ]}
            searchable
            styles={{
              input: {
                fontWeight: 500,
              },
            }}
          />

          <Select
            label="Year"
            placeholder="Select year"
            value={year?.toString() ?? null}
            onChange={(val) => setYear(val ? Number(val) : null)}
            disabled={isEditMode}
            data={yearRange.map((y) => ({
              value: y.toString(),
              label: y.toString(),
            }))}
            searchable
            styles={{
              input: {
                fontWeight: 500,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Ratings Section */}
      <Paper p="md" radius="md" withBorder>
        <Text size="sm" fw={600} mb="md">Rate your experience</Text>

        <Stack gap="xl">
          {/* Workload */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="cyan">
                  <IconClock size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Weekly Workload</Text>
              </Group>
              <Badge variant="light" color="cyan">
                {workload || '—'} hrs/week
              </Badge>
            </Group>
            <NumberInput
              placeholder="Enter hours per week"
              min={1}
              max={60}
              value={workload}
              onChange={setWorkload}
              suffix=" hours/week"
              styles={{
                input: {
                  textAlign: 'center',
                  fontWeight: 500,
                },
              }}
            />
          </Box>

          <Divider />

          {/* Difficulty */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="red">
                  <IconBrain size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Difficulty</Text>
              </Group>
              {difficulty > 0 && (
                <Badge
                  variant="light"
                  color={difficulty <= 2 ? 'green' : difficulty <= 3 ? 'yellow' : 'red'}
                >
                  {difficultyLabels[(difficulty || 1) - 1]}
                </Badge>
              )}
            </Group>
            <Box px="xs">
              <Rating
                value={difficulty}
                onChange={setDifficulty}
                size="xl"
                count={5}
                highlightSelectedOnly
                emptySymbol={<IconBrain size={28} color="var(--mantine-color-gray-4)" />}
                fullSymbol={<IconBrain size={28} color={GT_COLORS.newHorizon} />}
                styles={{
                  symbolGroup: {
                    gap: 8,
                  },
                }}
              />
              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">Very Easy</Text>
                <Text size="xs" c="dimmed">Very Hard</Text>
              </Group>
            </Box>
          </Box>

          <Divider />

          {/* Overall */}
          <Box>
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="green">
                  <IconThumbUp size={14} />
                </ThemeIcon>
                <Text size="sm" fw={500}>Overall Rating</Text>
              </Group>
              {overall > 0 && (
                <Badge
                  variant="light"
                  color={overall >= 4 ? 'green' : overall >= 3 ? 'blue' : 'red'}
                >
                  {overallLabels[(overall || 1) - 1]}
                </Badge>
              )}
            </Group>
            <Box px="xs">
              <Rating
                value={overall}
                onChange={setOverall}
                size="xl"
                count={5}
                highlightSelectedOnly
                emptySymbol={<IconThumbUp size={28} color="var(--mantine-color-gray-4)" />}
                fullSymbol={<IconThumbUp size={28} color={GT_COLORS.canopyLime} />}
                styles={{
                  symbolGroup: {
                    gap: 8,
                  },
                }}
              />
              <Group justify="space-between" mt="xs">
                <Text size="xs" c="dimmed">Terrible</Text>
                <Text size="xs" c="dimmed">Excellent</Text>
              </Group>
            </Box>
          </Box>
        </Stack>
      </Paper>

      {/* Review Body */}
      <Paper p="md" radius="md" withBorder>
        <Group gap="xs" mb="md">
          <ThemeIcon size="sm" variant="light" color="grape">
            <IconPencil size={14} />
          </ThemeIcon>
          <Text size="sm" fw={600}>Your Review</Text>
        </Group>
        <Text size="xs" c="dimmed" mb="sm">
          Share your experience with the course. What did you learn? What was challenging?
          Would you recommend it? Markdown formatting is supported.
        </Text>
        <Paper p="md" radius="md" withBorder style={{ minHeight: 150, backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Text size="sm" c="dimmed">
            {initialBody || 'TipTap rich text editor would appear here...'}
          </Text>
        </Paper>
      </Paper>

      {/* Submit Button */}
      <Group justify="flex-end" mt="md">
        <Button
          variant="subtle"
          color="gray"
          onClick={() => console.log('Cancel')}
        >
          Cancel
        </Button>
        {isSubmitting ? (
          <Loader color={GT_COLORS.techGold} size="sm" />
        ) : (
          <Button
            disabled={!isDirty || !isValid}
            variant="filled"
            leftSection={<IconCheck size={18} />}
            onClick={() => console.log('Submit')}
            style={{
              backgroundColor: GT_COLORS.techGold,
              color: GT_COLORS.navy,
            }}
          >
            {isEditMode ? 'Update Review' : 'Submit Review'}
          </Button>
        )}
      </Group>
    </Stack>
  );
};

const meta: Meta<typeof ReviewFormStory> = {
  title: 'Forms/ReviewForm',
  component: ReviewFormStory,
  parameters: {
    docs: {
      description: {
        component: 'Form for submitting or editing course reviews with ratings, workload, and rich text body.',
      },
    },
  },
  argTypes: {
    isEditMode: { control: 'boolean' },
    isSubmitting: { control: 'boolean' },
    initialYear: { control: { type: 'range', min: 2018, max: 2025 } },
    initialSemester: { control: 'select', options: ['sp', 'sm', 'fa'] },
    initialWorkload: { control: { type: 'range', min: 1, max: 60 } },
    initialDifficulty: { control: { type: 'range', min: 1, max: 5 } },
    initialOverall: { control: { type: 'range', min: 1, max: 5 } },
  },
  decorators: [
    (Story) => (
      <Box p="md" maw={800} mx="auto">
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReviewFormStory>;

// Empty form (new review)
export const Default: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
  },
};

// Edit mode with pre-filled values
export const EditMode: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    isEditMode: true,
    initialYear: 2024,
    initialSemester: 'fa' as TSemesterId,
    initialWorkload: 15,
    initialDifficulty: 3 as TRatingScale,
    initialOverall: 4 as TRatingScale,
    initialBody: 'This course was great! I learned a lot about AI concepts.',
  },
};

// Form in submitting state
export const Submitting: Story = {
  args: {
    courseId: 'CS-6750',
    courseName: 'Human-Computer Interaction',
    isSubmitting: true,
    initialYear: 2024,
    initialSemester: 'sp' as TSemesterId,
    initialWorkload: 10,
    initialDifficulty: 2 as TRatingScale,
    initialOverall: 5 as TRatingScale,
  },
};

// Partially filled form
export const PartiallyFilled: Story = {
  args: {
    courseId: 'CS-6515',
    courseName: 'Graduate Algorithms',
    initialYear: 2024,
    initialSemester: 'fa' as TSemesterId,
  },
};

// High workload course
export const HighWorkloadCourse: Story = {
  args: {
    courseId: 'CS-6515',
    courseName: 'Graduate Algorithms',
    initialYear: 2024,
    initialSemester: 'sp' as TSemesterId,
    initialWorkload: 35,
    initialDifficulty: 5 as TRatingScale,
    initialOverall: 3 as TRatingScale,
  },
};

// Easy course
export const EasyCourse: Story = {
  args: {
    courseId: 'CS-6035',
    courseName: 'Intro to Information Security',
    initialYear: 2024,
    initialSemester: 'sm' as TSemesterId,
    initialWorkload: 8,
    initialDifficulty: 1 as TRatingScale,
    initialOverall: 5 as TRatingScale,
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
