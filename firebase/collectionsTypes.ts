export interface Course {
	courseId: string
	name: string
	departmentId: string
	aliases: string[]
	url: string
	isFoundational: boolean
	isDeprecated: boolean
	numReviews: number
	avgWorkload: number
	avgDifficulty: number
	avgOverall: number
	avgStaffSupport: number
}

export interface Program {
	programId: string
	name: string
	url: string
}

export interface Semester {
	semesterId: string
	term: number
	name: string
}

export interface Department {
	departmentId: string
	name: string
}

export interface Specialization {
	specializationId: string
	name: string
}

export type TCollection =
	| Course
	| Department
	| Program
	| Semester
	| Specialization
