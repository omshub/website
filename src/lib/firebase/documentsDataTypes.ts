import { TCourseId, TObjectKey, Course, Review, User } from '@/lib/types';

export type TDocumentData = Course | Review | User;

export type TDocumentDataId = TCourseId | string;

export type TDocumentDataObject = { [key: TObjectKey]: TDocumentData };
