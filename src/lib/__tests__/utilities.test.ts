import {
  mapDynamicCoursesDataToCourses,
  extractEmailDomain,
  isGTEmail,
  isOutlookEmail,
} from '@/lib/utilities';
import { DOMAIN_GATECH } from '@/lib/constants';

describe('global utilities tests', () => {
  describe('mappers', () => {
    describe('mapDynamicCoursesDataToCourses()', () => {
      it('merges dynamic course stats with static data to create full course model', () => {
        const courses = mapDynamicCoursesDataToCourses(
          {
            'CS-6200': {
              numReviews: 12,
              avgWorkload: 14,
              avgDifficulty: 3.5,
              avgOverall: 4.2,
              avgStaffSupport: 4,
              reviewsCountsByYearSem: { 2025: { fa: 2 } },
            },
          } as any,
          {
            'CS-6200': { name: 'Graduate Introduction to Operating Systems' },
            'CS-9999': { name: 'Deprecated Course', isDeprecated: true },
            'CS-6250': { name: 'Computer Networks' },
          } as any
        );

        expect(courses).toEqual({
          'CS-6200': {
            courseId: 'CS-6200',
            name: 'Graduate Introduction to Operating Systems',
            numReviews: 12,
            avgWorkload: 14,
            avgDifficulty: 3.5,
            avgOverall: 4.2,
            avgStaffSupport: 4,
            reviewsCountsByYearSem: { 2025: { fa: 2 } },
          },
          'CS-6250': {
            courseId: 'CS-6250',
            name: 'Computer Networks',
            numReviews: 0,
            avgWorkload: null,
            avgDifficulty: null,
            avgOverall: null,
            avgStaffSupport: null,
            reviewsCountsByYearSem: {},
          },
        });
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

      it('rejects non-@outlook.edu email domain', () => {
        const userEmail = 'gpb@gatech.edu';
        const hasOutlookEmail = isOutlookEmail(userEmail);
        expect(hasOutlookEmail).toBeFalsy();
      });
    });
  });
});
