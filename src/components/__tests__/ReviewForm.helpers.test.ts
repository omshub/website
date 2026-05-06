jest.mock('next/dynamic', () => () => () => null);
jest.mock('@mantine/core', () => ({
  Alert: () => null,
  Badge: () => null,
  Box: () => null,
  Button: () => null,
  Divider: () => null,
  Group: () => null,
  Loader: () => null,
  NumberInput: () => null,
  Paper: () => null,
  Rating: () => null,
  Select: () => null,
  Stack: () => null,
  Text: () => null,
  ThemeIcon: () => null,
}));
jest.mock('react-hook-form', () => ({
  Controller: () => null,
  useForm: jest.fn(),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/components/TipTapEditor', () => ({ __esModule: true, default: () => null }));
jest.mock('@/utils/notifications', () => ({
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}));

import {
  buildReviewPayload,
  canSubmitReview,
  fetchUserReviews,
  getYearRange,
  loadTipTapEditor,
  submitReviewAndNotify,
  submitReviewRequest,
  validateSemesterYear,
  validateUserNotTakenCourse,
} from '@/components/ReviewForm';
import { notifyError, notifySuccess } from '@/utils/notifications';

const reviewData = {
  year: 2025,
  semesterId: 'fa',
  body: 'Good course',
  workload: 12,
  overall: 5,
  difficulty: 3,
} as any;

describe('ReviewForm helpers', () => {
  beforeEach(() => {
    jest.useRealTimers();
    global.fetch = jest.fn(async () => ({ ok: true })) as any;
  });

  it('builds payloads and determines submit readiness', () => {
    expect(buildReviewPayload('CS-6200' as any, reviewData, 123)).toEqual({
      reviewId: 'CS-6200-2025-3-123',
      courseId: 'CS-6200',
      year: 2025,
      semesterId: 'fa',
      body: 'Good course',
      workload: 12,
      difficulty: 3,
      overall: 5,
    });

    expect(canSubmitReview('CS-6200' as any, reviewData, { id: '1', email: 'a@b.com' }, true)).toBe(true);
    expect(canSubmitReview('CS-6200' as any, reviewData, null, true)).toBe(false);
    expect(canSubmitReview('CS-6200' as any, { ...reviewData, year: null }, { id: '1', email: 'a@b.com' }, true)).toBe(false);
    expect(canSubmitReview('CS-6200' as any, reviewData, { id: '1' }, true)).toBe(false);
    expect(canSubmitReview('CS-6200' as any, reviewData, { id: '1', email: 'a@b.com' }, false)).toBe(false);
  });

  it('loads the editor component dynamically', async () => {
    await expect(loadTipTapEditor()).resolves.toBeDefined();
  });

  it('submits create and update requests and throws failed responses', async () => {
    await expect(submitReviewRequest('CS-6200' as any, reviewData, null)).resolves.toEqual(
      expect.objectContaining({ reviewId: expect.stringContaining('CS-6200-2025-3-') })
    );
    expect(global.fetch).toHaveBeenCalledWith('/api/reviews', expect.objectContaining({ method: 'POST' }));

    await expect(
      submitReviewRequest('CS-6200' as any, reviewData, { reviewId: 'existing' } as any)
    ).resolves.toEqual(expect.objectContaining({ body: 'Good course' }));
    expect(global.fetch).toHaveBeenCalledWith('/api/reviews/existing', expect.objectContaining({ method: 'PUT' }));

    global.fetch = jest.fn(async () => ({ ok: false })) as any;
    await expect(submitReviewRequest('CS-6200' as any, reviewData, null)).rejects.toThrow('Failed to create review');
    await expect(
      submitReviewRequest('CS-6200' as any, reviewData, { reviewId: 'existing' } as any)
    ).rejects.toThrow('Failed to update review');
  });

  it('submits with notifications and fetches user reviews', async () => {
    const reload = jest.fn();
    const close = jest.fn();

    await submitReviewAndNotify('CS-6200' as any, reviewData, null, close, reload);
    expect(notifySuccess).toHaveBeenCalledWith(expect.objectContaining({ title: 'Review Submitted!' }));
    expect(close).toHaveBeenCalled();
    expect(reload).toHaveBeenCalled();

    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({ review: true }),
    })) as any;
    await expect(fetchUserReviews('user-1')).resolves.toEqual({ review: true });

    global.fetch = jest.fn(async () => ({ ok: false })) as any;
    await expect(fetchUserReviews('user-1')).resolves.toEqual({});

    global.fetch = jest.fn(async () => {
      throw new Error('network');
    }) as any;
    await expect(fetchUserReviews('user-1')).resolves.toEqual({});

    await submitReviewAndNotify('CS-6200' as any, reviewData, null, close);
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Submission Failed' }));
  });

  it('validates year windows and duplicate user review keys', () => {
    expect(getYearRange()[0]).toBe(new Date().getFullYear());
    expect(validateSemesterYear(null, null)).toBeUndefined();
    expect(validateSemesterYear('fa', 2019)).toBe(true);

    expect(validateSemesterYear('sp', 2026, { getFullYear: () => 2026, valueOf: () => 0 } as any)).toBe(false);
    expect(validateSemesterYear('fa', 2026, new Date('2026-10-01T00:00:00Z'))).toBe(true);

    expect(validateUserNotTakenCourse({}, 'CS-6200' as any, null, null)).toBeUndefined();
    expect(validateUserNotTakenCourse({}, 'CS-6200' as any, 'fa', 2025)).toBe(true);
    expect(validateUserNotTakenCourse({ 'CS-6200-2025-3-1': {} } as any, 'CS-6200' as any, 'fa', 2025)).toBe(false);
  });
});
