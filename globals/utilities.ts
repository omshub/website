import {
  coursesDataStatic,
  departments,
  educationLevels,
  grades,
  programs,
  semesters,
  specializations,
  subjectAreas,
} from '@globals/staticDataModels';
import {
  TCourseId,
  TDepartmentId,
  TEducationLevelId,
  TGradeId,
  TPayloadCourses,
  TPayloadCoursesDataDynamic,
  TProgramId,
  TSemesterId,
  TSpecializationId,
  TSubjectAreaId,
} from '@globals/types';
import { DOMAIN_GATECH, DOMAIN_OUTLOOK } from '@globals/constants';

/* --- STATIC DATA GETTERS --- */

export const getCoursesDataStatic = () => coursesDataStatic;
export const getCourseDataStatic = (courseId: TCourseId) =>
  coursesDataStatic[courseId];

export const getDepartments = () => departments;
export const getDepartment = (departmentId: TDepartmentId) =>
  departments[departmentId];

export const getPrograms = () => programs;
export const getProgram = (programId: TProgramId) => programs[programId];

export const getSemesters = () => semesters;
export const getSemester = (semesterId: TSemesterId) => semesters[semesterId];

export const getSpecializations = () => specializations;
export const getSpecialization = (specializationId: TSpecializationId) =>
  specializations[specializationId];

export const getEducationLevels = () => educationLevels;
export const getEducationLevel = (educationLevelId: TEducationLevelId) =>
  educationLevels[educationLevelId];

export const getSubjectAreas = () => subjectAreas;
export const getSubjectArea = (subjectAreaId: TSubjectAreaId) =>
  subjectAreas[subjectAreaId];

export const getGrades = () => grades;
export const getGrade = (gradeId: TGradeId) => grades[gradeId];

/* --- MAPPERS --- */

/**
 * Converts Firebase Firestore DB payload to full `Course` data model
 * @param coursesDataDynamic Response payload from Firebase Firestore DB
 * @returns Complete `Course` data model as `TPayloadCourses`
 */
export const mapDynamicCoursesDataToCourses = (
  coursesDataDynamic: TPayloadCoursesDataDynamic,
) => {
  const coursesDataStatic = getCoursesDataStatic();
  const courses = {} as TPayloadCourses;
  // @ts-ignore -- `TCourseId` is guaranteed by `coursesDataStatic`
  Object.keys(coursesDataStatic).forEach((courseId: TCourseId) => {
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
