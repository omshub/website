export type TNullableNumber = number | null

export type TDocumentData =
	| Course
	| Department
	| Program
	| Review
	| Semester
	| Specialization

export type TDocumentDataObject = { [key: string | number]: TDocumentData }

type TReviewsCountsByYearSemObject = {
	[yearKey: string | number]: { [semesterTermKey: string | number]: number }
}

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

type TRatingScale = 1 | 2 | 3 | 4 | 5

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
	staffSupport: TRatingScale | null
	/* --- course logistics review data --- */
	isRecommended: boolean | null
	isGoodFirstCourse: boolean | null
	isPairable: boolean | null
	hasGroupProjects: boolean | null
	hasWritingAssignments: boolean | null
	hasExamsQuizzes: boolean | null
	hasMandatoryReadings: boolean | null
	hasProgrammingAssignments: boolean | null
	hasProvidedDevEnv: boolean | null
	/* --- user background review data --- */
	preparation: TRatingScale | null
	omsCoursesTaken: TNullableNumber
	hasRelevantWorkExperience: boolean | null
	experienceLevel: TNullableNumber
	gradeId: string | null
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
