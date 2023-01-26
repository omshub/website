import { TKeyMap } from '@globals/types'
import { WhereFilterOp } from 'firebase/firestore'

type TDataDocumentsObject = {
	[dataDocuments: string]: string
}

export const coreDataDocuments: TDataDocumentsObject = {
	COURSES: 'courses',
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
export const baseCollectionReviewsDataFlat = '_reviewsDataFlat'
export const baseCollectionRecentsData = 'recentsData'
export const baseCollectionUsersData = 'usersData'

// Firebase emulators
export const LOCALHOST = 'localhost'

export const firebaseEmulatorPorts: TKeyMap = {
	AUTH: 9099,
	FUNCTIONS: 5001,
	FIRESTORE: 8080,
	HOSTING: 5000,
	UI: 4000,
}
