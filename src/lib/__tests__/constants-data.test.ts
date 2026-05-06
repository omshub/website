/**
 * @jest-environment node
 */

import {
  ASC,
  DESC,
  DOMAIN_GATECH,
  DOMAIN_OUTLOOK,
  EMOJI_FALL,
  EMOJI_NO_REVIEWS,
  EMOJI_SPRING,
  EMOJI_SUMMER,
  NOT_FOUND_ARRAY_INDEX,
  REVIEWS_RECENT_LEN,
  REVIEWS_RECENT_TOTAL,
  REVIEW_ID,
  SEMESTER_ID,
  courseFields,
  reviewFields,
} from '../constants';
import { SOCIAL_LINKS } from '../socialLinks';
import { CSS_STAT_COLORS, GT_COLORS } from '../theme';

describe('static constants', () => {
  it('exports social links used across the app', () => {
    expect(SOCIAL_LINKS).toMatchObject({
      github: 'https://github.com/omshub',
      discord: expect.stringContaining('discord.gg'),
      reddit: expect.stringContaining('OMSCS'),
      slack: expect.stringContaining('slack.com'),
      email: expect.stringContaining('mailto:'),
    });
  });

  it('exports Georgia Tech color tokens and stat CSS variables', () => {
    expect(GT_COLORS).toMatchObject({
      navy: '#003057',
      techGold: '#B3A369',
      buzzGold: '#EAAA00',
    });
    expect(CSS_STAT_COLORS).toMatchObject({
      gold: 'var(--stat-color-yellow)',
      teal: 'var(--stat-color-teal)',
      lime: 'var(--stat-color-green)',
      orange: 'var(--stat-color-red)',
    });
  });

  it('exports shared field and domain constants', () => {
    expect({ ASC, DESC, DOMAIN_GATECH, DOMAIN_OUTLOOK }).toEqual({
      ASC: 'ASC',
      DESC: 'DESC',
      DOMAIN_GATECH: '@gatech.edu',
      DOMAIN_OUTLOOK: '@outlook.com',
    });
    expect({
      SEMESTER_ID,
      REVIEW_ID,
      REVIEWS_RECENT_LEN,
      REVIEWS_RECENT_TOTAL,
      NOT_FOUND_ARRAY_INDEX,
    }).toEqual({
      SEMESTER_ID: 'semesterId',
      REVIEW_ID: 'reviewId',
      REVIEWS_RECENT_LEN: 50,
      REVIEWS_RECENT_TOTAL: 70,
      NOT_FOUND_ARRAY_INDEX: -1,
    });
    expect({ EMOJI_NO_REVIEWS, EMOJI_SPRING, EMOJI_SUMMER, EMOJI_FALL }).toEqual({
      EMOJI_NO_REVIEWS: '\uD83E\uDD72',
      EMOJI_SPRING: '\uD83C\uDF31',
      EMOJI_SUMMER: '\uD83C\uDF1E',
      EMOJI_FALL: '\uD83C\uDF42',
    });
    expect(courseFields).toMatchObject({
      COURSE_ID: 'courseId',
      NAME: 'name',
      AVG_OVERALL: 'avgOverall',
    });
    expect(reviewFields).toMatchObject({
      REVIEW_ID: 'reviewId',
      COURSE_ID: 'courseId',
      GRADE_ID: 'gradeId',
    });
  });
});
