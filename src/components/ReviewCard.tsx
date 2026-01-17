'use client';

import { useAuth } from '@/context/AuthContext';
import { Review, TCourseName } from '@/lib/types';
import {
  IconCamera,
  IconAlertCircle,
  IconTrash,
  IconPencil,
} from '@tabler/icons-react';
import stringWidth from 'string-width';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import {
  Box,
  Button,
  Paper,
  Badge,
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Modal,
  Loader,
} from '@mantine/core';
import { notifySuccess, notifyError } from '@/utils/notifications';
import { useDisclosure } from '@mantine/hooks';

import { mapSemesterIdToName } from '@/utilities';
import { GT_COLORS, CSS_STAT_COLORS } from '@/lib/theme';
import { toBlob } from 'html-to-image';
import { useEffect, useMemo, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import ReviewForm from '@/components/ReviewForm';
import HighlightedText from '@/components/HighlightedText';

interface ReviewCardProps extends Review {
  courseName?: string;
  searchHighlight?: string;
}

const ReviewCard = ({
  reviewId,
  body,
  overall,
  difficulty,
  workload,
  semesterId,
  created,
  modified = null,
  year,
  courseId,
  reviewerId,
  isLegacy = false,
  isGTVerifiedReviewer = false,
  upvotes = 0,
  downvotes = 0,
  courseName = '',
  searchHighlight = '',
}: ReviewCardProps) => {
  const authContext = useAuth();
  const user = authContext?.user;
  const createdDate = new Date(created);
  const timestamp = `${createdDate.getUTCMonth() + 1}/${createdDate.getUTCDate()}/${createdDate.getUTCFullYear()}`;
  const clipboardRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFirefox, setIsFirefox] = useState<boolean>(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  useEffect(() => {
    setIsFirefox(Boolean(navigator.userAgent.match(`Firefox`)));
  }, []);

  // Extract a snippet around the search match
  const searchExcerpt = useMemo(() => {
    if (!searchHighlight?.trim() || !body) return null;

    const lowerBody = body.toLowerCase();
    const lowerSearch = searchHighlight.toLowerCase();
    const matchIndex = lowerBody.indexOf(lowerSearch);

    if (matchIndex === -1) return null;

    // Get context around the match (50 chars before and after)
    const contextLength = 50;
    const start = Math.max(0, matchIndex - contextLength);
    const end = Math.min(body.length, matchIndex + searchHighlight.length + contextLength);

    let excerpt = body.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < body.length) excerpt = excerpt + '...';

    return excerpt;
  }, [body, searchHighlight]);

  const handleCopyToClipboard = async () => {
    if (!clipboardRef.current) return;
    try {
      const blob = await toBlob(clipboardRef.current, {
        skipFonts: true,
      });
      if (!blob) {
        notifyError({
          title: 'Screenshot Failed',
          message: 'Failed to capture review screenshot',
        });
        return;
      }
      const item = { [blob.type]: blob };
      const clipboardItem = new ClipboardItem(item);
      await navigator.clipboard.write([clipboardItem]);
      notifySuccess({
        title: 'Screenshot Captured!',
        message: 'Review screenshot copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      notifyError({
        title: 'Screenshot Failed',
        message: 'Could not copy screenshot to clipboard',
      });
    }
  };

  const handleDeleteReview = async () => {
    setIsSubmitting(true);
    if (user && user.id && reviewId) {
      try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          closeDeleteModal();
          window.location.reload();
        } else {
          const error = await response.json();
          notifyError({
            title: 'Delete Failed',
            message: error.error || 'Could not delete review',
          });
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        notifyError({
          title: 'Delete Failed',
          message: 'Could not delete review',
        });
      }
    }
    setIsSubmitting(false);
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 2) return 'Easy';
    if (diff <= 3) return 'Medium';
    return 'Hard';
  };

  const getDifficultyCssColor = (diff: number) => {
    // Using CSS variables for automatic dark/light mode contrast
    if (diff <= 2) return CSS_STAT_COLORS.lime;
    if (diff <= 3) return CSS_STAT_COLORS.gold;
    return CSS_STAT_COLORS.orange;
  };

  const getOverallLabel = (rating: number) => {
    if (rating >= 4) return 'Loved it';
    if (rating >= 3) return 'Liked it';
    if (rating >= 2) return 'Mixed';
    return 'Disliked';
  };

  const getOverallCssColor = (rating: number) => {
    // Using CSS variables for automatic dark/light mode contrast
    if (rating >= 4) return CSS_STAT_COLORS.lime;
    if (rating >= 3) return CSS_STAT_COLORS.teal;
    if (rating >= 2) return CSS_STAT_COLORS.gold;
    return CSS_STAT_COLORS.orange;
  };

  const semesterLabel = `${mapSemesterIdToName[semesterId]?.toUpperCase() || semesterId.toUpperCase()} ${year}`;

  return (
    <div ref={clipboardRef} data-review-card>
      <Paper p="lg" radius="lg" withBorder>
        <Stack gap="md">
          {/* Header: Semester + Badges + Date + Actions */}
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap="xs" wrap="wrap">
              <Badge
                variant="filled"
                size="md"
                radius="sm"
                styles={{
                  root: {
                    backgroundColor: GT_COLORS.navy,
                    color: '#FFFFFF',
                  },
                }}
              >
                {semesterLabel}
              </Badge>
              {isLegacy && (
                <Tooltip label="This review was originally collected on omscentral.com">
                  <Badge
                    leftSection={<IconAlertCircle size={12} />}
                    variant="outline"
                    size="sm"
                    color="orange"
                  >
                    Legacy
                  </Badge>
                </Tooltip>
              )}
              {isGTVerifiedReviewer && (
                <Badge
                  variant="light"
                  size="sm"
                  styles={{
                    root: { backgroundColor: '#FEF3E2', color: '#332600' },
                  }}
                >
                  Verified
                </Badge>
              )}
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Text size="xs" c="grayMatter">
                {timestamp}
              </Text>
              {!isFirefox && (
                <Tooltip label="Screenshot Review">
                  <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleCopyToClipboard} aria-label="Screenshot Review">
                    <IconCamera size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              {!isLegacy && reviewerId === user?.id && (
                <>
                  <Tooltip label="Edit Review">
                    <ActionIcon variant="subtle" color="blue" size="sm" onClick={openEditModal} aria-label="Edit Review">
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete Review">
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={openDeleteModal} aria-label="Delete Review">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </>
              )}
            </Group>
          </Group>

          {/* Course Name */}
          {courseName && (
            <Text fw={600} size="md">
              {courseId}: {courseName}
            </Text>
          )}

          {/* Stats Bar - Full Width Distribution */}
          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              padding: '0.75rem',
              backgroundColor: 'var(--mantine-color-default-hover)',
              borderRadius: 'var(--mantine-radius-md)',
            }}
          >
            {/* Workload */}
            <Box ta="center">
              <Text size="xs" c="grayMatter" tt="uppercase" fw={500} mb={4}>
                Workload
              </Text>
              <Text size="lg" fw={700}>
                {workload}
              </Text>
              <Text size="xs" c="grayMatter">hrs/week</Text>
            </Box>

            {/* Difficulty */}
            <Box ta="center" style={{ borderLeft: '1px solid var(--mantine-color-default-border)', borderRight: '1px solid var(--mantine-color-default-border)' }}>
              <Text size="xs" c="grayMatter" tt="uppercase" fw={500} mb={4}>
                Difficulty
              </Text>
              <Text size="lg" fw={700} style={{ color: getDifficultyCssColor(difficulty) }}>
                {difficulty}/5
              </Text>
              <Text size="xs" style={{ color: getDifficultyCssColor(difficulty) }}>{getDifficultyLabel(difficulty)}</Text>
            </Box>

            {/* Overall */}
            <Box ta="center">
              <Text size="xs" c="grayMatter" tt="uppercase" fw={500} mb={4}>
                Overall
              </Text>
              <Text size="lg" fw={700} style={{ color: getOverallCssColor(overall) }}>
                {overall}/5
              </Text>
              <Text size="xs" style={{ color: getOverallCssColor(overall) }}>{getOverallLabel(overall)}</Text>
            </Box>
          </Box>

          {/* Search Match Highlight */}
          {searchExcerpt && (
            <Box
              p="sm"
              style={{
                backgroundColor: 'var(--mantine-color-yellow-light)',
                borderRadius: 'var(--mantine-radius-sm)',
                borderLeft: '3px solid var(--mantine-color-yellow-6)',
              }}
            >
              <Text size="xs" fw={600} c="dimmed" mb={4}>
                Match found:
              </Text>
              <Text size="sm" style={{ wordBreak: 'break-word' }}>
                <HighlightedText text={searchExcerpt} highlight={searchHighlight} />
              </Text>
            </Box>
          )}

          {/* Review Body */}
          <Box className="review-body">
            <style>{`
              .review-body a { color: #0550ae; text-decoration: underline; }
              .review-body a:visited { color: #5e3894; }
              .review-body a:hover { color: #0969da; }
              [data-mantine-color-scheme="dark"] .review-body a { color: #58a6ff; }
              [data-mantine-color-scheme="dark"] .review-body a:visited { color: #a371f7; }
              [data-mantine-color-scheme="dark"] .review-body a:hover { color: #79c0ff; }
            `}</style>
            <Markdown
              remarkPlugins={[
                [
                  remarkGfm,
                  { singleTilde: false },
                  { stringLength: stringWidth },
                ],
                remarkMath,
              ]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
            >
              {body}
            </Markdown>
          </Box>
        </Stack>
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={`Delete ${mapSemesterIdToName[semesterId]} ${year} review?`}
        centered
      >
        <Stack>
          <Text size="sm">
            Your {mapSemesterIdToName[semesterId]} {year} review for {courseName || courseId} will
            be permanently deleted. This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            {isSubmitting ? (
              <Loader size="sm" />
            ) : (
              <>
                <Button variant="default" onClick={closeDeleteModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button color="red" onClick={handleDeleteReview} disabled={isSubmitting}>
                  Delete
                </Button>
              </>
            )}
          </Group>
        </Stack>
      </Modal>

      {/* Edit Review Modal */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={`Edit ${mapSemesterIdToName[semesterId]} ${year} Review`}
        centered
        size="lg"
      >
        <ReviewForm
          courseId={courseId}
          courseName={courseName as TCourseName}
          reviewInput={{
            reviewId,
            body,
            overall,
            difficulty,
            workload,
            semesterId,
            created,
            modified,
            year,
            courseId,
            reviewerId,
            isLegacy,
            isGTVerifiedReviewer,
            upvotes,
            downvotes,
          }}
          handleReviewModalClose={closeEditModal}
        />
      </Modal>
    </div>
  );
};

export default ReviewCard;
