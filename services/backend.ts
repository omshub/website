import { createClient } from '@supabase/supabase-js';
import { TCourseId, Review, TSemesterId, TNullable, Course, CourseDataStatic } from '@globals/types';
import { coursesDataStatic } from '@globals/staticDataModels';
import { TDatabase } from '../supabase/types';
import { mapPayloadToArray } from '@src/utilities';
import { courseFields } from '@globals/constants';

const supabase = createClient<TDatabase>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* --- UTILITY FUNCTIONS ---*/

/**
 * Utility function to convert anonymous return type from Supabase API call to idiomatic global type `Review[]`.
 * @param data Review data returned from Supabase API 
 */
const unpackReviewData = (data: Review[]): Review[] => {
  const reviews: Review[] = [];

  if (data.length) {
    data.forEach(({
      reviewId,
      courseId,
      year,
      semesterId,
      isLegacy,
      reviewerId,
      isGTVerifiedReviewer,
      created,
      modified,
      body,
      upvotes,
      downvotes,
      workload,
      difficulty,
      overall,
    }) => {
      reviews.push({
        reviewId,
        courseId,
        year,
        semesterId,
        isLegacy,
        reviewerId,
        isGTVerifiedReviewer,
        created,
        modified,
        body,
        upvotes,
        downvotes,
        workload,
        difficulty,
        overall,
      });
    });
  }

  return reviews;
};

interface TCourseStats {
  courseId: TCourseId;
  numReviews: number;
  year?: number;
  semesterId?: TSemesterId;
  avgWorkload: TNullable<number>;
  avgDifficulty: TNullable<number>;
  avgOverall: TNullable<number>;
}

const semesters: TSemesterId[] = ['sp', 'sm', 'fa'];

// array of years `[<EARLIEST_REVIEW_YEAR>, ..., <currentYear>]`
const years: number[] = (function() {
  const EARLIEST_REVIEW_YEAR = 2015;
  const currentYear = new Date().getFullYear();

  const yearsList: number[] = [];

  for (let yearItem = EARLIEST_REVIEW_YEAR; yearItem <= currentYear; yearItem++) {
    yearsList.push(yearItem);
  }

  return yearsList;
}());

/**
 * Utility function to convert anonymous return type from Supabase API call to idiomatic global type `Course[]`.
 * @param stats Course statistics for either course aggregate (all years & semesters combined) or course-year-semester (individually).
 * @returns {Course[]}
 */
const zipToCoursesData = (stats: TCourseStats[]): Course[] => {
  const courses: Course[] = [];

  const dataStatic: CourseDataStatic[] = mapPayloadToArray(coursesDataStatic, courseFields.courseId);

  const unreviewedCourse: Partial<TCourseStats> = {
    numReviews: 0,
    avgWorkload: null,
    avgDifficulty: null,
    avgOverall: null,
  };

  years.forEach(y => {
    semesters.forEach(s => {
      dataStatic.forEach(({
        courseId,
        name,
        departmentId,
        courseNumber,
        url,
        aliases,
        isDeprecated,
        isFoundational,
      }) => {
        // aggregate course stats only (no year or semesterId)
        const matchingStatsAggregate = stats.find(stat => stat.courseId === courseId && !stat?.year && !stat?.semesterId);
        if (matchingStatsAggregate) {
          courses.push({
            courseId,
            name,
            departmentId,
            courseNumber,
            url,
            aliases,
            isDeprecated,
            isFoundational,
            numReviews: (matchingStatsAggregate?.numReviews ?? unreviewedCourse.numReviews)!,
            avgWorkload: (matchingStatsAggregate?.avgWorkload ?? unreviewedCourse.avgWorkload)!,
            avgDifficulty: (matchingStatsAggregate?.avgDifficulty ?? unreviewedCourse.avgDifficulty)!,
            avgOverall: (matchingStatsAggregate?.avgOverall ?? unreviewedCourse.avgOverall)!,
            avgStaffSupport: null,
            reviewsCountsByYearSem: {}, // NOTE: placeholder only; remove once migrated from Firebase to Supabase
          });

          // exit inner loop prematurely if not returning year-semesterId data
          return;
        }

        // remaining cases: courseId-year-SemesterId
        const matchingStatsYearSemester = stats.find(stat => stat.courseId === courseId && stat.year == y && stat.semesterId == s);
        courses.push({
          courseId,
          name,
          departmentId,
          courseNumber,
          url,
          aliases,
          isDeprecated,
          isFoundational,
          year: (matchingStatsYearSemester?.year ?? y)!,
          semesterId: (matchingStatsYearSemester?.semesterId ?? s)!,
          numReviews: (matchingStatsYearSemester?.numReviews ?? unreviewedCourse.numReviews)!,
          avgWorkload: (matchingStatsYearSemester?.avgWorkload ?? unreviewedCourse.avgWorkload)!,
          avgDifficulty: (matchingStatsYearSemester?.avgDifficulty ?? unreviewedCourse.avgDifficulty)!,
          avgOverall: (matchingStatsYearSemester?.avgOverall ?? unreviewedCourse.avgOverall)!,
          avgStaffSupport: null,
          reviewsCountsByYearSem: {}, // NOTE: placeholder only; remove once migrated from Firebase to Supabase
        });
      });
    });
  });

  return courses;
}

