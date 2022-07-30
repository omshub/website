export type TDocumentData =
	| Course
	| Department
	| Program
	| Review
	| Semester
	| Specialization

export type TDocumentDataObject = { [key: string]: TDocumentData }

type TReviewsCountsByYearSemObject = { [key: string]: TDocumentData }

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
	avgWorkload: number | null
	avgDifficulty: number | null
	avgOverall: number | null
	avgStaffSupport: number | null
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
	courseId: string
	year: number
	semesterId: string
	isLegacy: boolean
	reviewerId: string
	created: number // Unix timestamp
	modified: number // Unix timestamp
	body: string
	upvotes: number
	downvotes: number
	/* --- general review data --- */
	workload: number
	difficulty: number
	overall: number
	staffSupport: number
	/* --- course logistics review data --- */
	isRecommended: boolean
	isGoodFirstCourse: boolean
	isPairable: boolean
	hasGroupProjects: boolean
	hasWritingAssignments: boolean
	hasExamsQuizzes: boolean
	hasMandatoryReadings: boolean
	hasProgrammingAssignments: boolean
	hasProvidedDevEnv: boolean
	/* --- user background review data --- */
	preparation: number
	omsCoursesTaken: number
	hasRelevantWorkExperience: boolean
	experienceLevel: number
	gradeId: string
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
