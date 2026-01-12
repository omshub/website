import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Paper,
  Text,
  Box,
  Divider,
  Badge,
  Menu,
  CopyButton,
} from '@mantine/core';
import {
  IconMessagePlus,
  IconLink,
  IconArrowUp,
  IconCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconCopy,
  IconHash,
  IconArrowsShuffle,
  IconClipboard,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

// Simplified CourseActionBar for Storybook (always visible, no scroll dependency)
interface CourseActionBarStoryProps {
  courseId: string;
  courseName: string;
  onAddReview?: () => void;
  isLoggedIn?: boolean;
  reviewCount?: number;
  isBookmarked?: boolean;
}

const CourseActionBarStory = ({
  courseId,
  courseName,
  onAddReview,
  isLoggedIn = false,
  reviewCount = 0,
  isBookmarked: initialBookmarked = false,
}: CourseActionBarStoryProps) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleToggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    console.log(isBookmarked ? 'bookmarkRemoved' : 'bookmarkAdded', courseId);
  };

  const handleScrollToTop = () => {
    console.log('scrollToTop');
  };

  const handleRandomReview = () => {
    console.log('randomReview');
  };

  const getCourseInfoText = () => {
    return `${courseId}: ${courseName}\nhttps://omshub.io/courses/${courseId}`;
  };

  const getCourseMarkdown = () => {
    return `**${courseId}**: ${courseName}\n[View Reviews](https://omshub.io/courses/${courseId})`;
  };

  return (
    <Box
      pos="relative"
      style={{
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      <Paper
        shadow="xl"
        radius="xl"
        p="xs"
        style={{
          backgroundColor: GT_COLORS.navy,
          border: `1px solid ${GT_COLORS.techGold}30`,
        }}
      >
        <Group justify="space-between" gap="xs" wrap="nowrap">
          {/* Course Info */}
          <Group gap="xs" style={{ minWidth: 0, flex: 1 }} wrap="nowrap">
            <Badge
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
              size="sm"
              style={{ flexShrink: 0 }}
            >
              {courseId}
            </Badge>
            <Text
              size="sm"
              c="white"
              fw={500}
              truncate
              style={{ opacity: 0.9 }}
            >
              {courseName}
            </Text>
          </Group>

          {/* Actions */}
          <Group gap={6} wrap="nowrap">
            {/* Bookmark */}
            <Tooltip label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Course'} position="top">
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                onClick={handleToggleBookmark}
                styles={{
                  root: {
                    color: isBookmarked ? GT_COLORS.buzzGold : 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: isBookmarked ? GT_COLORS.buzzGold : 'white',
                    },
                  },
                }}
              >
                {isBookmarked ? <IconBookmarkFilled size={18} /> : <IconBookmark size={18} />}
              </ActionIcon>
            </Tooltip>

            {/* Copy Menu */}
            <Menu shadow="md" width={200} position="top" withArrow>
              <Menu.Target>
                <Tooltip label="Copy Course Info" position="top">
                  <ActionIcon
                    variant="subtle"
                    size="lg"
                    radius="xl"
                    styles={{
                      root: {
                        color: 'rgba(255,255,255,0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <IconCopy size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Copy to Clipboard</Menu.Label>
                <CopyButton value={`https://omshub.io/courses/${courseId}`}>
                  {({ copied, copy }) => (
                    <Menu.Item
                      leftSection={copied ? <IconCheck size={14} color={GT_COLORS.canopyLime} /> : <IconLink size={14} />}
                      onClick={copy}
                    >
                      {copied ? 'Link Copied!' : 'Course Link'}
                    </Menu.Item>
                  )}
                </CopyButton>
                <CopyButton value={getCourseInfoText()}>
                  {({ copied, copy }) => (
                    <Menu.Item
                      leftSection={copied ? <IconCheck size={14} color={GT_COLORS.canopyLime} /> : <IconClipboard size={14} />}
                      onClick={copy}
                    >
                      {copied ? 'Copied!' : 'Course Name + Link'}
                    </Menu.Item>
                  )}
                </CopyButton>
                <CopyButton value={getCourseMarkdown()}>
                  {({ copied, copy }) => (
                    <Menu.Item
                      leftSection={copied ? <IconCheck size={14} color={GT_COLORS.canopyLime} /> : <IconHash size={14} />}
                      onClick={copy}
                    >
                      {copied ? 'Copied!' : 'Markdown Format'}
                    </Menu.Item>
                  )}
                </CopyButton>
              </Menu.Dropdown>
            </Menu>

            {/* Random Review */}
            {reviewCount > 1 && (
              <Tooltip label="Random Review" position="top">
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="xl"
                  onClick={handleRandomReview}
                  styles={{
                    root: {
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                      },
                    },
                  }}
                >
                  <IconArrowsShuffle size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            <Divider orientation="vertical" color="rgba(255,255,255,0.2)" />

            {/* Scroll to Top */}
            <Tooltip label="Back to Top" position="top">
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                onClick={handleScrollToTop}
                styles={{
                  root: {
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white',
                    },
                  },
                }}
              >
                <IconArrowUp size={18} />
              </ActionIcon>
            </Tooltip>

            {/* Add Review Button */}
            {isLoggedIn && onAddReview && (
              <Button
                leftSection={<IconMessagePlus size={16} />}
                size="sm"
                radius="xl"
                onClick={onAddReview}
                styles={{
                  root: {
                    backgroundColor: GT_COLORS.techGold,
                    color: GT_COLORS.navy,
                    '&:hover': {
                      backgroundColor: GT_COLORS.buzzGold,
                    },
                  },
                }}
              >
                Add Review
              </Button>
            )}
          </Group>
        </Group>
      </Paper>
    </Box>
  );
};

const meta: Meta<typeof CourseActionBarStory> = {
  title: 'Course/CourseActionBar',
  component: CourseActionBarStory,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A floating action bar for course pages that appears when scrolling. Shows course info, bookmark toggle, copy menu, random review button, scroll to top, and add review button.',
      },
    },
    backgrounds: {
      default: 'light',
    },
  },
  argTypes: {
    courseId: {
      control: 'text',
      description: 'The course ID (e.g., CS-7637)',
    },
    courseName: {
      control: 'text',
      description: 'The full course name',
    },
    isLoggedIn: {
      control: 'boolean',
      description: 'Whether the user is logged in (controls Add Review button visibility)',
    },
    reviewCount: {
      control: { type: 'number', min: 0 },
      description: 'Number of reviews (Random Review button shows when > 1)',
    },
    isBookmarked: {
      control: 'boolean',
      description: 'Initial bookmark state',
    },
    onAddReview: {
      action: 'onAddReview',
      description: 'Callback when Add Review button is clicked',
    },
  },
  decorators: [
    (Story) => (
      <Box p="xl" style={{ minWidth: 600 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CourseActionBarStory>;

// Default - basic course info
export const Default: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    isLoggedIn: false,
    reviewCount: 0,
    isBookmarked: false,
  },
};

// LoggedIn - with Add Review button visible
export const LoggedIn: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    isLoggedIn: true,
    reviewCount: 0,
    isBookmarked: false,
    onAddReview: () => console.log('onAddReview'),
  },
};

// WithManyReviews - shows random review button
export const WithManyReviews: Story = {
  args: {
    courseId: 'CS-6750',
    courseName: 'Human-Computer Interaction',
    isLoggedIn: false,
    reviewCount: 50,
    isBookmarked: false,
  },
};

// Bookmarked - shows bookmarked state
export const Bookmarked: Story = {
  args: {
    courseId: 'CS-7641',
    courseName: 'Machine Learning',
    isLoggedIn: false,
    reviewCount: 25,
    isBookmarked: true,
  },
};

// FullFeatured - all features enabled
export const FullFeatured: Story = {
  args: {
    courseId: 'CS-6515',
    courseName: 'Graduate Algorithms',
    isLoggedIn: true,
    reviewCount: 100,
    isBookmarked: true,
    onAddReview: () => console.log('onAddReview'),
  },
};

// Long course name - tests truncation
export const LongCourseName: Story = {
  args: {
    courseId: 'CS-8803-O01',
    courseName: 'Special Topics: Artificial Intelligence Techniques for Robotics',
    isLoggedIn: true,
    reviewCount: 15,
    isBookmarked: false,
    onAddReview: () => console.log('onAddReview'),
  },
};

// Mobile view
export const MobileView: Story = {
  args: {
    courseId: 'CS-7637',
    courseName: 'Knowledge-Based AI',
    isLoggedIn: true,
    reviewCount: 50,
    isBookmarked: false,
    onAddReview: () => console.log('onAddReview'),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <Box p="sm" style={{ maxWidth: 375 }}>
        <Story />
      </Box>
    ),
  ],
};
