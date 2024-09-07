import { TCourseId, TNullable, TSemesterId } from '@globals/types';

export interface TCourseStats {
  courseId: TCourseId;
  numReviews: number;
  year?: number;
  semesterId?: TSemesterId;
  avgWorkload: TNullable<number>;
  avgDifficulty: TNullable<number>;
  avgOverall: TNullable<number>;
}
