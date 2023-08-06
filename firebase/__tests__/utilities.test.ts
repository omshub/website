// mock imports (cf. `/firebase/__mocks__`)
import 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

// non-mock imports
import { cloneDeep } from 'lodash';
import {
  updateReviewsRecent,
  ON_ADD_REVIEW,
  ON_EDIT_REVIEW,
} from '@backend/utilities';
import {
  Review,
  TCourseId,
  TPayloadCoursesDataDynamic,
  TPayloadReviews,
} from '@globals/types';
import {
  getCourses,
  getCourse,
  getReviewsRecent,
  getReviews,
  getReview,
} from '@backend/dbOperations';

const _aggregateData = '_aggregateData';

// type definitions for mock responses data
type TMockReviewsRecentData = {
  // eslint-disable-next-line no-unused-vars
  [courseId in TCourseId | '_aggregateData']: Review[];
};

type TMockReviewsData = {
  // eslint-disable-next-line no-unused-vars
  [courseId in TCourseId]: {
    [yearSemesterTerm: string]: TPayloadReviews;
  };
};

// mock the dbOperations functions
jest.mock('@backend/dbOperations', () => ({
  getCourses: jest.fn(),
  getCourse: jest.fn(),
  updateCourse: jest.fn(),
  getReviewsRecent: jest.fn(),
  getReviews: jest.fn(),
  getReview: jest.fn(),
  updateReview: jest.fn(),
}));