/* --- SUPABASE FUNCTIONS: READ OPERATIONS ---*/

/**
 * Get rows from Supabase table of type `Review`, returned with most recent reviews first.
 * @param limitCount Limit of rows returned. Default is defined as `DEFAULT_LIMIT` inside function body.
 */
const getAllReviews = async (limitCount?: number): Promise<Review[]> => {
  const DEFAULT_LIMIT = 50; // prevent large read of DB if argument is omitted
  limitCount = limitCount ?? DEFAULT_LIMIT;

  try {
    const { data, error } = await supabase
      .rpc('getAllReviews', {
        limit_count: limitCount,
      });

    if (error) throw error;

    let reviews: Review[] = [];

    if (data && data.length) {
      reviews = unpackReviewData(data as Review[]);
    }

    return reviews;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

/**
 * Get a single review from Supabase table of type `Review`.
 * @param reviewId The review ID, of general form `courseId-year-semesterId-created`.
 * @returns {Review} 
 */
const getReviewByReviewId = async (reviewId: string): Promise<TNullable<Review>> => {
  try {
    const { data, error } = await supabase
      .rpc('getReviewByReviewId', {
        review_id: reviewId,
      });

    if (error) throw error;

    const review: TNullable<Review> = data
      ? data[0] as Review
      : null;

    return review;
  } catch (error: any) {
    console.error(error);
    return null;
  }
}

/**
 * Get rows from Supabase table of type `Review` for a course, returned with most recent reviews first.
 * @param courseId The OMSCS course ID. If omitted, returns all courses' reviews.
 * @returns {Review[]} 
 */
const getReviewsByCourseId = async (courseId?: TCourseId): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .rpc('getReviewsByCourseId', {
        course_id: courseId,
      });

    if (error) throw error;

    let reviews: Review[] = [];

    if (data && data.length) {
      reviews = unpackReviewData(data as Review[]);
    }

    return reviews;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

/**
 * Get rows from Supabase table of type `Review` for a user, returned with most recent reviews first.
 * @param userId The Supabase Auth user ID.
 * @returns {Review[]}
 */
const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .rpc('getReviewsByUserId', {
        user_id: userId,
      });

    if (error) throw error;

    let reviews: Review[] = [];

    if (data && data.length) {
      reviews = unpackReviewData(data as Review[]);
    }

    return reviews;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

/**
 * Get aggregate data from Supabase table of type `Course` for a course. Output includes zero-row data.
 * @param courseId The OMSCS course ID. If omitted, returns all courses' stats (aggregated).
 * @returns {Course[]}
 */
const getStatsByCourseId = async (courseId?: TCourseId): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .rpc('getStatsByCourseId', {
        course_id: courseId,
      });

    if (error) throw error;

    let courses: Course[] = [];

    if (data && data.length) {
      courses = zipToCoursesData(data as TCourseStats[]);
    }

    return courses;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

interface TArgsCourseStats {
  courseId?: TCourseId;
  year?: number;
  semesterId?: TSemesterId;
}

/**
 * Get aggregate data from Supabase table of type `Course` for a course. Output includes zero-row data (i.e., `numReviews == 0`). Can be queried independently for course and/or year and/or semester.
 * @param courseId The OMSCS course ID. If omitted, returns all courses' stats (year-semesterId row-wise data).
 * @param year The year of the course. If omitted, returns courseId and/or semesterId row-wise data.
 * @param semesterId The semester of the course. If omitted, returns courseId and/or year row-wise data.
 * @returns {Course[]}
 */
const getStatsByCourseYearSemester = async ({
  courseId,
  year,
  semesterId,
}: TArgsCourseStats): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .rpc('getStatsByCourseYearSemester', {
        course_id: courseId,
        year_: year,
        semester_id: semesterId,
      });

    if (error) throw error;

    let courses: Course[] = [];

    if (data && data.length) {
      courses = zipToCoursesData(data as TCourseStats[]);
    }

    return courses;
  } catch (error: any) {
    console.error(error);
    return [];
  }
}

/* --- EXPORTS --- */

const backend = {
  // READ OPERATIONS
  getAllReviews,
  getReviewByReviewId,
  getReviewsByCourseId,
  getReviewsByUserId,
  getStatsByCourseId,
  getStatsByCourseYearSemester,
};

export default backend;
