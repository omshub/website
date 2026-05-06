/**
 * @jest-environment node
 */

import {
  notifyBookmarkAdded,
  notifyBookmarkRemoved,
  notifyError,
  notifyLinkCopied,
  notifyNoReviews,
  notifySuccess,
} from './notifications';

const mockShow = jest.fn();

jest.mock('@mantine/notifications', () => ({
  notifications: {
    show: (...args: unknown[]) => mockShow(...args),
  },
}));

jest.mock('@mantine/core', () => ({
  ThemeIcon: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

jest.mock('@tabler/icons-react', () => ({
  IconAlertTriangle: () => <svg data-testid="alert" />,
  IconBookmark: () => <svg data-testid="bookmark" />,
  IconBookmarkFilled: () => <svg data-testid="bookmark-filled" />,
  IconCheck: () => <svg data-testid="check" />,
  IconLink: () => <svg data-testid="link" />,
  IconX: () => <svg data-testid="x" />,
}));

describe('notification helpers', () => {
  beforeEach(() => {
    mockShow.mockClear();
  });

  it('shows success and error notifications with overridable autoclose values', () => {
    notifySuccess({ title: 'Saved', message: 'Done', autoClose: false });
    notifyError({ title: 'Failed', message: 'Nope', autoClose: 1 });

    expect(mockShow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ title: 'Saved', message: 'Done', autoClose: false })
    );
    expect(mockShow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ title: 'Failed', message: 'Nope', autoClose: 1, color: 'red' })
    );
  });

  it('uses default autoclose values for success and error notifications', () => {
    notifySuccess({ title: 'Saved', message: 'Done' });
    notifyError({ title: 'Failed', message: 'Nope' });

    expect(mockShow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ autoClose: 4000 })
    );
    expect(mockShow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ autoClose: 6000 })
    );
  });

  it('shows course action notifications', () => {
    notifyBookmarkAdded('CS-6200');
    notifyBookmarkRemoved('CS-6200');
    notifyLinkCopied();
    notifyNoReviews();

    expect(mockShow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ title: 'Bookmarked!', message: 'CS-6200 added to your saved courses' })
    );
    expect(mockShow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ title: 'Removed', message: 'CS-6200 removed from saved courses' })
    );
    expect(mockShow).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ title: 'Link Copied!' })
    );
    expect(mockShow).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({ title: 'No Reviews' })
    );
  });
});
