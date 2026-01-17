'use client';

import { useState, useEffect } from 'react';
import {
  Group,
  Button,
  ActionIcon,
  Tooltip,
  Paper,
  Text,
  Transition,
  Box,
  Divider,
  Badge,
  Menu,
  CopyButton,
} from '@mantine/core';
import { useWindowScroll, useLocalStorage } from '@mantine/hooks';
import {
  notifyBookmarkAdded,
  notifyBookmarkRemoved,
  notifyNoReviews,
} from '@/utils/notifications';
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

interface CourseActionBarProps {
  courseId: string;
  courseName: string;
  onAddReview?: () => void;
  isLoggedIn?: boolean;
  reviewCount?: number;
}

export default function CourseActionBar({
  courseId,
  courseName,
  onAddReview,
  isLoggedIn = false,
  reviewCount = 0,
}: CourseActionBarProps) {
  const [scroll, scrollTo] = useWindowScroll();
  const [visible, setVisible] = useState(false);
  const [bookmarkedCourses, setBookmarkedCourses] = useLocalStorage<string[]>({
    key: 'omshub-bookmarks',
    defaultValue: [],
  });

  const isBookmarked = bookmarkedCourses.includes(courseId);

  useEffect(() => {
    setVisible(scroll.y > 300);
  }, [scroll.y]);

  const handleScrollToTop = () => {
    scrollTo({ y: 0 });
  };

  const handleRandomReview = () => {
    const reviews = document.querySelectorAll('[data-review-card]');
    if (reviews.length > 0) {
      const randomIndex = Math.floor(Math.random() * reviews.length);
      reviews[randomIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a brief highlight effect
      reviews[randomIndex].classList.add('highlight-review');
      setTimeout(() => {
        reviews[randomIndex].classList.remove('highlight-review');
      }, 2000);
    } else {
      notifyNoReviews();
    }
  };

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      setBookmarkedCourses(bookmarkedCourses.filter(id => id !== courseId));
      notifyBookmarkRemoved(courseId);
    } else {
      setBookmarkedCourses([...bookmarkedCourses, courseId]);
      notifyBookmarkAdded(courseId);
    }
  };

  const getCourseInfoText = () => {
    return `${courseId}: ${courseName}\n${window.location.href}`;
  };

  const getCourseMarkdown = () => {
    return `**${courseId}**: ${courseName}\n[View Reviews](${window.location.href})`;
  };

  return (
    <>
      {/* Inject highlight animation styles */}
      <style>{`
        @keyframes highlightPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(179, 163, 105, 0); }
          50% { box-shadow: 0 0 0 4px rgba(179, 163, 105, 0.4); }
        }
        .highlight-review {
          animation: highlightPulse 0.5s ease-in-out 2;
        }
      `}</style>

      <Transition mounted={visible} transition="slide-up" duration={300}>
        {(styles) => (
          <Box
            pos="fixed"
            bottom={0}
            left={0}
            right={0}
            style={{
              ...styles,
              zIndex: 100,
              pointerEvents: 'none',
            }}
          >
            <Box
              mx="auto"
              maw={900}
              px="md"
              pb="md"
              style={{ pointerEvents: 'auto' }}
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
                        <CopyButton value={window?.location?.href || ''}>
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
          </Box>
        )}
      </Transition>
    </>
  );
}
