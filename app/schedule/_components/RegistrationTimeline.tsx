'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
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
          <Stack key={term} gap="xs">
            <Text fw={700}>{getTermLabel(term)}</Text>
            <SimpleGrid cols={{ base: 1, sm: Math.min(termMilestones.length, 4) }} spacing="xs">
              {termMilestones.map((milestone) => {
                const countdown = formatRegistrationCountdown(milestone, liveNow);
                return (
                  <Paper key={`${milestone.kind}-${milestone.date}`} p="sm" radius="md" withBorder bg={milestone.state === 'current' ? 'yellow.0' : undefined}>
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
                );
              })}
            </SimpleGrid>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
