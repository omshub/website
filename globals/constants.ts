import { TKeyMap } from '@globals/types'

export const COURSE_ID = 'courseId'
export const DEPARTMENT_ID = 'departmentId'
export const PROGRAM_ID = 'programId'
export const SEMESTER_ID = 'semesterId'
export const SPECIALIZATION_ID = 'specializationId'
export const USER_ID = 'userId'
export const REVIEW_ID = 'reviewId'
export const GRADE_ID = 'gradeId'

export const ASC = 'ASC'
export const DESC = 'DESC'

/* --- DATA MODELS FIELDS --- */

// common fields
const NAME = 'name'
const URL = 'url'

export const courseFields: TKeyMap = {
	COURSE_ID,
	NAME,
	DEPARTMENT_ID,
	COURSE_NUMBER: 'courseNumber',
	URL,
	ALIASES: 'aliases',
	IS_DEPRECATED: 'isDeprecated',
	IS_FOUNDATIONAL: 'isFoundational',
	NUM_REVIEWS: 'numReviews',
	AVG_WORKLOAD: 'avgWorkload',
	AVG_DIFFICULTY: 'avgDifficulty',
	AVG_OVERALL: 'avgOverall',
	AVG_STAFF_SUPPORT: 'avgStaffSupport',
	REVIEWS_COUNT_BY_YEAR_SEM: 'reviewsCountByYearSem',
}

export const departmentFields: TKeyMap = {
	DEPARTMENT_ID,
	NAME,
	URL,
}

export const programFields: TKeyMap = {
	PROGRAM_ID,
	NAME,
	URL,
}

export const semesterFields: TKeyMap = {
	SEMESTER_ID,
	TERM: 'term',
	NAME,
}

export const specializationFields: TKeyMap = {
	SPECIALIZATION_ID,
	NAME,
	PROGRAM_ID,
}

export const reviewFields: TKeyMap = {
	REVIEW_ID,
	COURSE_ID,
	YEAR: 'year',
	SEMESTER_ID,
	IS_LEGACY: 'isLegacy',
	REVIEWER_ID: 'reviewerId',
	CREATED: 'created',
	MODIFIED: 'modified',
	BODY: 'body',
	UPVOTES: 'upvotes',
	DOWNVOTES: 'downvotes',
	WORKLOAD: 'workload',
	DIFFICULTY: 'difficulty',
	OVERALL: 'overall',
	STAFF_SUPPORT: 'staffSupport',
	IS_RECOMMENDED: 'isRecommended',
	IS_GOOD_FIRST_COURSE: 'isGoodFirstCourse',
	IS_PAIRABLE: 'isPairable',
	HAS_GROUP_PROJECTS: 'hasGroupProjects',
	HAS_WRITING_ASSIGNMENTS: 'hasWritingAssignments',
	HAS_EXAMS_QUIZZES: 'hasExamsQuizzes',
	HAS_MANDATORY_READINGS: 'hasMandatoryReadings',
	HAS_PROGRAMMING_ASSIGNMENTS: 'hasProgrammingAssignments',
	HAS_PROVIDED_DEV_ENV: 'hasProvidedDevEnv',
	PREPARATION: 'preparation',
	OMS_COURSES_TAKEN: 'omsCoursesTaken',
	HAS_RELEVANT_WORK_EXPERIENCE: 'hasRelevantWorkExperience',
	EXPERIENCE_LEVEL: 'experienceLevel',
	GRADE_ID,
}
