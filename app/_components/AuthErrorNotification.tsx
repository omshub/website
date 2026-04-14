'use client';

import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';

interface AuthErrorNotificationProps {
  error: string;
  errorDescription?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_error: 'Sign-in failed. Please try again.',
  unexpected_failure: 'Sign-in failed due to an unexpected error.',
  access_denied: 'Sign-in was cancelled.',
};

export default function AuthErrorNotification({ error, errorDescription }: AuthErrorNotificationProps) {
  useEffect(() => {
    const message = errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : (ERROR_MESSAGES[error] ?? 'Sign-in failed. Please try again.');

    notifications.show({
      title: 'Sign-in error',
      message,
      color: 'red',
      autoClose: 8000,
    });
  }, [error, errorDescription]);

  return null;
}
