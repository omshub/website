import { describe, expect, it } from '@jest/globals';
import { getSearchScore } from './ScheduleContent';

const section = { crn: '25469', courseId: 'CS-6200', name: 'Introduction to Operating Systems', aliases: ['GIOS', 'IOS'], instructor: 'Ada Gavrilovska' };
const second = { ...section, crn: '25470' };
const matches = (query) => [section, second].filter((item) => getSearchScore(item, query) > 0);

describe('schedule CRN search', () => {
  it('finds the exact section by pasted CRN, with surrounding whitespace', () => {
    expect(matches(' 25469 ')).toEqual([section]);
  });
  it('supports partial CRNs without losing other matching sections', () => {
    expect(matches('254')).toEqual([section, second]);
    expect(matches('469')).toEqual([section]);
  });
  it('ranks an exact CRN above partial CRN and unrelated numeric alias matches', () => {
    expect(getSearchScore(section, '25469')).toBeGreaterThan(getSearchScore({ ...section, crn: '92546' }, '2546'));
    expect(getSearchScore(section, '25469')).toBeGreaterThan(getSearchScore({ ...second, aliases: ['25469'] }, '25469'));
  });
  it.each(['GIOS', 'gios', 'cs-6200', 'Operating Systems', 'Gavrilovska'])('preserves existing search for %s', (query) => {
    expect(matches(query)).toEqual([section, second]);
  });
  it('shows every section for an empty query and none for an unknown CRN', () => {
    expect(matches('  ')).toEqual([section, second]);
    expect(matches('99999')).toEqual([]);
  });
});
