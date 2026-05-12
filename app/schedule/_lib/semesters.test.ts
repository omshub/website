import {
  getCurrentSemester,
  getFutureCandidates,
  getInitialActiveSemester,
  getPastSemesters,
  getScheduleSemesterOptions,
  getTermCode,
  getTermLabel,
} from './semesters';

describe('schedule semester helpers', () => {
  it('maps semester term codes and labels', () => {
    expect(getTermCode(2026, 'sp')).toBe('202602');
    expect(getTermCode(2026, 'sm')).toBe('202605');
    expect(getTermCode(2026, 'fa')).toBe('202608');
    expect(getTermLabel('202605')).toBe('Summer 2026');
  });

  const currentSemesterCases = [
    ['2026-01-01T18:00:00Z', { year: 2026, semester: 'sp' }],
    ['2026-01-15T12:00:00Z', { year: 2026, semester: 'sp' }],
    ['2026-04-30T18:00:00Z', { year: 2026, semester: 'sp' }],
    ['2026-05-01T18:00:00Z', { year: 2026, semester: 'sm' }],
    ['2026-05-06T12:00:00Z', { year: 2026, semester: 'sm' }],
    ['2026-07-31T18:00:00Z', { year: 2026, semester: 'sm' }],
    ['2026-08-01T18:00:00Z', { year: 2026, semester: 'fa' }],
    ['2026-08-01T12:00:00Z', { year: 2026, semester: 'fa' }],
    ['2026-12-31T18:00:00Z', { year: 2026, semester: 'fa' }],
  ] as const;

  currentSemesterCases.forEach(([date, expected]) => {
    it(`selects the current semester for ${date}`, () => {
      expect(getCurrentSemester(new Date(date))).toEqual(expected);
    });
  });

  it('builds past semesters from the current semester back to the program start', () => {
    const semesters = getPastSemesters(new Date('2026-05-06T12:00:00Z'));

    expect(semesters.slice(0, 4)).toEqual([
      { value: '202605', label: 'Summer 2026' },
      { value: '202602', label: 'Spring 2026' },
      { value: '202508', label: 'Fall 2025' },
      { value: '202505', label: 'Summer 2025' },
    ]);
    expect(semesters.at(-1)).toEqual({ value: '201402', label: 'Spring 2014' });
  });

  it('probes only future semesters after the active current semester', () => {
    expect(getFutureCandidates(3, new Date('2026-05-06T12:00:00Z'))).toEqual([
      '202608',
      '202702',
      '202705',
    ]);
  });

  it('wraps future semester candidates across year boundaries', () => {
    expect(getFutureCandidates(3, new Date('2026-11-01T12:00:00Z'))).toEqual([
      '202702',
      '202705',
      '202708',
    ]);
  });

  it('keeps the current semester active when future semesters are available', () => {
    const currentDate = new Date('2026-05-06T12:00:00Z');
    const pastSemesters = getPastSemesters(currentDate);

    const semesters = getScheduleSemesterOptions(pastSemesters, ['202608']);

    expect(getInitialActiveSemester(pastSemesters)).toBe('202605');
    expect(semesters.slice(0, 2)).toEqual([
      { value: '202608', label: 'Fall 2026' },
      { value: '202605', label: 'Summer 2026' },
    ]);
  });

  it('deduplicates discovered future terms that are already in the base semester list', () => {
    const pastSemesters = getPastSemesters(new Date('2026-05-06T12:00:00Z'));

    const semesters = getScheduleSemesterOptions(pastSemesters, ['202608', '202605', '202608']);

    expect(semesters.filter((semester) => semester.value === '202608')).toHaveLength(1);
    expect(semesters.filter((semester) => semester.value === '202605')).toHaveLength(1);
  });

  it('falls back to no active semester when no base semesters exist', () => {
    expect(getInitialActiveSemester([])).toBe('');
    expect(getScheduleSemesterOptions([], ['202608'])).toEqual([{ value: '202608', label: 'Fall 2026' }]);
  });
});
