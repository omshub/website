import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconBookmark,
  IconBookmarkFilled,
  IconLink,
} from '@tabler/icons-react';
import { ThemeIcon } from '@mantine/core';
import { GT_COLORS } from '@/lib/theme';

interface NotifyOptions {
  title: string;
  message: string;
  autoClose?: number | boolean;
}

// Success notification with GT Tech Gold accent
export function notifySuccess({ title, message, autoClose = 4000 }: NotifyOptions) {
  notifications.show({
    title,
    message,
    autoClose,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="gradient"
        gradient={{ from: GT_COLORS.canopyLime, to: GT_COLORS.olympicTeal }}
      >
        <IconCheck size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid ${GT_COLORS.canopyLime}`,
      },
      title: {
        color: GT_COLORS.navy,
      },
    },
  });
}

// Error notification with GT New Horizon accent
export function notifyError({ title, message, autoClose = 6000 }: NotifyOptions) {
  notifications.show({
    title,
    message,
    autoClose,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="gradient"
        gradient={{ from: GT_COLORS.newHorizon, to: '#CC3333' }}
      >
        <IconX size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid ${GT_COLORS.newHorizon}`,
      },
      title: {
        color: GT_COLORS.newHorizon,
      },
    },
  });
}

// Bookmark added notification
export function notifyBookmarkAdded(courseId: string) {
  notifications.show({
    title: 'Bookmarked!',
    message: `${courseId} added to your saved courses`,
    autoClose: 3000,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="gradient"
        gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
      >
        <IconBookmarkFilled size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid ${GT_COLORS.techGold}`,
      },
      title: {
        color: GT_COLORS.navy,
      },
    },
  });
}

// Bookmark removed notification
export function notifyBookmarkRemoved(courseId: string) {
  notifications.show({
    title: 'Removed',
    message: `${courseId} removed from saved courses`,
    autoClose: 3000,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="light"
        color="gray"
      >
        <IconBookmark size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid #868e96`,
      },
    },
  });
}

// Link copied notification
export function notifyLinkCopied() {
  notifications.show({
    title: 'Link Copied!',
    message: 'Course URL copied to clipboard',
    autoClose: 2500,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="gradient"
        gradient={{ from: GT_COLORS.boldBlue, to: GT_COLORS.olympicTeal }}
      >
        <IconLink size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid ${GT_COLORS.boldBlue}`,
      },
      title: {
        color: GT_COLORS.navy,
      },
    },
  });
}

// No reviews notification
export function notifyNoReviews() {
  notifications.show({
    title: 'No Reviews',
    message: 'This course has no reviews yet',
    autoClose: 3000,
    withCloseButton: true,
    icon: (
      <ThemeIcon
        size={32}
        radius="xl"
        variant="light"
        color="yellow"
      >
        <IconAlertTriangle size={18} />
      </ThemeIcon>
    ),
    styles: {
      root: {
        borderLeft: `4px solid ${GT_COLORS.buzzGold}`,
      },
    },
  });
}
