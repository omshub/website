import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from '@jest/globals';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import CourseRegistration from './CourseRegistration';
import * as registration from './registration';

jest.mock('./registration', () => ({
  ...jest.requireActual('./registration'),
  discoverRegistration: jest.fn(),
}));
const section = {
  crn: '25469',
  sectionNumber: 'O01',
  enrolled: 10,
  capacity: 1300,
  seatsAvailable: 1290,
};
const snapshot = {
  term: '202702',
  courses: { 'CS-6200': { courseId: 'CS-6200', sections: [section] } },
};
const writeText = jest.fn();
const show = (courseId = 'CS-6200') =>
  render(
    <MantineProvider>
      <CourseRegistration courseId={courseId} />
    </MantineProvider>,
  );
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});
beforeEach(() => {
  jest
    .mocked(registration.discoverRegistration)
    .mockReset()
    .mockResolvedValue({ snapshot });
  writeText.mockReset().mockResolvedValue(undefined);
});
afterEach(cleanup);

describe('CourseRegistration', () => {
  it('shows only the semester and copyable CRN, not an enrollment dashboard', async () => {
    show();
    await screen.findByRole('button', { name: /Copy CRN 25469/ });
    expect(screen.getByText('Spring 2027')).toBeDefined();
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(
      screen.queryByText(/enrolled|seats available|waitlisted|Data updated/i),
    ).toBeNull();
    expect(screen.queryByText('O01')).toBeNull();
  });
  it('copies the exact CRN and announces success', async () => {
    show();
    fireEvent.click(
      await screen.findByRole('button', { name: /Copy CRN 25469/ }),
    );
    await screen.findByText('CRN 25469 copied.');
    expect(writeText).toHaveBeenCalledWith('25469');
  });
  it('provides a manual-copy fallback when copying fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'));
    show();
    fireEvent.click(
      await screen.findByRole('button', { name: /Copy CRN 25469/ }),
    );
    await screen.findByText('Could not copy. Select CRN 25469 manually.');
    expect(screen.queryByText('CRN 25469 copied.')).toBeNull();
  });
  it('labels every section when more than one CRN exists', async () => {
    jest.mocked(registration.discoverRegistration).mockResolvedValue({
      snapshot: {
        ...snapshot,
        courses: {
          'CS-6200': {
            courseId: 'CS-6200',
            sections: [
              section,
              { ...section, crn: '25470', sectionNumber: 'O02' },
            ],
          },
        },
      },
    });
    show();
    await screen.findByRole('button', { name: /Copy CRN 25470/ });
    expect(
      screen.getByRole('button', { name: /Copy CRN 25469/ }),
    ).toBeDefined();
    expect(screen.getByText('O01')).toBeDefined();
    expect(screen.getByText('O02')).toBeDefined();
  });
  it('keeps the term explicit when the course is not offered and never shows an old CRN', async () => {
    show('CS-8803-O08');
    await screen.findByText('Not offered this term');
    expect(screen.getByText('Spring 2027')).toBeDefined();
    expect(screen.queryByRole('button', { name: /Copy CRN/ })).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Schedule' }).getAttribute('href'),
    ).toBe('/schedule');
  });
  it('distinguishes unavailable data from not offered and supports retry', async () => {
    jest
      .mocked(registration.discoverRegistration)
      .mockRejectedValueOnce(new Error('offline'));
    show();
    await screen.findByRole('alert');
    expect(screen.queryByText('Not offered this term')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('button', { name: /Copy CRN 25469/ });
  });
  it('ignores late results for the previous course and aborts its request', async () => {
    let resolveOld;
    jest
      .mocked(registration.discoverRegistration)
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
      )
      .mockResolvedValueOnce({ snapshot });
    const view = show('CS-8803-O08');
    view.rerender(
      <MantineProvider>
        <CourseRegistration courseId='CS-6200' />
      </MantineProvider>,
    );
    await screen.findByRole('button', { name: /Copy CRN 25469/ });
    await act(async () =>
      resolveOld({ snapshot: { ...snapshot, courses: {} } }),
    );
    expect(screen.queryByText('Not offered this term')).toBeNull();
    expect(
      screen.getByRole('button', { name: /Copy CRN 25469/ }),
    ).toBeDefined();
    expect(registration.discoverRegistration.mock.calls[0][0].aborted).toBe(
      true,
    );
  });
});
