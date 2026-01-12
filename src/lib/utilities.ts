import {
  TCourseId,
  TPayloadCourses,
  TPayloadCoursesDataDynamic,
  TPayloadCoursesDataStatic,
} from '@/lib/types';
import { DOMAIN_GATECH, DOMAIN_OUTLOOK } from '@/lib/constants';

/* --- MAPPERS --- */

/**
 * Converts Firebase Firestore DB payload to full `Course` data model
 * @param coursesDataDynamic Response payload from Firebase Firestore DB
 * @param coursesDataStatic Static course data fetched from data repo
 * @returns Complete `Course` data model as `TPayloadCourses`
 */
export const mapDynamicCoursesDataToCourses = (
  coursesDataDynamic: TPayloadCoursesDataDynamic,
  coursesDataStatic: TPayloadCoursesDataStatic
) => {
  const courses = {} as TPayloadCourses;
  // Only include courses that exist in Firebase (have dynamic data)
  (Object.keys(coursesDataDynamic) as TCourseId[]).forEach((courseId) => {
    courses[courseId] = {
      ...coursesDataStatic[courseId],
      ...coursesDataDynamic[courseId],
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
