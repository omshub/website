jest.mock('@mantine/core', () => ({
  ActionIcon: () => null,
  Badge: () => null,
  Box: () => null,
  Button: () => null,
  Group: () => null,
  Loader: () => null,
  Modal: () => null,
  Paper: () => null,
  Stack: () => null,
  Text: () => null,
  Tooltip: () => null,
}));
jest.mock('@mantine/hooks', () => ({ useDisclosure: jest.fn() }));
jest.mock('@/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/utils/notifications', () => ({
  notifyError: jest.fn(),
  notifySuccess: jest.fn(),
}));
jest.mock('html-to-image', () => ({ toBlob: jest.fn() }));
jest.mock('react-markdown', () => ({ __esModule: true, default: () => null }));
jest.mock('string-width', () => ({ __esModule: true, default: (value: string) => value.length }));
jest.mock('remark-gfm', () => ({}));
jest.mock('remark-math', () => ({}));
jest.mock('rehype-katex', () => ({}));
jest.mock('rehype-raw', () => ({}));
jest.mock('@/components/ReviewForm', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/HighlightedText', () => ({ __esModule: true, default: () => null }));

import {
  copyReviewScreenshot,
  deleteReviewRequest,
  getDifficultyCssColor,
  getDifficultyLabel,
  getOverallCssColor,
  getOverallLabel,
  getSearchExcerpt,
} from '@/components/ReviewCard';
import { CSS_STAT_COLORS } from '@/lib/theme';
import { toBlob } from 'html-to-image';
import { notifyError, notifySuccess } from '@/utils/notifications';

describe('ReviewCard helpers', () => {
  it('extracts search excerpts around matches', () => {
    expect(getSearchExcerpt('short body', '')).toBeNull();
    expect(getSearchExcerpt('', 'body')).toBeNull();
    expect(getSearchExcerpt('short body', 'missing')).toBeNull();
    expect(getSearchExcerpt('short body', 'body')).toBe('short body');

    const body = `${'a'.repeat(60)}target${'b'.repeat(60)}`;
    expect(getSearchExcerpt(body, 'target')).toBe(`...${'a'.repeat(50)}target${'b'.repeat(50)}...`);
  });

  it('labels and colors difficulty and overall ratings', () => {
    expect(getDifficultyLabel(1)).toBe('Easy');
    expect(getDifficultyLabel(3)).toBe('Medium');
    expect(getDifficultyLabel(5)).toBe('Hard');
    expect(getDifficultyCssColor(1)).toBe(CSS_STAT_COLORS.lime);
    expect(getDifficultyCssColor(3)).toBe(CSS_STAT_COLORS.gold);
    expect(getDifficultyCssColor(5)).toBe(CSS_STAT_COLORS.orange);

    expect(getOverallLabel(5)).toBe('Loved it');
    expect(getOverallLabel(3)).toBe('Liked it');
    expect(getOverallLabel(2)).toBe('Mixed');
    expect(getOverallLabel(1)).toBe('Disliked');
    expect(getOverallCssColor(5)).toBe(CSS_STAT_COLORS.lime);
    expect(getOverallCssColor(3)).toBe(CSS_STAT_COLORS.teal);
    expect(getOverallCssColor(2)).toBe(CSS_STAT_COLORS.gold);
    expect(getOverallCssColor(1)).toBe(CSS_STAT_COLORS.orange);
  });

  it('copies screenshot blobs and reports copy failures', async () => {
    expect(await copyReviewScreenshot(null)).toBe('missing-element');

    const element = document.createElement('div');
    (toBlob as jest.Mock).mockResolvedValueOnce(null);
    await expect(copyReviewScreenshot(element)).resolves.toBe('missing-blob');
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ title: 'Screenshot Failed' }));

    const write = jest.fn(async () => undefined);
    (global as any).ClipboardItem = function ClipboardItem(value: unknown) {
      return value;
    };
    (toBlob as jest.Mock).mockResolvedValueOnce(new Blob(['x'], { type: 'image/png' }));
    await expect(copyReviewScreenshot(element, { write } as any)).resolves.toBe('copied');
    expect(write).toHaveBeenCalled();
    expect(notifySuccess).toHaveBeenCalledWith(expect.objectContaining({ title: 'Screenshot Captured!' }));

    (toBlob as jest.Mock).mockRejectedValueOnce(new Error('capture failed'));
    await expect(copyReviewScreenshot(element, { write } as any)).resolves.toBe('failed');
  });

  it('deletes reviews and reports delete errors', async () => {
    global.fetch = jest.fn(async () => ({ ok: true })) as any;
    await expect(deleteReviewRequest('review-1')).resolves.toBe(true);
    expect(global.fetch).toHaveBeenCalledWith('/api/reviews/review-1', { method: 'DELETE' });

    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({ error: 'Nope' }),
    })) as any;
    await expect(deleteReviewRequest('review-2')).resolves.toBe(false);
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Nope' }));

    global.fetch = jest.fn(async () => ({
      ok: false,
      json: async () => ({}),
    })) as any;
    await expect(deleteReviewRequest('review-3')).resolves.toBe(false);
    expect(notifyError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Could not delete review' }));
  });
});
