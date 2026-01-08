import { TCourseId, TNullable } from '@globals/types';
const LEN_SIMPLE_COURSE_NUMBER = 5; //   DD-CCCC-...     (e.g., CS-6200-...)     [total 5 * `-`]
const LEN_COMPOUND_COURSE_NUMBER = 6; // DD-CCCC-CCC-... (e.g., CS-8803-O08-...) [total 6 * `-`]
const SEPARATOR_TOKEN = '-';

/**
 * Parses `reviewId` into its constituent ID fields
 * @param reviewId OMSHub review ID
 * @returns OMSHub course ID, and year and semester of course taken
 */
export const parseReviewId = (reviewId: string) => {
  let courseId: TCourseId;
  let departmentId = '';
  let courseNumberA = '';
  let courseNumberB = '';
  let year = '';
  let semesterTermParsedAsString = '';

  const parsedValues = reviewId.split(SEPARATOR_TOKEN);

  if (parsedValues.length === LEN_SIMPLE_COURSE_NUMBER) {
    [departmentId, courseNumberA, year, semesterTermParsedAsString] =
      parsedValues;
    courseId = `${departmentId}-${courseNumberA}` as TCourseId;
  }

  if (parsedValues.length === LEN_COMPOUND_COURSE_NUMBER) {
    [
      departmentId,
      courseNumberA,
      courseNumberB,
      year,
      semesterTermParsedAsString,
    ] = parsedValues;
    courseId = `${departmentId}-${courseNumberA}-${courseNumberB}` as TCourseId;
  }

  return {
    // @ts-expect-error -- courseId is TCourseId in this context
    courseId,
    year,
    semesterTerm: semesterTermParsedAsString,
  };
};

export type TAveragesData = {
  oldAverage?: TNullable<number>;
  oldCount?: number;
  newCount: number;
  oldValue?: number;
  newValue?: number;
};

/**
 * Update aggregate average value on add, update, or delete of single data value
 * @param oldAverage Old average value
 * @param oldCount Old count of group data
 * @param newCount New count of group data
 * @param oldValue Old data value
 * @param newValue New data value
 * @returns Updated average value per new count and new value
 */
export const updateAverage = ({
  oldAverage,
  oldCount = 0, // 0 for `oldAverage === null`
  newCount,
  oldValue = 0, // 0 for add new value
  newValue = 0, // 0 for delete existing value
}: TAveragesData) => {
  if (newCount <= 0) {
    return null;
  }

  oldAverage = oldAverage ?? 0;
  oldValue = oldValue ?? 0;
  newValue = newValue ?? 0;

  // adding new value:        newCount - oldCount ===  1
  // editing existing value:  newCount - oldCount ===  0
  // deleting existing value: newCount - oldCount === -1
  return (
    (oldAverage * oldCount - oldValue + newValue) /
    (oldCount + (newCount - oldCount))
  );
};

type TAveragesInputData = {
  courseId: TCourseId;
  // N.B. `avg`s are null when `numReviews` === 0
  avgWorkload?: TNullable<number>;
  avgDifficulty?: TNullable<number>;
  avgOverall?: TNullable<number>;
  avgStaffSupport?: TNullable<number>;
  oldWorkload?: number;
  oldDifficulty?: number;
  oldOverall?: number;
  oldStaffSupport?: number; // N.B. `staffSupport` is null for legacy reviews, however, those records are not modifiable
  newWorkload?: number;
  newDifficulty?: number;
  newOverall?: number;
  newStaffSupport?: number; // N.B. `staffSupport` is null for legacy reviews, however, those records are not modifiable
  oldCount?: number;
  newCount: number;
  oldValue?: number;
  newValue?: number;
};

/**
 * Recalculate averages for workload, difficult, and overall
 * on review add, edit, or delete.
 */
export const updateAverages = ({
  courseId,
  oldCount,
  newCount,
  oldWorkload,
  oldDifficulty,
  oldOverall,
  oldStaffSupport,
  newWorkload,
  newDifficulty,
  newOverall,
  newStaffSupport,
  avgWorkload,
  avgDifficulty,
  avgStaffSupport,
  avgOverall,
}: TAveragesInputData) => ({
  avgWorkload: updateAverage({
    oldAverage: avgWorkload,
    oldCount,
    newCount,
    oldValue: oldWorkload,
    newValue: newWorkload,
  }),
  avgDifficulty: updateAverage({
    oldAverage: avgDifficulty,
    oldCount,
    newCount,
    oldValue: oldDifficulty,
    newValue: newDifficulty,
  }),
  avgOverall: updateAverage({
    oldAverage: avgOverall,
    oldCount,
    newCount,
    oldValue: oldOverall,
    newValue: newOverall,
  }),
  // non-legacy fields -- requires backing out old/legacy numReviews
  avgStaffSupport: updateAverage({
    oldAverage: avgStaffSupport,
    oldCount: oldCount
      ? oldCount - mapCourseToLegacyNumReviews[courseId]
      : undefined,
    newCount: newCount - mapCourseToLegacyNumReviews[courseId],
    oldValue: oldStaffSupport,
    newValue: newStaffSupport,
  }),
});

