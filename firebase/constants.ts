import { WhereFilterOp } from 'firebase/firestore'
import { TKeyMap } from '../globals/types'

export const coreDataDocuments: TKeyMap = {
	COURSES: 'courses',
	DEPARTMENTS: 'departments',
	PROGRAMS: 'programs',
	SEMESTERS: 'semesters',
	SPECIALIZATIONS: 'specializations',
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

export const baseCollectionCoreData = 'coreData'
export const baseCollectionReviewsData = 'reviewsData'
export const baseDocumentReviewsRecent50 = 'reviewsRecent50/reviews'
