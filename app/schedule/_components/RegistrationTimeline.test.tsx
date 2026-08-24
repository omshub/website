import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { RegistrationTimeline } from './RegistrationTimeline';

const calendar = {
  schemaVersion: 1,
  terms: [{
    term: '202608',
    availability: '2026-05-01',
    phase2: {
      tickets: '2026-08-13',
      ticketsAt: '2026-08-13T18:00:00-04:00',
      start: '2026-08-17',
      end: '2026-08-28',
      endAt: '2026-08-28T23:59:00-04:00',
    },
  }],
};

describe('RegistrationTimeline', () => {
  it('renders the public milestone title, caveat, and mixed countdowns', () => {
    render(<MantineProvider><RegistrationTimeline calendar={calendar} now={new Date('2026-08-13T20:30:00Z')} /></MantineProvider>);

    expect(screen.getByRole('heading', { name: 'Upcoming registration phases' })).toBeInTheDocument();
    expect(screen.getByText('Dates are public program milestones; individual time tickets vary.')).toBeInTheDocument();
    expect(screen.getByText('Official GT Registrar dates')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Fall 2026 registration phases' })).toBeInTheDocument();
    expect(screen.getByText('Schedule available · May 1')).toBeInTheDocument();
    expect(screen.getByText('Next: Phase II · Aug 17–28')).toBeInTheDocument();
    expect(screen.getByText('Tickets posted · in 1h 30m')).toBeInTheDocument();
    expect(document.querySelector('.registration-phase-item--focus')).toBeInTheDocument();
  });

  it('renders nothing for malformed calendars', () => {
    const { container } = render(<RegistrationTimeline calendar={{ schemaVersion: 2, terms: [] }} now={new Date('2026-08-13T20:30:00Z')} />);
    expect(container).toBeEmptyDOMElement();
  });
});
