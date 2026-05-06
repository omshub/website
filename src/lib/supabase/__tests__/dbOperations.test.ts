/**
 * @jest-environment node
 */

import {
  addReview,
  addUser,
  deleteReview,
  deleteUser,
  editUser,
  getAllCourseReviews,
  getRecentReviewsForCourse,
  getReview,
  getReviews,
  getReviewsCountsByYearSem,
  getReviewsRecent,
  getUser,
  getUserReviews,
  updateReview,
} from '../dbOperations';

const mockCreateClient = jest.fn();

jest.mock('../server', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

function makeQuery(result: unknown) {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    order: jest.fn(() => query),
    limit: jest.fn(() => query),
    single: jest.fn(() => query),
    insert: jest.fn(() => query),
    update: jest.fn(() => query),
    delete: jest.fn(() => query),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(resolve(result)),
  };
  return query;
}

describe('Supabase db operations', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let query: any;
  let from: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    query = makeQuery({ data: [{ id: 'row-1' }], error: null });
    from = jest.fn(() => query);
    mockCreateClient.mockResolvedValue({ from });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it('gets reviews with optional year and semester filters', async () => {
    await expect(getReviews('CS-6200', 2025, 'fa')).resolves.toEqual([{ id: 'row-1' }]);

    expect(from).toHaveBeenCalledWith('reviews');
    expect(query.eq).toHaveBeenCalledWith('course_id', 'CS-6200');
    expect(query.eq).toHaveBeenCalledWith('year', 2025);
    expect(query.eq).toHaveBeenCalledWith('semester', 'fa');
  });

  it('gets reviews without optional filters and defaults null data to an empty array', async () => {
    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);

    await expect(getReviews('CS-6200')).resolves.toEqual([]);

    expect(query.eq).toHaveBeenCalledTimes(1);
  });

  it('throws when fetching reviews fails', async () => {
    const error = new Error('select failed');
    query = makeQuery({ data: null, error });
    from.mockReturnValue(query);

    await expect(getReviews('CS-6200')).rejects.toThrow('select failed');
  });

  it('gets all reviews for a course', async () => {
    await expect(getAllCourseReviews('CS-6200')).resolves.toEqual([{ id: 'row-1' }]);

    expect(query.eq).toHaveBeenCalledWith('course_id', 'CS-6200');

    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);
    await expect(getAllCourseReviews('CS-6200')).resolves.toEqual([]);
  });

  it('throws when fetching all course reviews fails', async () => {
    const error = new Error('all failed');
    query = makeQuery({ data: null, error });
    from.mockReturnValue(query);

    await expect(getAllCourseReviews('CS-6200')).rejects.toThrow('all failed');
  });

  it('counts reviews by year and semester term', async () => {
    query = makeQuery({
      data: [
        { year: 2025, semester: 'sp' },
        { year: 2025, semester: 'sm' },
        { year: 2025, semester: 'fa' },
        { year: 2025, semester: 'xx' },
        { year: 2024, semester: 'fa' },
      ],
      error: null,
    });
    from.mockReturnValue(query);

    await expect(getReviewsCountsByYearSem('CS-6200')).resolves.toEqual({
      2024: { 3: 1 },
      2025: { 1: 2, 2: 1, 3: 1 },
    });
  });

  it('defaults null review count data to an empty object', async () => {
    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);

    await expect(getReviewsCountsByYearSem('CS-6200')).resolves.toEqual({});
  });

  it('throws when counting reviews fails', async () => {
    const error = new Error('count failed');
    query = makeQuery({ data: null, error });
    from.mockReturnValue(query);

    await expect(getReviewsCountsByYearSem('CS-6200')).rejects.toThrow('count failed');
  });

  it('gets recent reviews with default and custom limits', async () => {
    await expect(getReviewsRecent()).resolves.toEqual([{ id: 'row-1' }]);
    expect(query.limit).toHaveBeenCalledWith(100);

    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);
    await expect(getReviewsRecent(5)).resolves.toEqual([]);
    expect(query.limit).toHaveBeenCalledWith(5);
  });

  it('throws when fetching recent reviews fails', async () => {
    const error = new Error('recent failed');
    query = makeQuery({ data: null, error });
    from.mockReturnValue(query);

    await expect(getReviewsRecent()).rejects.toThrow('recent failed');
  });

  it('gets recent reviews for one course', async () => {
    await expect(getRecentReviewsForCourse('CS-6200')).resolves.toEqual([{ id: 'row-1' }]);

    expect(query.eq).toHaveBeenCalledWith('course_id', 'CS-6200');
    expect(query.limit).toHaveBeenCalledWith(50);

    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);
    await expect(getRecentReviewsForCourse('CS-6200')).resolves.toEqual([]);
  });

  it('throws when fetching recent reviews for one course fails', async () => {
    const error = new Error('course recent failed');
    query = makeQuery({ data: null, error });
    from.mockReturnValue(query);

    await expect(getRecentReviewsForCourse('CS-6200')).rejects.toThrow('course recent failed');
  });

  it('gets a single review and returns null for PostgREST no-row errors', async () => {
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(getReview('review-1')).resolves.toEqual({ id: 'row-1' });

    query = makeQuery({ data: null, error: { code: 'PGRST116' } });
    from.mockReturnValue(query);
    await expect(getReview('missing')).resolves.toBeNull();
  });

  it('throws when fetching one review fails with a real error', async () => {
    query = makeQuery({ data: null, error: new Error('review failed') });
    from.mockReturnValue(query);

    await expect(getReview('review-1')).rejects.toThrow('review failed');
  });

  it('adds reviews', async () => {
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(addReview({ id: 'review-1' } as any)).resolves.toEqual({ id: 'row-1' });

    expect(query.insert).toHaveBeenCalledWith({ id: 'review-1' });
  });

  it('throws when adding reviews fails', async () => {
    query = makeQuery({ data: null, error: new Error('add review failed') });
    from.mockReturnValue(query);

    await expect(addReview({ id: 'review-1' } as any)).rejects.toThrow('add review failed');
  });

  it('updates reviews with modified timestamps', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(updateReview('review-1', { body: 'updated' } as any)).resolves.toEqual({
      id: 'row-1',
    });

    expect(query.update).toHaveBeenCalledWith({
      body: 'updated',
      modified_at: '2026-01-02T03:04:05.000Z',
    });
  });

  it('throws when updating reviews fails', async () => {
    query = makeQuery({ data: null, error: new Error('update review failed') });
    from.mockReturnValue(query);

    await expect(updateReview('review-1', {})).rejects.toThrow('update review failed');
  });

  it('deletes reviews and throws on delete errors', async () => {
    await expect(deleteReview('review-1')).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalled();

    query = makeQuery({ error: new Error('delete review failed') });
    from.mockReturnValue(query);
    await expect(deleteReview('review-1')).rejects.toThrow('delete review failed');
  });

  it('gets users and returns null for PostgREST no-row errors', async () => {
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(getUser('user-1')).resolves.toEqual({ id: 'row-1' });

    query = makeQuery({ data: null, error: { code: 'PGRST116' } });
    from.mockReturnValue(query);
    await expect(getUser('missing')).resolves.toBeNull();
  });

  it('throws when fetching a user fails with a real error', async () => {
    query = makeQuery({ data: null, error: new Error('user failed') });
    from.mockReturnValue(query);

    await expect(getUser('user-1')).rejects.toThrow('user failed');
  });

  it('gets reviews for a user and defaults null data to an empty array', async () => {
    await expect(getUserReviews('user-1')).resolves.toEqual([{ id: 'row-1' }]);
    expect(query.eq).toHaveBeenCalledWith('reviewer_id', 'user-1');

    query = makeQuery({ data: null, error: null });
    from.mockReturnValue(query);
    await expect(getUserReviews('user-1')).resolves.toEqual([]);
  });

  it('throws when fetching user reviews fails', async () => {
    query = makeQuery({ data: null, error: new Error('user reviews failed') });
    from.mockReturnValue(query);

    await expect(getUserReviews('user-1')).rejects.toThrow('user reviews failed');
  });

  it('adds users', async () => {
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(addUser({ id: 'user-1' } as any)).resolves.toEqual({ id: 'row-1' });

    expect(query.insert).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('throws when adding users fails', async () => {
    query = makeQuery({ data: null, error: new Error('add user failed') });
    from.mockReturnValue(query);

    await expect(addUser({ id: 'user-1' } as any)).rejects.toThrow('add user failed');
  });

  it('edits users with updated timestamps', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
    query = makeQuery({ data: { id: 'row-1' }, error: null });
    from.mockReturnValue(query);

    await expect(editUser('user-1', { work_years: 2 } as any)).resolves.toEqual({
      id: 'row-1',
    });

    expect(query.update).toHaveBeenCalledWith({
      work_years: 2,
      updated_at: '2026-01-02T03:04:05.000Z',
    });
  });

  it('throws when editing users fails', async () => {
    query = makeQuery({ data: null, error: new Error('edit user failed') });
    from.mockReturnValue(query);

    await expect(editUser('user-1', {})).rejects.toThrow('edit user failed');
  });

  it('deletes users and throws on delete errors', async () => {
    await expect(deleteUser('user-1')).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalled();

    query = makeQuery({ error: new Error('delete user failed') });
    from.mockReturnValue(query);
    await expect(deleteUser('user-1')).rejects.toThrow('delete user failed');
  });
});
