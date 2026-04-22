'use client';

import { useEffect } from 'react';
import { notifications } from '@mantine/notifications';

interface AuthErrorNotificationProps {
  error: string;
  errorDescription?: string;
  reason?: string;
  message?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  auth_callback_error: 'Sign-in failed. Please try again.',
  unexpected_failure: 'Sign-in failed due to an unexpected error.',
  access_denied: 'Sign-in was cancelled.',
};

// Diagnostic reasons stamped by /auth/callback. Surfaced verbatim in the
// notification so we can distinguish failure modes without reading server logs.
const REASON_MESSAGES: Record<string, string> = {
  no_code: 'Callback reached with no authorization code.',
  exchange_failed: 'Token exchange with Supabase failed.',
  no_session: 'Token exchange returned no session.',
  no_pending_cookies: 'Session succeeded but no cookies were queued to set.',
};

export default function AuthErrorNotification({
  error,
  errorDescription,
  reason,
  message: reasonMessage,
}: AuthErrorNotificationProps) {
  useEffect(() => {
    const base = errorDescription
      ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
      : (ERROR_MESSAGES[error] ?? 'Sign-in failed. Please try again.');

    const reasonDetail = reason
      ? `${REASON_MESSAGES[reason] ?? reason}${reasonMessage ? ` — ${decodeURIComponent(reasonMessage.replace(/\+/g, ' '))}` : ''}`
      : null;

    notifications.show({
      title: 'Sign-in error',
      message: reasonDetail ? `${base} (${reasonDetail})` : base,
      color: 'red',
      autoClose: 8000,
    });
  }, [error, errorDescription, reason, reasonMessage]);

  return null;
}
