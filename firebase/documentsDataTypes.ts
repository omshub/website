import {
	TObjectKey,
	Course,
	Review,
	User,
} from '@globals/types'

export type TDocumentData =
	| Course
	| Review
	| User

export type TDocumentDataObject = { [key: TObjectKey]: TDocumentData }
