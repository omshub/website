import {
	TObjectKey,
	Course,
	Department,
	Program,
	Review,
	Semester,
	Specialization,
} from '../globals/types'

export type TDocumentData =
	| Course
	| Department
	| Program
	| Review
	| Semester
	| Specialization

export type TDocumentDataObject = { [key: TObjectKey]: TDocumentData }
