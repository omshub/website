/**
 * @jest-environment node
 */

import { GET } from './route';

const mockGetCourseStats = jest.fn();

jest.mock('@/lib/staticData', () => ({
  getCourseStats: (...args: unknown[]) => mockGetCourseStats(...args),
}));

describe('/api/courses', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns course stats', async () => {
    mockGetCourseStats.mockResolvedValueOnce({ 'CS-6200': { numReviews: 2 } });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ 'CS-6200': { numReviews: 2 } });
  });

  it('returns a 500 when course stats fail', async () => {
    mockGetCourseStats.mockRejectedValueOnce(new Error('data repo down'));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to fetch course stats',
    });
  });
});
