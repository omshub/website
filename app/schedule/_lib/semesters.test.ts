import {
  getCurrentSemester,
  getFutureCandidates,
  getInitialActiveSemester,
  getPastSemesters,
  getRegistrationDefaultTerm,
  getRegistrationStatus,
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

  const registrationCalendar = {
    schemaVersion: 1,
    source: 'test',
    generatedAt: '2026-01-01T00:00:00Z',
    terms: [
      {
        term: '202608',
        phase1: { start: '2026-04-13', end: '2026-04-30' },
        continuingOmscs: { start: '2026-05-01', end: '2026-08-16' },
        phase2: { start: '2026-08-17', end: '2026-08-31' },
      },
      {
        term: '202702',
        availability: '2026-10-14',
        phase1: { start: '2026-11-02', end: '2026-11-20' },
        phase2: { start: '2027-01-04', end: '2027-01-15' },
      },
    ],
  };

  it.each([
    ['2026-08-14T12:00:00', '202608'],
    ['2026-10-14T12:00:00', '202608'],
    ['2026-11-02T12:00:00', '202702'],
    ['2027-01-04T12:00:00', '202702'],
  ])('defaults to the furthest available term whose Phase I has begun on %s', (now, expected) => {
    expect(getRegistrationDefaultTerm(['202608', '202702'], registrationCalendar, new Date(now))).toBe(expected);
  });

  it('falls back to the calendar-current term when the calendar is malformed or incompatible', () => {
    expect(getRegistrationDefaultTerm(['202608'], { schemaVersion: 2, terms: [] }, new Date('2026-08-14T12:00:00'))).toBe('202608');
    expect(getRegistrationDefaultTerm(['202608'], null, new Date('2026-05-06T12:00:00'))).toBe('202605');
  });

  it('compares date-only registration boundaries in the local calendar day', () => {
    expect(getRegistrationDefaultTerm(['202702'], registrationCalendar, new Date(2026, 10, 2, 0, 0))).toBe('202702');
  });

  it('ignores malformed registration dates', () => {
    const malformedDateCalendar = {
      schemaVersion: 1,
      terms: [{ term: '202702', phase1: { start: '2026-02-30', end: '2026-11-20' } }],
    };

    expect(getRegistrationDefaultTerm(['202702'], malformedDateCalendar, new Date('2026-08-14T12:00:00'))).toBe('202608');
  });

  it('reports only the active registration phase for the selected term', () => {
    expect(getRegistrationStatus('202608', registrationCalendar, new Date('2026-08-17T12:00:00'))).toEqual({
      label: 'Phase II registration open',
      accessibleLabel: 'Registration status: Phase II registration open',
    });
    expect(getRegistrationStatus('202702', registrationCalendar, new Date('2026-08-17T12:00:00'))).toBeNull();
    expect(getRegistrationStatus('202608', registrationCalendar, new Date('2026-09-01T12:00:00'))).toBeNull();
  });
});
