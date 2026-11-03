import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  discoverRegistration,
  fetchRegistrationSnapshot,
  getCourseRegistrationSections,
} from './registration';
const snapshot = {
  term: '202702',
  lastUpdated: '2026-11-03T20:14:55Z',
  courses: {
    'CS-8803-O08': {
      courseId: 'CS-8803-O08',
      sections: [
        {
          crn: '25121',
          sectionNumber: 'O08',
          enrolled: 1,
          capacity: 100,
          seatsAvailable: 99,
        },
      ],
    },
    'CS-8803-O15': {
      courseId: 'CS-8803-O15',
      sections: [
        {
          crn: '29737',
          sectionNumber: 'O15',
          enrolled: 24,
          capacity: 150,
          seatsAvailable: 126,
        },
      ],
    },
  },
};
const fetchMock = jest.fn();
const response = (status, data = snapshot) => ({
  status,
  ok: status === 200,
  json: async () => data,
});
beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock;
});
describe('registration data', () => {
  it('matches the full real special-topic key, never a prefix or another topic', () => {
    expect(
      getCourseRegistrationSections(snapshot, 'CS-8803-O08').map((s) => s.crn),
    ).toEqual(['25121']);
    expect(getCourseRegistrationSections(snapshot, 'CS-8803')).toEqual([]);
    expect(getCourseRegistrationSections(snapshot, 'CS-8803-O99')).toEqual([]);
  });
  it('rejects mismatched identities and malformed sections rather than claiming not offered', () => {
    expect(() =>
      getCourseRegistrationSections(
        {
          ...snapshot,
          courses: { 'CS-8803-O08': snapshot.courses['CS-8803-O15'] },
        },
        'CS-8803-O08',
      ),
    ).toThrow();
    expect(() =>
      getCourseRegistrationSections(
        {
          ...snapshot,
          courses: { X: { courseId: 'X', sections: [{ crn: 'bad' }] } },
        },
        'X',
      ),
    ).toThrow();
  });
  it('selects the newest published term, including future publication, using uncached abortable requests', async () => {
    fetchMock
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(200));
    const signal = new AbortController().signal;
    const result = await discoverRegistration(signal, new Date(2026, 10, 3));
    expect(
      fetchMock.mock.calls.map(([url]) => String(url).split('/').pop()),
    ).toEqual(['202708.json', '202705.json', '202702.json']);
    expect(result.terms[0]).toEqual({ value: '202702', label: 'Spring 2027' });
    expect(result.snapshot.term).toBe('202702');
    expect(fetchMock).toHaveBeenLastCalledWith(expect.any(String), {
      cache: 'no-store',
      signal,
    });
  });
  it('does not fall back to an older CRN when the latest published term omits the course', async () => {
    fetchMock.mockResolvedValueOnce(
      response(200, { ...snapshot, term: '202708', courses: {} }),
    );
    const result = await discoverRegistration(
      new AbortController().signal,
      new Date(2026, 10, 3),
    );
    expect(
      getCourseRegistrationSections(result.snapshot, 'CS-8803-O08'),
    ).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it('does not hide network/server failures behind older terms', async () => {
    fetchMock.mockResolvedValueOnce(response(503));
    await expect(
      discoverRegistration(new AbortController().signal, new Date(2026, 10, 3)),
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(
      fetchRegistrationSnapshot('202702', new AbortController().signal),
    ).rejects.toThrow('offline');
  });
  it('rejects a different term or invalid payload', async () => {
    fetchMock.mockResolvedValueOnce(
      response(200, { ...snapshot, term: '202608' }),
    );
    await expect(
      fetchRegistrationSnapshot('202702', new AbortController().signal),
    ).rejects.toThrow();
    fetchMock.mockResolvedValueOnce(
      response(200, { term: '202702', courses: [] }),
    );
    await expect(
      fetchRegistrationSnapshot('202702', new AbortController().signal),
    ).rejects.toThrow();
  });
});
