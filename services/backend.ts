import { createClient } from '@supabase/supabase-js';
import {
  TCourseId,
  Review,
  TSemesterId,
  TNullable,
  Course,
} from '@globals/types';
import { TDatabase } from '../supabase/types';
import { unpackReviewData, zipToCoursesData } from './utilities/supabaseData';
import { TCourseStats } from './utilities/supabaseTypes';

const supabase = createClient<TDatabase>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

/* --- SUPABASE FUNCTIONS: READ OPERATIONS ---*/

/**
 * Get rows from Supabase table of type `Review`, returned with most recent reviews first.
 * @param limitCount Limit of rows returned. Default is defined as `DEFAULT_LIMIT` inside function body.
 */
const getAllReviews = async (limitCount?: number): Promise<Review[]> => {
  const DEFAULT_LIMIT = 50; // prevent large read of DB if argument is omitted
  limitCount = limitCount ?? DEFAULT_LIMIT;

  try {
    const { data, error } = await supabase.rpc('getAllReviews', {
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
};

/**
 * Get a single review from Supabase table of type `Review`.
 * @param reviewId The review ID, of general form `courseId-year-semesterId-created`.
 * @returns {Review}
 */
const getReviewByReviewId = async (
  reviewId: string,
): Promise<TNullable<Review>> => {
  try {
    const { data, error } = await supabase.rpc('getReviewByReviewId', {
      review_id: reviewId,
    });

    if (error) throw error;

    const review: TNullable<Review> = data ? (data[0] as Review) : null;

    return review;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

/**
 * Get rows from Supabase table of type `Review` for a course, returned with most recent reviews first.
 * @param courseId The OMSCS course ID. If omitted, returns all courses' reviews.
 * @returns {Review[]}
 */
const getReviewsByCourseId = async (
  courseId?: TCourseId,
): Promise<Review[]> => {
  try {
    const { data, error } = await supabase.rpc('getReviewsByCourseId', {
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
};

/**
 * Get rows from Supabase table of type `Review` for a user, returned with most recent reviews first.
 * @param userId The Supabase Auth user ID.
 * @returns {Review[]}
 */
const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase.rpc('getReviewsByUserId', {
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
};

/**
 * Get aggregate data from Supabase table of type `Course` for a course. Output includes zero-row data (i.e., `numReviews === 0`).
 * @param courseId The OMSCS course ID. If omitted, returns all courses' stats (aggregated).
 * @returns {Course[]}
 */
const getStatsByCourseId = async (courseId?: TCourseId): Promise<Course[]> => {
  try {
    const { data, error } = await supabase.rpc('getStatsByCourseId', {
      course_id: courseId,
    });

    if (error) throw error;

    let courses: Course[] = [];

    if (data) {
      courses = zipToCoursesData(data as TCourseStats[]);
    }

    return courses;
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

interface TArgsCourseStats {
  courseId?: TCourseId;
  year?: number;
  semesterId?: TSemesterId;
}

/**
 * Get aggregate data from Supabase table of type `Course` for a course. Output includes zero-row data (i.e., `numReviews === 0`). Can be queried independently for course and/or year and/or semester.
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
    const { data, error } = await supabase.rpc('getStatsByCourseYearSemester', {
      course_id: courseId,
      year_: year,
      semester_id: semesterId,
    });

    if (error) throw error;

    let courses: Course[] = [];

    if (data) {
      courses = zipToCoursesData(data as TCourseStats[]);
    }

    return courses;
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

/* --- EXPORTS --- */

// TODO: Add remaining operations (CREATE, UPDATE, DELETE)

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
