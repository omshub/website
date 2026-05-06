jest.mock('@mantine/core', () => ({
  ActionIcon: () => null,
  Badge: () => null,
  Box: () => null,
  Button: () => null,
  CopyButton: () => null,
  Divider: () => null,
  Group: () => null,
  Menu: Object.assign(() => null, {
    Dropdown: () => null,
    Item: () => null,
    Label: () => null,
    Target: () => null,
  }),
  Paper: () => null,
  Text: () => null,
  Tooltip: () => null,
  Transition: () => null,
}));
jest.mock('@mantine/hooks', () => ({
  useLocalStorage: jest.fn(),
  useWindowScroll: jest.fn(),
}));
jest.mock('@/utils/notifications', () => ({
  notifyBookmarkAdded: jest.fn(),
  notifyBookmarkRemoved: jest.fn(),
  notifyNoReviews: jest.fn(),
}));

import {
  getCourseInfoText,
  getCourseMarkdown,
  scrollToRandomReview,
  toggleBookmarkedCourses,
} from '@/components/CourseActionBar';

describe('CourseActionBar helpers', () => {
  it('formats copy text and toggles bookmark ids', () => {
    expect(getCourseInfoText('CS-6200', 'Operating Systems', 'https://omshub.org/course/CS-6200')).toBe(
      'CS-6200: Operating Systems\nhttps://omshub.org/course/CS-6200'
    );
    expect(getCourseMarkdown('CS-6200', 'Operating Systems', 'https://omshub.org/course/CS-6200')).toBe(
      '**CS-6200**: Operating Systems\n[View Reviews](https://omshub.org/course/CS-6200)'
    );
    expect(toggleBookmarkedCourses([], 'CS-6200')).toEqual(['CS-6200']);
    expect(toggleBookmarkedCourses(['CS-6200', 'CS-6300'], 'CS-6200')).toEqual(['CS-6300']);
  });

  it('scrolls and highlights a random review when one exists', () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div data-review-card></div><div data-review-card></div>';
    const reviews = document.querySelectorAll('[data-review-card]');
    reviews.forEach((review) => {
      review.scrollIntoView = jest.fn();
    });

    expect(scrollToRandomReview(reviews, 0.75)).toBe(true);
    expect(reviews[1].scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(reviews[1].classList.contains('highlight-review')).toBe(true);
    jest.advanceTimersByTime(2000);
    expect(reviews[1].classList.contains('highlight-review')).toBe(false);
    jest.useRealTimers();
  });

  it('returns false when no reviews exist', () => {
    document.body.innerHTML = '';
    expect(scrollToRandomReview(document.querySelectorAll('[data-review-card]'))).toBe(false);
  });
});
