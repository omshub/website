'use client';

import { useEffect, useMemo, useState } from 'react';
import { Paper, Text, Title } from '@mantine/core';
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

type RawPhase = { tickets?: string; start?: string; end?: string };
type RawTerm = { term?: string; availability?: string; phase1?: RawPhase; phase2?: RawPhase };

type PhaseItem = {
  label: string;
  detail?: string;
  state: RegistrationMilestone['state'];
  focus?: boolean;
};

function formatDate(value?: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
  return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  });
}

function formatRange(start?: string, end?: string): string {
  const startText = formatDate(start);
  const endText = formatDate(end);
  if (startText && endText && start?.slice(0, 7) === end?.slice(0, 7)) return `${startText}–${Number(end!.slice(8, 10))}`;
  return startText && endText ? `${startText}–${endText}` : startText || endText;
}

function rawTermsFrom(calendar: unknown): RawTerm[] {
  if (!calendar || typeof calendar !== 'object' || !Array.isArray((calendar as { terms?: unknown }).terms)) return [];
  return (calendar as { terms: RawTerm[] }).terms;
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
  const groupedMilestones = useMemo(() => {
    const grouped = new Map<string, RegistrationMilestone[]>();
    milestones.forEach((milestone) => grouped.set(milestone.term, [...(grouped.get(milestone.term) ?? []), milestone]));
    return Array.from(grouped.entries());
  }, [milestones]);
  const rawTerms = useMemo(() => rawTermsFrom(calendar), [calendar]);

  if (groupedMilestones.length === 0) return null;

  return (
    <Paper p={{ base: 'md', sm: 'lg' }} mb="xl" radius="md" withBorder aria-labelledby="registration-timeline-title">
      <header className="registration-phases-header">
        <Title id="registration-timeline-title" order={2} size="h3">Upcoming registration phases</Title>
        <Text size="sm" c="dimmed">Official GT Registrar dates</Text>
      </header>

      <div className="registration-phases-rows">
        {groupedMilestones.map(([term, termMilestones]) => {
          const rawTerm = rawTerms.find((candidate) => candidate.term === term);
          const availability = termMilestones.find((milestone) => milestone.kind === 'availability');
          const phase2Tickets = termMilestones.find((milestone) => milestone.kind === 'tickets');
          const phase2Start = termMilestones.find((milestone) => milestone.kind === 'registration-start');
          const phase2End = termMilestones.find((milestone) => milestone.kind === 'registration-end');
          const phase2State = phase2Start?.state ?? phase2Tickets?.state ?? 'upcoming';
          const phase2Countdown = phase2State === 'current' && phase2End
            ? formatRegistrationCountdown(phase2End, liveNow)
            : phase2Tickets ? formatRegistrationCountdown(phase2Tickets, liveNow) : undefined;
          const phaseItems: PhaseItem[] = [
            availability ? {
              label: `Schedule available · ${formatDate(availability.date)}`,
              state: availability.state,
            } : null,
            rawTerm?.phase1?.start ? {
              label: `Phase I · ${formatRange(rawTerm.phase1.start, rawTerm.phase1.end)}`,
              state: rawTerm.phase1.end && rawTerm.phase1.end < liveNow.toISOString().slice(0, 10) ? 'completed' : 'upcoming',
            } : null,
            rawTerm?.phase1?.tickets && rawTerm.phase1.start && rawTerm.phase1.start >= liveNow.toISOString().slice(0, 10) ? {
              label: `Phase I tickets · ${formatDate(rawTerm.phase1.tickets)}`,
              state: 'upcoming',
            } : null,
            phase2Start ? {
              label: `${phase2State === 'current' ? 'Phase II' : 'Next: Phase II'} · ${formatRange(phase2Start.date, phase2End?.date)}`,
              detail: phase2Countdown ? `${phase2State === 'current' ? 'Registration closes' : 'Tickets posted'} · ${phase2Countdown}` : undefined,
              state: phase2State,
              focus: phase2State !== 'completed',
            } : null,
          ].filter(Boolean) as PhaseItem[];

          return (
            <section className="registration-phase-row" key={term} aria-labelledby={`registration-term-${term}`}>
              <Text className="registration-phase-term" id={`registration-term-${term}`} fw={700}>{getTermLabel(term)}</Text>
              <ol className="registration-phase-list" aria-label={`${getTermLabel(term)} registration phases`}>
                {phaseItems.map((item) => (
                  <li className={`registration-phase-item registration-phase-item--${item.state}${item.focus ? ' registration-phase-item--focus' : ''}`} key={item.label}>
                    <span className="registration-phase-marker" aria-hidden="true">{item.state === 'completed' ? '✓' : ''}</span>
                    <Text fw={item.focus ? 700 : 600} size="sm">{item.label}</Text>
                    {item.detail && <Text size="xs" c="dimmed">{item.detail}</Text>}
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      <Text className="registration-phases-caveat" size="xs" c="dimmed">Dates are public program milestones; individual time tickets vary.</Text>

      <style>{`
        .registration-phases-header { align-items: baseline; border-bottom: 1px solid var(--mantine-color-gray-3); display: flex; gap: 1rem; justify-content: space-between; padding-bottom: 0.75rem; }
        .registration-phases-rows { display: grid; }
        .registration-phase-row { align-items: center; border-bottom: 1px solid var(--mantine-color-gray-2); display: grid; gap: 1.25rem; grid-template-columns: 8rem minmax(0, 1fr); padding: 1rem 0; }
        .registration-phase-row:last-child { border-bottom: 0; }
        .registration-phase-list { display: flex; gap: 0; list-style: none; margin: 0; padding: 0; }
        .registration-phase-item { flex: 1 1 0; min-width: 0; padding: 1.1rem 0.75rem 0 0; position: relative; }
        .registration-phase-item:not(:last-child)::after { background: var(--mantine-color-gray-3); content: ''; height: 1px; left: 0.9rem; position: absolute; right: -0.15rem; top: 0.3rem; }
        .registration-phase-marker { align-items: center; background: var(--mantine-color-gray-5); border: 2px solid var(--mantine-color-body); border-radius: 999px; color: white; display: flex; font-size: 0.62rem; font-weight: 800; height: 0.7rem; justify-content: center; left: 0; position: absolute; top: 0; width: 0.7rem; z-index: 1; }
        .registration-phase-item--focus { background: #fbf8ea; border: 1px solid #B3A369; border-radius: 0.375rem; color: var(--mantine-color-dark-9); margin-top: -0.25rem; padding: 1.35rem 0.6rem 0.4rem; }
        .registration-phase-item--focus .registration-phase-marker { background: #B3A369; box-shadow: 0 0 0 3px color-mix(in srgb, #B3A369 20%, transparent); }
        .registration-phase-item--focus:not(:last-child)::after { background: #B3A369; height: 2px; }
        .registration-phases-caveat { border-top: 1px solid var(--mantine-color-gray-2); margin-top: 0.25rem; padding-top: 0.75rem; }
        @media (max-width: 48em) {
          .registration-phases-header { align-items: flex-start; flex-direction: column; gap: 0.25rem; }
          .registration-phase-row { display: block; padding: 0.85rem 0; }
          .registration-phase-term { margin-bottom: 0.6rem; }
          .registration-phase-list { display: block; padding-left: 1.25rem; }
          .registration-phase-item { padding: 0 0 0.85rem; }
          .registration-phase-item:not(:last-child)::after { bottom: 0; height: auto; left: -0.92rem; right: auto; top: 0.75rem; width: 1px; }
          .registration-phase-item--focus { margin: 0 0 0.85rem -0.35rem; padding: 0.35rem 0.5rem 0.45rem; }
          .registration-phase-item--focus:not(:last-child)::after { height: auto; width: 2px; }
          .registration-phase-marker { left: -1.25rem; top: 0.15rem; }
        }
      `}</style>
    </Paper>
  );
}
