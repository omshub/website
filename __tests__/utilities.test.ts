import { DESC } from '@/lib/constants';
import { TCourseId } from '@/lib/types';
import {
  mapSemesterIdToName,
  mapSemesterTermToEmoji,
  mapSemesterTermToName,
  mapSemsterIdToTerm,
  // mapRatingToColor,
  // mapRatingToColorInverted,
  mapPayloadToArray,
} from '@/utilities';

// types
type TInputPayload = {
   
  [T in TCourseId]: any;
};

describe('frontend utilities tests', () => {
  it('exports semester lookup maps', () => {
    expect(mapSemesterTermToName).toEqual({ 1: 'Spring', 2: 'Summer', 3: 'Fall' });
    expect(mapSemesterTermToEmoji).toEqual({ 1: '🌱', 2: '🌞', 3: '🍂' });
    expect(mapSemsterIdToTerm).toEqual({ sp: 1, sm: 2, fa: 3 });
    expect(mapSemesterIdToName).toEqual({ sp: 'Spring', sm: 'Summer', fa: 'Fall' });
  });

  describe('mapRatingToColor()', () => {
    it('maps ratings to colors', () => {
      // TODO
    });
  });

  describe('mapRatingToColorInverted()', () => {
    it('maps ratings to inverted colors', () => {
      // TODO
    });
  });

  describe('mapPayloadToArray()', () => {
    let inputPayload: Partial<TInputPayload> = {};

    beforeEach(() => {
      inputPayload = {
        'CS-6035': { sortKeyField: 3, courseId: 'CS-6035' },
        'CS-6150': { sortKeyField: 1, courseId: 'CS-6150' },
        'CS-6200': { sortKeyField: 2, courseId: 'CS-6200' },
      };
    });

    it('returns empty array for empty payload', () => {
      const inputPayload = {};
      const mappedArray = mapPayloadToArray(inputPayload);
      expect(mappedArray).toMatchObject([]);
    });

    it('returns empty array for undefined payload', () => {
      const mappedArray = mapPayloadToArray(undefined);
      expect(mappedArray).toEqual([]);
    });

    it('maps payload to array, ascending by sortKey', () => {
      const mappedArray = mapPayloadToArray(inputPayload, 'sortKeyField');
      const expectedOutput = [
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 2, courseId: 'CS-6200' },
        { sortKeyField: 3, courseId: 'CS-6035' },
      ];
      expect(mappedArray).toMatchObject(expectedOutput);
    });

    it('maps payload to array, ascending by string sortKey', () => {
      const mappedArray = mapPayloadToArray(inputPayload, 'courseId');
      const expectedOutput = [
        { sortKeyField: 3, courseId: 'CS-6035' },
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 2, courseId: 'CS-6200' },
      ];
      expect(mappedArray).toMatchObject(expectedOutput);
    });

    it('keeps original order when sorted values are equal strings', () => {
      inputPayload = {
        a: { sortKeyField: 'same', courseId: 'CS-6035' },
        b: { sortKeyField: 'same', courseId: 'CS-6150' },
      } as any;

      expect(mapPayloadToArray(inputPayload, 'sortKeyField')).toMatchObject([
        { courseId: 'CS-6035' },
        { courseId: 'CS-6150' },
      ]);
    });

    it('sorts string values in descending order', () => {
      const mappedArray = mapPayloadToArray(inputPayload, 'courseId', DESC);

      expect(mappedArray).toMatchObject([
        { courseId: 'CS-6200' },
        { courseId: 'CS-6150' },
        { courseId: 'CS-6035' },
      ]);
    });

    it('sorts reversed string values in ascending order', () => {
      inputPayload = {
        a: { courseId: 'CS-6200' },
        b: { courseId: 'CS-6035' },
      } as any;

      expect(mapPayloadToArray(inputPayload, 'courseId')).toMatchObject([
        { courseId: 'CS-6035' },
        { courseId: 'CS-6200' },
      ]);
    });

    it('maps payload to array, descending by sortKey', () => {
      const mappedArray = mapPayloadToArray(inputPayload, 'courseID', DESC);
      const expectedOutput = [
        { sortKeyField: 2, courseId: 'CS-6200' },
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 3, courseId: 'CS-6035' },
      ];
      expect(mappedArray).toMatchObject(expectedOutput);
    });

    it('falls through in original order if no sortKey specified', () => {
      const mappedArray = mapPayloadToArray(inputPayload);
      const expectedOutput = [
        { sortKeyField: 3, courseId: 'CS-6035' },
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 2, courseId: 'CS-6200' },
      ];
      expect(mappedArray).toMatchObject(expectedOutput);
    });
  });
});
