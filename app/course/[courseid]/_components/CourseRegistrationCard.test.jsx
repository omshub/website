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
  waitFor,
} from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import CourseRegistrationCard from './CourseRegistrationCard';
import * as registration from './registration';
jest.mock('./registration', () => ({
  ...jest.requireActual('./registration'),
  discoverRegistration: jest.fn(),
  fetchRegistrationSnapshot: jest.fn(),
}));
const section = {
  crn: '26110',
  sectionNumber: 'O01',
  enrolled: 291,
  capacity: 300,
  seatsAvailable: 9,
  waitCount: 0,
};
const snapshot = {
  term: '202702',
  lastUpdated: '2026-11-03T20:14:55Z',
  courses: {
    'CS-6515': {
      courseId: 'CS-6515',
      sections: [
        section,
        {
          ...section,
          crn: '26111',
          sectionNumber: 'O02',
          enrolled: 300,
          seatsAvailable: 0,
        },
      ],
    },
  },
};
const terms = [
  { value: '202702', label: 'Spring 2027' },
  { value: '202608', label: 'Fall 2026' },
];
const writeText = jest.fn();
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
  window.HTMLElement.prototype.scrollIntoView = () => {};
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
});
beforeEach(() => {
  jest
    .spyOn(registration, 'discoverRegistration')
    .mockResolvedValue({ snapshot, terms });
  writeText.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  jest.restoreAllMocks();
});
const show = (courseId = 'CS-6515') =>
  render(
    <MantineProvider>
      <CourseRegistrationCard courseId={courseId} />
    </MantineProvider>,
  );
async function switchTerm(label) {
  fireEvent.click(screen.getByRole('textbox', { name: 'Registration term' }));
  const option = await screen.findByRole('option', { name: label });
  await act(async () => {
    fireEvent.click(option);
  });
}
describe('CourseRegistrationCard', () => {
  it('renders every section and latest published term independently from review filters', async () => {
    show();
    await screen.findByText('CRN 26110');
    expect(screen.getByText('CRN 26111')).toBeDefined();
    expect(screen.getByText('Section O01')).toBeDefined();
    expect(screen.getByText('Section O02')).toBeDefined();
    expect(screen.getByText('Seats available')).toBeDefined();
    expect(screen.getByText('Full')).toBeDefined();
    expect(
      screen.getByText('291 / 300 enrolled · 9 seats available · 0 waitlisted'),
    ).toBeDefined();
    expect(
      screen.getByRole('textbox', { name: 'Registration term' }).value,
    ).toBe('Spring 2027');
    expect(
      screen
        .getByRole('link', { name: 'View full schedule' })
        .getAttribute('href'),
    ).toBe('/schedule');
    expect(screen.getByText(/Data updated/)).toBeDefined();
  });
  it('reports successful copying and clipboard failure separately for each CRN', async () => {
    show();
    fireEvent.click(
      await screen.findByRole('button', { name: /Copy CRN 26110/ }),
    );
    await screen.findByText('CRN 26110 copied.');
    expect(writeText).toHaveBeenCalledWith('26110');
    writeText.mockRejectedValueOnce(new Error('denied'));
    fireEvent.click(screen.getByRole('button', { name: /Copy CRN 26111/ }));
    await screen.findByText(
      'Could not copy. Select and copy CRN 26111 manually.',
    );
    expect(screen.queryByText('CRN 26111 copied.')).toBeNull();
  });
  it('shows not offered only after a successful exact-course lookup, without old CRNs', async () => {
    jest
      .spyOn(registration, 'fetchRegistrationSnapshot')
      .mockResolvedValue({ ...snapshot, term: '202608', courses: {} });
    show();
    await screen.findByText('CRN 26110');
    await switchTerm('Fall 2026');
    await screen.findByText(
      'CS-6515 is not offered in Fall 2026 in the published schedule.',
    );
    expect(screen.queryByText('CRN 26110')).toBeNull();
  });
  it('clears old CRNs on term change, exposes failure rather than not offered, and retries', async () => {
    const fetchTerm = jest
      .spyOn(registration, 'fetchRegistrationSnapshot')
      .mockRejectedValueOnce(new Error('offline'));
    show();
    await screen.findByText('CRN 26110');
    await switchTerm('Fall 2026');
    await screen.findByRole('alert');
    expect(screen.queryByText('CRN 26110')).toBeNull();
    expect(screen.queryByText(/is not offered/)).toBeNull();
    fetchTerm.mockResolvedValueOnce({ ...snapshot, term: '202608' });
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('CRN 26110');
  });
  it('ignores a slow response from a previously selected term even if fetch ignores abort', async () => {
    let resolveOld;
    const old = new Promise((resolve) => {
      resolveOld = resolve;
    });
    const fetchTerm = jest
      .spyOn(registration, 'fetchRegistrationSnapshot')
      .mockReturnValueOnce(old)
      .mockResolvedValueOnce(snapshot);
    show();
    await screen.findByText('CRN 26110');
    await switchTerm('Fall 2026');
    expect(screen.queryByText('CRN 26110')).toBeNull();
    await switchTerm('Spring 2027');
    await screen.findByText('CRN 26110');
    await act(async () =>
      resolveOld({ ...snapshot, term: '202608', courses: {} }),
    );
    expect(screen.queryByText(/is not offered/)).toBeNull();
    expect(screen.getByText('CRN 26110')).toBeDefined();
    expect(fetchTerm.mock.calls[0][1].aborted).toBe(true);
  });
  it('shows discovery errors and retries without claiming the course is not offered', async () => {
    jest
      .mocked(registration.discoverRegistration)
      .mockRejectedValueOnce(new Error('offline'));
    show();
    await screen.findByRole('alert');
    expect(screen.queryByText(/is not offered/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('CRN 26110');
  });
  it('does not carry registration details to a different course', async () => {
    const view = show();
    await screen.findByText('CRN 26110');
    view.rerender(
      <MantineProvider>
        <CourseRegistrationCard courseId='CS-8803-O08' />
      </MantineProvider>,
    );
    await waitFor(() => expect(screen.queryByText('CRN 26110')).toBeNull());
    await screen.findByText(
      'CS-8803-O08 is not offered in Spring 2027 in the published schedule.',
    );
  });
});
