import {
  ASC,
  EMOJI_FALL,
  EMOJI_SPRING,
  EMOJI_SUMMER,
} from '@/lib/constants';
import { TKeyMap } from '@/lib/types';

// Inlined semester data to avoid dependency on staticDataModels
const semesterNames = {
  sp: 'Spring',
  sm: 'Summer',
  fa: 'Fall',
} as const;

const semesterTerms = {
  sp: 1,
  sm: 2,
  fa: 3,
} as const;

export const mapSemesterTermToName: TKeyMap = {
  1: semesterNames.sp,
  2: semesterNames.sm,
  3: semesterNames.fa,
};

export const mapSemesterTermToEmoji: TKeyMap = {
  1: EMOJI_SPRING,
  2: EMOJI_SUMMER,
  3: EMOJI_FALL,
};

export const mapSemsterIdToTerm: TKeyMap = {
  sp: semesterTerms.sp,
  sm: semesterTerms.sm,
  fa: semesterTerms.fa,
};

export const mapSemesterIdToName: TKeyMap = {
  sp: semesterNames.sp,
  sm: semesterNames.sm,
  fa: semesterNames.fa,
};

type TSortKey =
  | 'courseId'
  | 'departmentId'
  | 'programId'
  | 'semesterId'
  | 'specializationId'
  | 'userId';
type TSortDirection = 'ASC' | 'DESC';

/**
 * Convert payload object to array form. By default, sorting falls through to existing ordering.
 * @param map The payload object (an object of objects)
 * @param sortKey The ID field used for sort-ordering in array output
 * @param sortDirection Ascending (default) or descending
 * @returns array form of payload object
 */
export const mapPayloadToArray = (
  map: TKeyMap | undefined,
  sortKey?: TSortKey | string,
  sortDirection?: TSortDirection,
) => {
  const outputArray = [];
  if (map) {
    for (const key in map) {
      outputArray.push(map[key]);
    }
  }
  if (sortKey) {
    if (!sortDirection) {
      sortDirection = ASC;
    }
    const isAscendingSortFactor = sortDirection === ASC ? 1 : -1;
    outputArray.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA < valB
          ? isAscendingSortFactor * -1
          : isAscendingSortFactor * 1;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAscendingSortFactor * (valA - valB);
      }

      // default fallthrough (returns elements in original order)
      return -1;
    });
  }
  return outputArray;
};
