jest.mock('@mantine/core', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
  Group: ({ children }: any) => <div>{children}</div>,
  rem: (value: number) => `${value}px`,
  Text: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@mantine/spotlight', () => ({
  Spotlight: () => null,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/lib/staticData', () => ({
  getCoursesDataStatic: jest.fn(async () => ({
    'CS-6200': { name: 'Operating Systems', aliases: ['GIOS'] },
    'CS-9999': { name: '', aliases: undefined },
    'CS-0000': { name: 'Deprecated', isDeprecated: true },
  })),
}));

import {
  buildSpotlightActions,
  fetchSimpleCourses,
  filterSpotlightActions,
  formatSpotlightRating,
  mapInitialCourses,
} from '@/components/SpotlightSearch';

const courses = [
  {
    courseId: 'CS-6200',
    name: 'Operating Systems',
    aliases: ['GIOS', 'IOS'],
    numReviews: 10,
    avgDifficulty: 3.25,
    avgWorkload: 12.6,
    avgOverall: 4.8,
  },
  {
    courseId: 'CS-6300',
    name: 'Software Development Process',
    aliases: ['SDP'],
    numReviews: 10,
    avgDifficulty: null,
    avgWorkload: null,
    avgOverall: null,
  },
  {
    courseId: 'CS-6400',
    name: 'Database Systems',
    aliases: [],
    numReviews: 0,
    avgDifficulty: undefined,
    avgWorkload: undefined,
    avgOverall: undefined,
  },
] as any[];

describe('SpotlightSearch helpers', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        'CS-6200': { numReviews: 4, avgDifficulty: 3.2, avgWorkload: 11.8, avgOverall: 4.1 },
      }),
    })) as any;
  });

  it('maps initial and fetched courses into simple course rows', async () => {
    expect(mapInitialCourses({ 'CS-1': { courseId: 'CS-1', name: 'One' } as any })).toEqual([
      expect.objectContaining({ courseId: 'CS-1', aliases: [] }),
    ]);
    expect(mapInitialCourses()).toEqual([]);

    await expect(fetchSimpleCourses()).resolves.toEqual([
      expect.objectContaining({ courseId: 'CS-6200', name: 'Operating Systems', avgWorkload: 11.8 }),
      expect.objectContaining({ courseId: 'CS-9999', name: 'CS-9999', numReviews: 0 }),
    ]);

    global.fetch = jest.fn(async () => ({ ok: false, json: async () => ({}) })) as any;
    await expect(fetchSimpleCourses()).resolves.toEqual(
      expect.arrayContaining([expect.objectContaining({ courseId: 'CS-6200', numReviews: 0 })])
    );
  });

  it('builds actions, ratings, navigation callbacks, and default review sorting', () => {
    const push = jest.fn();
    const actions = buildSpotlightActions(courses, { push } as any);

    expect(formatSpotlightRating(null)).toBe('-');
    expect(formatSpotlightRating(undefined)).toBe('-');
    expect(formatSpotlightRating(3.25)).toBe('3.3');
    expect(actions.map((action) => action.id)).toEqual(['CS-6200', 'CS-6300', 'CS-6400']);

    actions[0].onClick();
    expect(push).toHaveBeenCalledWith('/course/CS-6200');
    expect(buildSpotlightActions([], { push } as any)).toEqual([]);
  });

  it('filters by every supported match tier', () => {
    const actions = buildSpotlightActions(courses, { push: jest.fn() } as any) as any[];

    expect(filterSpotlightActions('', actions, courses as any)).toBe(actions);
    expect(filterSpotlightActions('gios', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('gi', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('io', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('cs-6200', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('cs-6', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('620', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('database', actions, courses as any)[0].id).toBe('CS-6400');
    expect(filterSpotlightActions('systems', actions, courses as any)[0].id).toBe('CS-6200');
    expect(filterSpotlightActions('development', actions, courses as any)[0].id).toBe('CS-6300');
    expect(filterSpotlightActions('no-match', actions, courses as any)).toEqual([]);
  });
});