describe('backend utilities tests', () => {
  // mock the Firebase Firestore responses
  let mockCoursesData: Partial<TPayloadCoursesDataDynamic> = {};
  let mockReviewsRecentData: Partial<TMockReviewsRecentData> = {};
  let mockReviewsData: Partial<TMockReviewsData> = {};
  let mockReviewsDataFlat: TPayloadReviews = {};

  beforeEach(() => {
    mockCoursesData = {
      'CS-6035': {
        courseId: 'CS-6035',
        numReviews: 1,
        avgWorkload: 4,
        avgDifficulty: 1,
        avgOverall: 4,
        avgStaffSupport: null,
        reviewsCountsByYearSem: { 2022: { 1: 1 } },
      },
      'CS-6150': {
        courseId: 'CS-6150',
        numReviews: 1,
        avgWorkload: 9,
        avgDifficulty: 3,
        avgOverall: 3,
        avgStaffSupport: null,
        reviewsCountsByYearSem: { 2022: { 1: 1 } },
      },
      'CS-6200': {
        courseId: 'CS-6200',
        numReviews: 2,
        avgWorkload: 11.5,
        avgDifficulty: 3.5,
        avgOverall: 2,
        avgStaffSupport: null,
        reviewsCountsByYearSem: { 2022: { 1: 2 } },
      },
    };

    mockReviewsRecentData = {
      _aggregateData: [
        {
          reviewId: 'CS-6150-2022-1-1650861991417',
          courseId: 'CS-6150',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'xyz',
          isGTVerifiedReviewer: false,
          created: 1650861991417,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 9,
          difficulty: 3,
          overall: 3,
        },
        {
          reviewId: 'CS-6035-2022-1-1651453027591',
          courseId: 'CS-6035',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'xyz',
          isGTVerifiedReviewer: false,
          created: 1651453027591,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 4,
          difficulty: 1,
          overall: 4,
        },
        {
          reviewId: 'CS-6200-2022-1-1651810061319',
          courseId: 'CS-6200',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'def',
          isGTVerifiedReviewer: false,
          created: 1651810061319,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 15,
          difficulty: 4,
          overall: 3,
        },
        {
          reviewId: 'CS-6200-2022-1-1652068644484',
          courseId: 'CS-6200',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'abc',
          isGTVerifiedReviewer: false,
          created: 1652068644484,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 8,
          difficulty: 3,
          overall: 1,
        },
      ],
      'CS-6035': [
        {
          reviewId: 'CS-6035-2022-1-1651453027591',
          courseId: 'CS-6035',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'xyz',
          isGTVerifiedReviewer: false,
          created: 1651453027591,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 4,
          difficulty: 1,
          overall: 4,
        },
      ],
      'CS-6150': [
        {
          reviewId: 'CS-6150-2022-1-1650861991417',
          courseId: 'CS-6150',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'xyz',
          isGTVerifiedReviewer: false,
          created: 1650861991417,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 9,
          difficulty: 3,
          overall: 3,
        },
      ],
      'CS-6200': [
        {
          reviewId: 'CS-6200-2022-1-1652068644484',
          courseId: 'CS-6200',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'abc',
          isGTVerifiedReviewer: false,
          created: 1652068644484,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 8,
          difficulty: 3,
          overall: 1,
        },
        {
          reviewId: 'CS-6200-2022-1-1651810061319',
          courseId: 'CS-6200',
          year: 2022,
          semesterId: 'sp',
          isLegacy: true,
          reviewerId: 'def',
          isGTVerifiedReviewer: false,
          created: 1651810061319,
          modified: null,
          body: 'existing review',
          upvotes: 0,
          downvotes: 0,
          workload: 15,
          difficulty: 4,
          overall: 3,
        },
      ],
    };

    mockReviewsData = {
      'CS-6035': {
        '2022-1': {
          'CS-6035-2022-1-1651453027591': {
            reviewId: 'CS-6035-2022-1-1651453027591',
            courseId: 'CS-6035',
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'xyz',
            isGTVerifiedReviewer: false,
            created: 1651453027591,
            modified: null,
            body: 'existing review',
            upvotes: 0,
            downvotes: 0,
            workload: 4,
            difficulty: 1,
            overall: 4,
          },
        },
      },
      'CS-6150': {
        '2022-1': {
          'CS-6150-2022-1-1650861991417': {
            reviewId: 'CS-6150-2022-1-1650861991417',
            courseId: 'CS-6150',
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'xyz',
            isGTVerifiedReviewer: false,
            created: 1650861991417,
            modified: null,
            body: 'existing review',
            upvotes: 0,
            downvotes: 0,
            workload: 9,
            difficulty: 3,
            overall: 3,
          },
        },
      },
      'CS-6200': {
        '2022-1': {
          'CS-6200-2022-1-1652068644484': {
            reviewId: 'CS-6200-2022-1-1652068644484',
            courseId: 'CS-6200',
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'abc',
            isGTVerifiedReviewer: false,
            created: 1652068644484,
            modified: null,
            body: 'existing review',
            upvotes: 0,
            downvotes: 0,
            workload: 8,
            difficulty: 3,
            overall: 1,
          },
          'CS-6200-2022-1-1651810061319': {
            reviewId: 'CS-6200-2022-1-1651810061319',
            courseId: 'CS-6200',
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'def',
            isGTVerifiedReviewer: false,
            created: 1651810061319,
            modified: null,
            body: 'existing review',
            upvotes: 0,
            downvotes: 0,
            workload: 15,
            difficulty: 4,
            overall: 3,
          },
        },
      },
    };

    mockReviewsDataFlat = {
      'CS-6150-2022-1-1650861991417': {
        reviewId: 'CS-6150-2022-1-1650861991417',
        courseId: 'CS-6150',
        year: 2022,
        semesterId: 'sp',
        isLegacy: true,
        reviewerId: 'xyz',
        isGTVerifiedReviewer: false,
        created: 1650861991417,
        modified: null,
        body: 'existing review',
        upvotes: 0,
        downvotes: 0,
        workload: 9,
        difficulty: 3,
        overall: 3,
      },
      'CS-6035-2022-1-1651453027591': {
        reviewId: 'CS-6035-2022-1-1651453027591',
        courseId: 'CS-6035',
        year: 2022,
        semesterId: 'sp',
        isLegacy: true,
        reviewerId: 'xyz',
        isGTVerifiedReviewer: false,
        created: 1651453027591,
        modified: null,
        body: 'existing review',
        upvotes: 0,
        downvotes: 0,
        workload: 4,
        difficulty: 1,
        overall: 4,
      },
      'CS-6200-2022-1-1651810061319': {
        reviewId: 'CS-6200-2022-1-1651810061319',
        courseId: 'CS-6200',
        year: 2022,
        semesterId: 'sp',
        isLegacy: true,
        reviewerId: 'def',
        isGTVerifiedReviewer: false,
        created: 1651810061319,
        modified: null,
        body: 'existing review',
        upvotes: 0,
        downvotes: 0,
        workload: 15,
        difficulty: 4,
        overall: 3,
      },
      'CS-6200-2022-1-1652068644484': {
        reviewId: 'CS-6200-2022-1-1652068644484',
        courseId: 'CS-6200',
        year: 2022,
        semesterId: 'sp',
        isLegacy: true,
        reviewerId: 'abc',
        isGTVerifiedReviewer: false,
        created: 1652068644484,
        modified: null,
        body: 'existing review',
        upvotes: 0,
        downvotes: 0,
        workload: 8,
        difficulty: 3,
        overall: 1,
      },
    };

    // provide the mocked dBOperations functions implementations
    (getCourses as jest.Mock).mockResolvedValue(mockCoursesData);
    (getCourse as jest.Mock).mockImplementation((courseId: TCourseId) =>
      Promise.resolve(mockCoursesData[courseId]),
    );
    (getReviewsRecent as jest.Mock).mockImplementation((courseId?: TCourseId) =>
      Promise.resolve(
        courseId
          ? mockReviewsRecentData[courseId]
          : mockReviewsRecentData[_aggregateData],
      ),
    );
    (getReviews as jest.Mock).mockImplementation(
      (courseId: TCourseId, year: string, semesterTerm: string) =>
        Promise.resolve(mockReviewsData[courseId]![`${year}-${semesterTerm}`]),
    );
    (getReview as jest.Mock).mockImplementation((reviewId: string) =>
      Promise.resolve(mockReviewsDataFlat[reviewId]),
    );
  });

  describe('reviews data CRUD sub-operations', () => {
    describe('base updates', () => {
      describe('updateReviewsRecent', () => {
        it('adds a review to recents data array for course', async () => {
          // arrange
          const reviewId = 'CS-6035-2023-2-1691132155000';
          const courseId: TCourseId = 'CS-6035';
          const reviewData: Review = {
            reviewId,
            courseId,
            year: 2023,
            semesterId: 'sm',
            isLegacy: false,
            reviewerId: 'tuv',
            isGTVerifiedReviewer: false,
            created: 1691132155000,
            modified: null,
            body: 'new review',
            upvotes: 0,
            downvotes: 0,
            workload: 10,
            difficulty: 1,
            overall: 5,
          };
          const oldRecentsArray = cloneDeep(mockReviewsRecentData[courseId])!;

          // act
          await updateReviewsRecent({
            operation: ON_ADD_REVIEW,
            reviewData,
            reviewId,
            courseId,
          });

          // assert
          const expectedOutput = [...oldRecentsArray, reviewData];
          expect(mockReviewsRecentData[courseId]).toMatchObject(expectedOutput);
        });

        it('adds a review to recents data array for aggregate', async () => {
          // arrange
          const reviewId = 'CS-6035-2023-2-1691132155000';
          const courseId: TCourseId = 'CS-6035';
          const reviewData: Review = {
            reviewId,
            courseId,
            year: 2023,
            semesterId: 'sm',
            isLegacy: false,
            reviewerId: 'tuv',
            isGTVerifiedReviewer: false,
            created: 1691132155000,
            modified: null,
            body: 'new review',
            upvotes: 0,
            downvotes: 0,
            workload: 10,
            difficulty: 1,
            overall: 5,
          };
          const oldRecentsArray = cloneDeep(
            mockReviewsRecentData[_aggregateData],
          )!;

          // act
          await updateReviewsRecent({
            operation: ON_ADD_REVIEW,
            reviewData,
            reviewId,
          });

          // assert
          const expectedOutput = [...oldRecentsArray, reviewData];
          expect(mockReviewsRecentData[_aggregateData]).toMatchObject(
            expectedOutput,
          );
        });

        it('updates a review in recents data array for course', async () => {
          // arrange
          const reviewId = 'CS-6035-2022-1-1651453027591';
          const courseId: TCourseId = 'CS-6035';
          const reviewData: Review = {
            reviewId,
            courseId,
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'xyz',
            isGTVerifiedReviewer: false,
            created: 1651453027591,
            modified: Date.now(),
            body: 'updated review',
            upvotes: 0,
            downvotes: 0,
            workload: 4,
            difficulty: 1,
            overall: 4,
          };
          const oldRecentsArray = cloneDeep(mockReviewsRecentData[courseId])!;
          const indexOfReview = oldRecentsArray.findIndex(
            (review) => review.reviewId === reviewId,
          );

          // act
          await updateReviewsRecent({
            operation: ON_EDIT_REVIEW,
            reviewData,
            reviewId,
            courseId,
          });

          // assert
          oldRecentsArray.splice(indexOfReview, 1, reviewData);
          expect(mockReviewsRecentData[courseId]).toMatchObject(
            oldRecentsArray,
          );
        });

        it('updates a review in recents data array for aggregate', async () => {
          // arrange
          const reviewId = 'CS-6035-2022-1-1651453027591';
          const courseId: TCourseId = 'CS-6035';
          const reviewData: Review = {
            reviewId,
            courseId,
            year: 2022,
            semesterId: 'sp',
            isLegacy: true,
            reviewerId: 'xyz',
            isGTVerifiedReviewer: false,
            created: 1651453027591,
            modified: Date.now(),
            body: 'updated review',
            upvotes: 0,
            downvotes: 0,
            workload: 4,
            difficulty: 1,
            overall: 4,
          };
          const oldRecentsArray = cloneDeep(
            mockReviewsRecentData[_aggregateData],
          )!;
          const indexOfReview = oldRecentsArray.findIndex(
            (review) => review.reviewId === reviewId,
          );

          // act
          await updateReviewsRecent({
            operation: ON_EDIT_REVIEW,
            reviewData,
            reviewId,
          });

          // assert
          oldRecentsArray.splice(indexOfReview, 1, reviewData);
          expect(mockReviewsRecentData[_aggregateData]).toMatchObject(
            oldRecentsArray,
          );
        });

        it('deletes a review in recents data array for course', async () => {
          // TODO
        });

        it('deletes a review in recents data array for aggregate', async () => {
          // TODO
        });
      });
    });

    describe('updateUser', () => {
      // TODO
    });

    describe('addOrUpdateReview', () => {
      // TODO
    });
  });

  describe('updates on add review', () => {
    describe('updateCourseDataOnAddReview', () => {
      // TODO
    });

    describe('updateReviewsRecentOnAddReview', () => {
      // TODO
    });

    describe('updateUserDataOnAddReview', () => {
      // TODO
    });
  });

  describe('updates on update review', () => {
    describe('updateCourseDataOnUpdateReview', () => {
      // TODO
    });

    describe('updateReviewsRecentOnUpdateReview', () => {
      // TODO
    });

    describe('updateUserDataOnUpdateReview', () => {
      // TODO
    });
  });

  describe('updates on delete review', () => {
    describe('updateCourseDataOnDeleteReview', () => {
      // TODO
    });

    describe('updateReviewsRecentOnDeleteReview', () => {
      // TODO
    });

    describe('updateUserDataOnDeleteReview', () => {
      // TODO
    });
  });
});
