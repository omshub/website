import { WhereFilterOp } from 'firebase/firestore'

type TKeyMap = {
	[key: string]: string
}

export const coreDataDocuments: TKeyMap = {
	COURSES: 'courses',
	DEPARTMENTS: 'departments',
	PROGRAMS: 'programs',
	SEMESTERS: 'semesters',
	SPECIALIZATIONS: 'specializations',
}

export const idKeys: TKeyMap = {
	COURSE_ID: 'courseId',
	DEPARTMENT_ID: 'departmentId',
	PROGRAM_ID: 'programId',
	SEMESTER_ID: 'semesterId',
	SPECIALIZATION_ID: 'specializationId',
	USER_ID: 'userId',
}

// reference: https://firebase.google.com/docs/firestore/query-data/queries#query_operators
type TQueryOpKeyMap = {
	[key: string]: WhereFilterOp
}

export const queryOperators: TQueryOpKeyMap = {
	LESS_THAN: '<',
	LESS_THAN_OR_EQUAL_TO: '<=',
	EQUAL_TO: '==',
	GREATER_THAN: '>',
	GREATER_THAN_OR_EQUAL_TO: '>=',
	NOT_EQUAL_TO: '!=',
	ARRAY_CONTAINS: 'array-contains',
	ARRAY_CONTAINS_ANY: 'array-contains-any',
	IN: 'in',
	NOT_IN: 'not-in',
}
