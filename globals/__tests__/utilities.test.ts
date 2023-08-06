import {
  // mapDynamicCoursesDataToCourses,
  extractEmailDomain,
  isGTEmail,
  isOutlookEmail,
} from '@globals/utilities';
import { DOMAIN_GATECH } from '@globals/constants';

describe('global utilities tests', () => {
  describe('mappers', () => {
    describe('mapDynamicCoursesDataToCourses()', () => {
      it('maps dynamic course data from Firebase Firestore DB response to full course data model', () => {
        // TODO
      });
    });
  });

  describe('utility functions', () => {
    describe('extractEmailDomain()', () => {
      it('extracts email domain', () => {
        const userEmail = 'gpb@gatech.edu';
        const domain = extractEmailDomain(userEmail, DOMAIN_GATECH);
        expect(domain).toEqual(DOMAIN_GATECH);
      });

      it('does not extract invalid domain', () => {
        const userEmail = 'gpb@gatech.eduu';
        const domain = extractEmailDomain(userEmail, DOMAIN_GATECH);
        expect(domain).not.toEqual(DOMAIN_GATECH);
      });
    });

    describe('isGTEmail()', () => {
      it('detects email domain @gatech.edu', () => {
        const userEmail = 'gpb@gatech.edu';
        const hasGTDomain = isGTEmail(userEmail);
        expect(hasGTDomain).toBeTruthy();
      });

      it('rejects non-@gatech.edu email domain', () => {
        const userEmail = 'gpb@outlook.com';
        const hasGTDomain = isGTEmail(userEmail);
        expect(hasGTDomain).toBeFalsy();
      });
    });

    describe('isOutlookEmail()', () => {
      it('detects email domain @outlook.com', () => {
        const userEmail = 'gpb@outlook.com';
        const hasOutlookEmail = isOutlookEmail(userEmail);
        expect(hasOutlookEmail).toBeTruthy();
      });

      it('rejects non-@gatech.edu email domain', () => {
        const userEmail = 'gpb@gatech.edu';
        const hasOutlookEmail = isOutlookEmail(userEmail);
        expect(hasOutlookEmail).toBeFalsy();
      });
    });
  });
});
