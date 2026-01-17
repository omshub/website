import {
  TCourseId,
  TPayloadCourses,
  TPayloadCoursesDataDynamic,
  TPayloadCoursesDataStatic,
} from '@/lib/types';
import { DOMAIN_GATECH, DOMAIN_OUTLOOK } from '@/lib/constants';

/* --- MAPPERS --- */

/**
 * Merges dynamic course stats with static course data to create full Course model
 * @param coursesDataDynamic Dynamic stats (object keyed by courseId)
 * @param coursesDataStatic Static course data fetched from data repo
 * @returns Complete `Course` data model as `TPayloadCourses`
 */
export const mapDynamicCoursesDataToCourses = (
  coursesDataDynamic: TPayloadCoursesDataDynamic,
  coursesDataStatic: TPayloadCoursesDataStatic
) => {
  const courses = {} as TPayloadCourses;
  // Include ALL courses from static data repo, add dynamic stats where available
  (Object.keys(coursesDataStatic) as TCourseId[])
    .filter((courseId) => !coursesDataStatic[courseId]?.isDeprecated)
    .forEach((courseId) => {
      const staticData = coursesDataStatic[courseId];
      const dynamicData = coursesDataDynamic[courseId];
      courses[courseId] = {
        ...staticData,
        courseId,
        numReviews: dynamicData?.numReviews ?? 0,
        avgWorkload: dynamicData?.avgWorkload ?? null,
        avgDifficulty: dynamicData?.avgDifficulty ?? null,
        avgOverall: dynamicData?.avgOverall ?? null,
        avgStaffSupport: dynamicData?.avgStaffSupport ?? null,
        reviewsCountsByYearSem: dynamicData?.reviewsCountsByYearSem ?? {},
      };
    });
  return courses;
};

/* --- UTILITY FUNCTIONS --- */

/**
 * Extract email domain from email input
 * @param userEmail Input user email
 * @param domain Input email domain (including prefix `@`)
 * @returns Email domain
 * @example
 * // `gatechDomain` has value `@gatech.edu`
 * const gatechDomain = extractEmailDomain('gpb@gatech.edu', '@gatech.edu');
 */
export const extractEmailDomain = (userEmail: string, domain: string) =>
  userEmail.toLowerCase().slice(userEmail.length - domain.length);

/**
 * Determine if `userEmail` has domain `@gatech.edu`
 * @param userEmail Input user email
 * @returns Boolean `true` (domain is `@gatech.edu`) or `false` (otherwise)
 */
export const isGTEmail = (userEmail: string) =>
  extractEmailDomain(userEmail, DOMAIN_GATECH).includes(DOMAIN_GATECH);

/**
 * Determine if `userEmail` has domain `@outlook.com`
 * @param userEmail Input user email
 * @returns Boolean `true` (domain is `@outlook.com`) or `false` (otherwise)
 */
export const isOutlookEmail = (userEmail: string) =>
  extractEmailDomain(userEmail, DOMAIN_OUTLOOK).includes(DOMAIN_OUTLOOK);
