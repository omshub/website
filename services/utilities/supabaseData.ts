import { coursesDataStatic } from "@globals/staticDataModels";
import { Course, CourseDataStatic, Review, TSemesterId } from "@globals/types";
import { mapPayloadToArray } from "@src/utilities";
import { TCourseStats } from "./supabaseTypes";
import { courseFields } from "@globals/constants";

/* --- UTILITY FUNCTIONS ---*/

/**
 * Utility function to convert anonymous return type from Supabase API call to idiomatic global type `Review[]`.
 * @param data Review data returned from Supabase API 
 */
export const unpackReviewData = (data: Review[]): Review[] => {
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
export const zipToCoursesData = (stats: TCourseStats[]): Course[] => {
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
