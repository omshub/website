/**
 * @jest-environment node
 */

import { getCourseStats, getCoursesDataStatic, getGlobalStats } from '../staticData';

describe('static data fetchers', () => {
  let fetchMock: jest.Mock;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('fetches static course data from the data repo', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 'CS-6200': { name: 'GIOS' } }),
    });

    await expect(getCoursesDataStatic()).resolves.toEqual({
      'CS-6200': { name: 'GIOS' },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/omshub/data/main/static/courses.json',
      { cache: 'no-store' }
    );
  });

  it('throws when required static course data cannot be fetched', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });

    await expect(getCoursesDataStatic()).rejects.toThrow(
      'Failed to fetch courses.json: 404'
    );
  });

  it('returns course stats and falls back to an empty object when unavailable', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 'CS-6200': { numReviews: 2 } }),
    });
    await expect(getCourseStats()).resolves.toEqual({
      'CS-6200': { numReviews: 2 },
    });

    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(getCourseStats()).resolves.toEqual({});
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Could not fetch course stats:',
      expect.any(Error)
    );
  });

  it('returns global stats and falls back to null when unavailable', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ hoursSuffered: 1, semesterWeeks: { spring: 16 } }),
    });
    await expect(getGlobalStats()).resolves.toEqual({
      hoursSuffered: 1,
      semesterWeeks: { spring: 16 },
    });

    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getGlobalStats()).resolves.toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Could not fetch global stats:',
      expect.any(Error)
    );
  });
});
