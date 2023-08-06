import { DESC } from '@globals/constants';
import { TCourseId } from '@globals/types';
import {
  // mapRatingToColor,
  // mapRatingToColorInverted,
  mapPayloadToArray,
} from '@src/utilities';

// types
type TInputPayload = {
  // eslint-disable-next-line no-unused-vars
  [T in TCourseId]: any;
};

describe('frontend utilities tests', () => {
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

    it('maps payload to array, ascending by sortKey', () => {
      const expectedOutput = [
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 2, courseId: 'CS-6200' },
        { sortKeyField: 3, courseId: 'CS-6035' },
      ];
      const mappedArray = mapPayloadToArray(inputPayload, 'sortKeyField');
      expect(mappedArray).toMatchObject(expectedOutput);
    });

    it('maps payload to array, descending by sortKey', () => {
      const expectedOutput = [
        { sortKeyField: 2, courseId: 'CS-6200' },
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 3, courseId: 'CS-6035' },
      ];
      const mappedArray = mapPayloadToArray(inputPayload, 'courseID', DESC);
      expect(mappedArray).toMatchObject(expectedOutput);
    });

    it('falls through in original order if no sortKey specified', () => {
      const expectedOutput = [
        { sortKeyField: 3, courseId: 'CS-6035' },
        { sortKeyField: 1, courseId: 'CS-6150' },
        { sortKeyField: 2, courseId: 'CS-6200' },
      ];
      const mappedArray = mapPayloadToArray(inputPayload);
      expect(mappedArray).toMatchObject(expectedOutput);
    });
  });
});
