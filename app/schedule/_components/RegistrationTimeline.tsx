'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Paper, Stack, Text, Title } from '@mantine/core';
import {
  formatRegistrationCountdown,
  getTermLabel,
  getUpcomingRegistrationTimeline,
  type RegistrationMilestone,
} from '../_lib/semesters';

export interface RegistrationTimelineProps {
  calendar: unknown;
  now?: Date;
}

function formatMilestoneDate(milestone: RegistrationMilestone): string {
  const date = new Date(`${milestone.date}T12:00:00Z`);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

function milestoneColor(state: RegistrationMilestone['state']): string {
  if (state === 'current') return 'yellow';
  if (state === 'completed') return 'gray';
  return 'blue';
}

export function RegistrationTimeline({ calendar, now }: RegistrationTimelineProps) {
  const [liveNow, setLiveNow] = useState(() => now ?? new Date());

  useEffect(() => {
    if (now) {
      setLiveNow(now);
      return undefined;
    }
    const interval = window.setInterval(() => setLiveNow(new Date()), 60_000);
    return () => window.clearInterval(interval);
  }, [now]);

  const milestones = useMemo(() => getUpcomingRegistrationTimeline(calendar, liveNow), [calendar, liveNow]);
  const terms = useMemo(() => {
    const grouped = new Map<string, RegistrationMilestone[]>();
    milestones.forEach((milestone) => grouped.set(milestone.term, [...(grouped.get(milestone.term) ?? []), milestone]));
    return Array.from(grouped.entries());
  }, [milestones]);

  if (terms.length === 0) return null;

  return (
    <Paper p={{ base: 'md', sm: 'lg' }} mb="xl" radius="lg" withBorder aria-labelledby="registration-timeline-title">
      <Stack gap="xs" mb="md">
        <Title id="registration-timeline-title" order={2} size="h3">Upcoming registration phases</Title>
        <Text size="sm" c="dimmed">Dates are public program milestones; individual time tickets vary.</Text>
      </Stack>
      <Stack gap="md">
        {terms.map(([term, termMilestones]) => (
          <section key={term} aria-labelledby={`registration-term-${term}`}>
            <Text id={`registration-term-${term}`} fw={700} mb="xs">{getTermLabel(term)}</Text>
            <ol className="registration-timeline-rail" aria-label={`${getTermLabel(term)} registration milestones`}>
              {termMilestones.map((milestone, index) => {
                const countdown = formatRegistrationCountdown(milestone, liveNow);
                const isFocus = milestone.state === 'current'
                  || index === termMilestones.findIndex((item) => item.state === 'upcoming');
                return (
                  <li className={`registration-timeline-step registration-timeline-step--${milestone.state}${isFocus ? ' registration-timeline-step--focus' : ''}`} key={`${milestone.kind}-${milestone.date}`}>
                    <span className={`registration-timeline-marker registration-timeline-marker--${milestone.state}${isFocus ? ' registration-timeline-marker--focus' : ''}`} aria-hidden="true">
                      {milestone.state === 'completed' ? '✓' : index + 1}
                    </span>
                    <Paper p="sm" radius="md" withBorder bg={milestone.state === 'current' ? 'yellow.0' : undefined}>
                      <Stack gap={4} align="flex-start">
                        <div>
                          <Text size="sm" fw={600}>{milestone.label}</Text>
                          <Text size="xs" c="dimmed">{formatMilestoneDate(milestone)}</Text>
                        </div>
                        <Badge
                          color={milestoneColor(milestone.state)}
                          variant={milestone.state === 'current' ? 'filled' : milestone.state === 'completed' ? 'outline' : 'light'}
                          style={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                        >
                          {milestone.state === 'completed' ? '✓ Completed' : countdown}
                        </Badge>
                      </Stack>
                    </Paper>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </Stack>
      <style>{`
        .registration-timeline-rail { display: flex; gap: 0.75rem; list-style: none; margin: 0; padding: 0; }
        .registration-timeline-step { flex: 1 1 0; min-width: 0; padding-top: 1.65rem; position: relative; }
        .registration-timeline-step:not(:last-child)::after { background: var(--mantine-color-gray-3); content: ''; height: 2px; left: calc(50% + 0.8rem); position: absolute; right: calc(-50% + 0.8rem); top: 0.62rem; }
        .registration-timeline-step--focus:not(:last-child)::after { background: var(--mantine-color-yellow-6); height: 3px; }
        .registration-timeline-step--focus > .mantine-Paper-root { border-color: var(--mantine-color-yellow-6); box-shadow: inset 3px 0 0 var(--mantine-color-yellow-6); }
        .registration-timeline-marker { align-items: center; background: var(--mantine-color-blue-6); border: 3px solid var(--mantine-color-body); border-radius: 999px; color: white; display: flex; font-size: 0.7rem; font-weight: 800; height: 1.25rem; justify-content: center; left: 50%; position: absolute; top: 0; transform: translateX(-50%); width: 1.25rem; z-index: 1; }
        .registration-timeline-marker--current, .registration-timeline-marker--focus { background: var(--mantine-color-yellow-6); box-shadow: 0 0 0 3px var(--mantine-color-yellow-1); color: var(--mantine-color-dark-9); }
        .registration-timeline-marker--completed { background: var(--mantine-color-gray-5); }
        @media (max-width: 48em) {
          .registration-timeline-rail { display: block; padding-left: 1.75rem; }
          .registration-timeline-step { padding: 0 0 0.9rem; }
          .registration-timeline-step:not(:last-child)::after { bottom: -0.1rem; height: auto; left: -1.18rem; right: auto; top: 1.25rem; width: 2px; }
          .registration-timeline-step--focus:not(:last-child)::after { height: auto; width: 3px; }
          .registration-timeline-marker { left: -1.18rem; top: 0.15rem; transform: translateX(-50%); }
        }
      `}</style>
    </Paper>
  );
}