type TMapCourseToLegacyNumReviews = {
   
  [courseId in TCourseId]: number;
};

export const mapCourseToLegacyNumReviews: TMapCourseToLegacyNumReviews = {
  'CS-6035': 398,
  'CS-6150': 2,
  'CS-6200': 256,
  'CS-6210': 85,
  'CS-6211': 0,
  'CS-6238': 29,
  'CS-6250': 326,
  'CS-6260': 39,
  'CS-6261': 0,
  'CS-6262': 126,
  'CS-6263': 74,
  'CS-6264': 4,
  'CS-6265': 20,
  'CS-6266': 0,
  'CS-6290': 88,
  'CS-6291': 35,
  'CS-6300': 233,
  'CS-6310': 156,
  'CS-6340': 136,
  'CS-6400': 230,
  'CS-6422': 0,
  'CS-6435': 0,
  'CS-6440': 83,
  'CS-6457': 13,
  'CS-6460': 89,
  'CS-6465': 1,
  'CS-6475': 153,
  'CS-6476': 162,
  'CS-6491': 0,
  'CS-6515': 270,
  'CS-6601': 236,
  'CS-6603': 49,
  'CS-6675': 5,
  'CS-6726': 0,
  'CS-6727': 0,
  'CS-6747': 7,
  'CS-6750': 210,
  'CS-6795': 2,
  'CS-7210': 31,
  'CS-7280': 24,
  'CS-7400': 0,
  'CS-7450': 0,
  'CS-7470': 2,
  'CS-7632': 16,
  'CS-7637': 216,
  'CS-7638': 237,
  'CS-7639': 32,
  'CS-7641': 285,
  'CS-7642': 181,
  'CS-7643': 70,
  'CS-7646': 339,
  'CS-7650': 0,
  'CS-8803-O04': 10,
  'CS-8803-O05': 0,
  'CS-8803-O06': 0,
  'CS-8803-O08': 16,
  'CS-8803-O12': 9,
  'CS-8803-O13': 0,
  'CS-8803-O15': 0,
  'CS-8803-O16': 0,
  'CS-8803-O17': 0,
  'CS-8803-O21': 0,
  'CS-8803-O22': 0,
  'CS-8803-O23': 0,
  'CS-8803-O24': 0,
  'CS-8803-OC1': 7,
  'CS-8813': 0,
  'CSE-6040': 110,
  'CSE-6140': 0,
  'CSE-6220': 67,
  'CSE-6240': 0,
  'CSE-6242': 260,
  'CSE-6250': 61,
  'CSE-6742': 4,
  'CSE-8803': 0,
  'ECE-6150': 0,
  'ECE-6266': 0,
  'ECE-6320': 0,
  'ECE-6323': 0,
  'ECE-8803a': 0,
  'ECE-8803c': 0,
  'ECE-8803d': 0,
  'ECE-8803e': 1,
  'ECE-8803g': 0,
  'ECE-8803h': 0,
  'ECE-8813': 0,
  'ECE-8823': 0,
  'ECE-8843': 1,
  'ECE-8853': 0,
  'ECE-8863': 0,
  'ECE-8873': 0,
  'INTA-6014': 0,
  'INTA-6103': 7,
  'INTA-6450': 20,
  'INTA-8803G': 0,
  'ISYE-6402': 32,
  'ISYE-6404': 0,
  'ISYE-6413': 0,
  'ISYE-6414': 90,
  'ISYE-6416': 1,
  'ISYE-6420': 57,
  'ISYE-6501': 150,
  'ISYE-6644': 99,
  'ISYE-6650': 1,
  'ISYE-6669': 42,
  'ISYE-6740': 35,
  'ISYE-7406': 18,
  'ISYE-8803': 32,
  'MGT-6203': 107,
  'MGT-6311': 25,
  'MGT-6727': 10,
  'MGT-6748': 4,
  'MGT-8803': 83,
  'MGT-8813': 15,
  'MGT-8823': 13,
  'PUBP-6111': 1,
  'PUBP-6266': 0,
  'PUBP-6501': 8,
  'PUBP-6502': 3,
  'PUBP-6725': 17,
  'PUBP-8823': 0,
};
