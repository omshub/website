import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import {
  fireEvent,
  render,
  screen,
  act,
  cleanup,
} from '@testing-library/react';
import { useMantineTheme, MantineTheme } from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import MantineThemeProvider from '../providers/MantineProvider';
import SpotlightSearch from '../SpotlightSearch';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const courses = {
  'CS-7643': {
    courseId: 'CS-7643',
    name: 'Deep Learning',
    aliases: ['DL'],
    numReviews: 76,
    avgDifficulty: 3.9,
    avgWorkload: 20,
    avgOverall: 4,
  },
  'CS-6601': {
    courseId: 'CS-6601',
    name: 'Artificial Intelligence',
    aliases: ['AI'],
    numReviews: 10,
  },
};
let theme: MantineTheme;
function ThemeProbe() {
  theme = useMantineTheme();
  return null;
}

// Assert the actual module's rules against real rendered elements. JSDOM does
// not resolve CSS variables or emulate pointer hover, so map only that pseudo
// class to an attribute. The browser check covers composed colors/opacity.
function declarationsFor(element: Element) {
  const cssPath = path.join(
    process.cwd(),
    'src/components/SpotlightSearch.module.css',
  );
  const css = fs.readFileSync(cssPath, 'utf8');
  const declarations: Record<string, string> = {};
  postcss.parse(css).walkRules((rule) => {
    if (
      element.matches(rule.selector.replaceAll(':hover', '[data-test-hover]'))
    ) {
      rule.walkDecls((declaration) => {
        declarations[declaration.prop] = declaration.value;
      });
    }
  });
  return declarations;
}

function contrast(foreground: string, background: string) {
  const luminance = (color: string) => {
    const channels = color
      .slice(1)
      .match(/../g)!
      .map((v) => parseInt(v, 16) / 255)
      .map((s) => (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

beforeAll(() => {
  window.matchMedia = jest
    .fn()
    .mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  const input = screen.queryByPlaceholderText('Search courses...');
  if (input) fireEvent.change(input, { target: { value: '' } });
  act(() => spotlight.close());
  cleanup();
  push.mockClear();
});

it.each(['selected', 'hover', 'focus'] as const)(
  'keeps result metadata readable on %s gold without changing normal badges',
  async (state) => {
    render(
      <MantineThemeProvider>
        <ThemeProbe />
        <SpotlightSearch courses={courses as any} />
      </MantineThemeProvider>,
    );
    act(() => spotlight.open());
    const input = await screen.findByPlaceholderText('Search courses...');
    fireEvent.change(input, { target: { value: 'dl' } });
    const title = await screen.findByText('Deep Learning');
    const action = title.closest('button')!;
    const courseId = screen.getByText('CS-7643 (DL)');
    const badges = [...action.querySelectorAll('.mantine-Badge-root')];
    expect(badges).toHaveLength(4);
    action.removeAttribute('data-selected');
    input.focus();

    if (state === 'selected') action.setAttribute('data-selected', 'true');
    if (state === 'hover') action.setAttribute('data-test-hover', '');
    if (state === 'focus') action.focus();
    expect(declarationsFor(action)).toMatchObject({
      color: 'var(--mantine-color-navy-5)',
      'background-color': 'var(--mantine-primary-color-filled)',
      '--action-description-opacity': '1',
    });
    for (const element of [courseId, ...badges]) {
      expect(declarationsFor(element).color).toBe(
        'var(--mantine-color-navy-5)',
      );
    }
    for (const badge of badges)
      expect(declarationsFor(badge)['background-color']).toBe('transparent');
    action.removeAttribute('data-selected');
    action.removeAttribute('data-test-hover');
    input.focus();
    expect(declarationsFor(courseId).color).toBe('var(--mantine-color-dimmed)');
    for (const badge of badges) expect(declarationsFor(badge)).toEqual({});

    for (const scheme of ['light', 'dark'] as const) {
      const shade =
        typeof theme.primaryShade === 'number'
          ? theme.primaryShade
          : theme.primaryShade[scheme];
      // Transparent badges + full-opacity description mean text and currentColor
      // icons are composed directly onto gold in both actual application palettes.
      expect(
        contrast(theme.colors.navy[5], theme.colors.techGold[shade]),
      ).toBeGreaterThanOrEqual(4.5);
    }
  },
);

it('preserves keyboard selection and course navigation', async () => {
  render(
    <MantineThemeProvider>
      <SpotlightSearch courses={courses as any} />
    </MantineThemeProvider>,
  );
  act(() => spotlight.open());
  const input = await screen.findByPlaceholderText('Search courses...');
  fireEvent.change(input, { target: { value: 'cs-' } });
  await act(async () => {});
  const first = (await screen.findByText('Deep Learning')).closest('button')!;
  const second = screen.getByText('Artificial Intelligence').closest('button')!;
  expect(first).toHaveAttribute('data-selected');
  fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
  expect(second).toHaveAttribute('data-selected');
  fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
  expect(first).toHaveAttribute('data-selected');
  fireEvent.change(input, { target: { value: 'dl' } });
  await act(async () => {});
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  expect(push).toHaveBeenCalledWith('/course/CS-7643');
});
