import {
  ASC,
  EMOJI_FALL,
  EMOJI_SPRING,
  EMOJI_SUMMER,
} from '@globals/constants';
import { semesters } from '@globals/staticDataModels';
import { TKeyMap, TRatingScale } from '@globals/types';
import {
  boldBlue,
  canopyLime,
  newHorizon,
  olympicTeal,
  RATCap,
} from '@src/colorPalette';

type TMapRatings = {
  // eslint-disable-next-line no-unused-vars
  [rating in TRatingScale]: string;
};

export const mapDifficulty: TMapRatings = {
  1: 'Very Easy',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Very Hard',
};

export const mapOverall: TMapRatings = {
  1: 'Strongly Disliked',
  2: 'Disliked',
  3: 'Neutral',
  4: 'Liked',
  5: 'Strongly Liked',
};

export const mapStaffSupport: TMapRatings = {
  1: 'Little/No Support',
  2: 'Some Support',
  3: 'Moderate Support',
  4: 'Supportive',
  5: 'Strong Support',
};

export const mapSemesterTermToName: TKeyMap = {
  1: semesters.sp.name,
  2: semesters.sm.name,
  3: semesters.fa.name,
};

export const mapSemesterTermToEmoji: TKeyMap = {
  1: EMOJI_SPRING,
  2: EMOJI_SUMMER,
  3: EMOJI_FALL,
};

export const mapSemsterIdToTerm: TKeyMap = {
  sp: semesters.sp.term,
  sm: semesters.sm.term,
  fa: semesters.fa.term,
};

export const mapSemesterIdToName: TKeyMap = {
  sp: semesters.sp.name,
  sm: semesters.sm.name,
  fa: semesters.fa.name,
};

/**
 * Returns a hex color string from a 1-5 rating, with 1 being "bad" and 5 being "good"
 */
export const mapRatingToColor = (rating: Number) => {
  const mapColorPalette: TMapRatings = {
    1: newHorizon,
    2: RATCap,
    3: boldBlue,
    4: olympicTeal,
    5: canopyLime,
  };

  const roundedRating = Math.round(rating.valueOf()) as TRatingScale;

  return mapColorPalette[roundedRating];
};

/**
 * Same as mapRatingToColor, except low values are "good" and higher values "bad"
 * @see mapRatingToColor
 */
export const mapRatingToColorInverted = (rating: Number) =>
  mapRatingToColor(-rating + 6);

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

export const roundNumber = (number: number, fixed: number) =>
  (Math.round(number * 10) / 10).toFixed(fixed);
