/* --- TYPE DEFINITIONS --- */

export type TNullableNumber = number | null
export type TObjectKey = string | number

export type TKeyMap = {
	[key: string]: string
}

export type TRatingScale = 1 | 2 | 3 | 4 | 5

type TReviewsCountsByYearSemObject = {
	[yearKey: TObjectKey]: { [semesterTermKey: TObjectKey]: number }
}

/* --- DATA MODELS --- */

export interface Course {
	courseId: string
	name: string
	departmentId: string
	courseNumber: string
	url: string
	aliases: string[]
	isDeprecated: boolean
	isFoundational: boolean
	numReviews: number
	avgWorkload: TNullableNumber
	avgDifficulty: TNullableNumber
	avgOverall: TNullableNumber
	avgStaffSupport: TNullableNumber
	reviewsCountsByYearSem: TReviewsCountsByYearSemObject
}

export interface Department {
	departmentId: string
	name: string
	url: string
}

export interface Program {
	programId: string
	name: string
	url: string
}

export interface Review {
	reviewId: string
	courseId: string
	year: number
	semesterId: string
	isLegacy: boolean
	reviewerId: string
	created: number // Unix timestamp
	modified: TNullableNumber // Unix timestamp
	body: string
	upvotes: number
	downvotes: number
	/* --- general review data --- */
	workload: number
	difficulty: TRatingScale
	overall: TRatingScale
	staffSupport?: TRatingScale // N.B. not previously implemented in legacy data
	/* --- course logistics review data --- */
	isRecommended?: boolean
	isGoodFirstCourse?: boolean
	isPairable?: boolean
	hasGroupProjects?: boolean
	hasWritingAssignments?: boolean
	hasExamsQuizzes?: boolean
	hasMandatoryReadings?: boolean
	hasProgrammingAssignments?: boolean
	hasProvidedDevEnv?: boolean
	/* --- user background review data --- */
	preparation?: TRatingScale
	omsCoursesTaken?: TNullableNumber
	hasRelevantWorkExperience?: boolean
	experienceLevel?: TNullableNumber
	gradeId?: string
}

export interface Semester {
	semesterId: string
	term: number
	name: string
}

export interface Specialization {
	specializationId: string
	name: string
	programId: string
}
