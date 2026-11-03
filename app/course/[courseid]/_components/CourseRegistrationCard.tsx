'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { getTermLabel, SemesterOption } from '../../../schedule/_lib/semesters';
import {
  discoverRegistration,
  fetchRegistrationSnapshot,
  getCourseRegistrationSections,
  RegistrationSection,
  RegistrationSnapshot,
} from './registration';

function SectionRow({
  section,
  term,
}: {
  section: RegistrationSection;
  term: string;
}) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(section.crn);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <Paper withBorder radius='md' p='md'>
      <Group justify='space-between' gap='md'>
        <Stack gap={4}>
          <Group gap='xs'>
            <Text fw={600}>Section {section.sectionNumber}</Text>
            <Badge
              variant='light'
              color={section.seatsAvailable > 0 ? 'teal' : 'gray'}
            >
              {section.seatsAvailable > 0 ? 'Seats available' : 'Full'}
            </Badge>
          </Group>
          <Text size='sm' c='dimmed'>
            {section.enrolled} / {section.capacity} enrolled ·{' '}
            {Math.max(0, section.seatsAvailable)} seats available
            {section.waitCount !== undefined &&
              ` · ${section.waitCount} waitlisted`}
          </Text>
        </Stack>
        <Group gap='sm'>
          <Text component='span' ff='monospace' fw={700} size='lg'>
            CRN {section.crn}
          </Text>
          <Button
            variant='default'
            size='xs'
            onClick={copy}
            aria-label={`Copy CRN ${section.crn} for section ${section.sectionNumber}, ${getTermLabel(term)}`}
          >
            {copyStatus === 'copied' ? 'Copied' : 'Copy CRN'}
          </Button>
        </Group>
      </Group>
      <Text
        size='xs'
        c={copyStatus === 'failed' ? 'red' : 'dimmed'}
        role='status'
        aria-live='polite'
      >
        {copyStatus === 'failed'
          ? `Could not copy. Select and copy CRN ${section.crn} manually.`
          : copyStatus === 'copied'
            ? `CRN ${section.crn} copied.`
            : ''}
      </Text>
    </Paper>
  );
}

export default function CourseRegistrationCard({
  courseId,
}: {
  courseId: string;
}) {
  const [term, setTerm] = useState<string | null>(null);
  const [terms, setTerms] = useState<SemesterOption[]>([]);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    courseId: string;
    snapshot: RegistrationSnapshot;
    sections: RegistrationSection[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(false);
    setResult(null);
    const load = async () => {
      try {
        let snapshot: RegistrationSnapshot | null;
        if (term) {
          snapshot = await fetchRegistrationSnapshot(term, controller.signal);
        } else {
          const discovered = await discoverRegistration(controller.signal);
          if (!active) return;
          setTerms(discovered.terms);
          snapshot = discovered.snapshot;
        }
        // A missing snapshot is not evidence that this specific course is not offered.
        if (!snapshot) throw new Error('Term data unavailable');
        const sections = getCourseRegistrationSections(snapshot, courseId);
        if (active) setResult({ courseId, snapshot, sections });
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [courseId, term, retry]);

  const visible =
    result?.courseId === courseId && (!term || result.snapshot.term === term)
      ? result
      : null;
  const activeTerm = term || visible?.snapshot.term || '';
  const updated = visible?.snapshot.lastUpdated
    ? new Date(visible.snapshot.lastUpdated)
    : null;

  return (
    <Paper
      component='section'
      aria-label='Course registration'
      p='lg'
      radius='lg'
      withBorder
      mb='xl'
    >
      <Stack gap='md'>
        <Group justify='space-between' align='flex-end'>
          <Stack gap={4}>
            <Title order={2} size='h3'>
              Registration
            </Title>
            <Text size='sm' c='dimmed'>
              CRNs are specific to each term and section.
            </Text>
          </Stack>
          <Select
            label='Registration term'
            value={activeTerm || null}
            data={terms}
            onChange={(value) => {
              if (value) setTerm(value);
            }}
            disabled={!terms.length}
            allowDeselect={false}
            w={200}
          />
        </Group>
        {loading && (
          <Group role='status'>
            <Loader size='sm' />
            <Text size='sm'>Loading registration data…</Text>
          </Group>
        )}
        {error && (
          <Stack gap='xs'>
            <Text role='alert' size='sm'>
              Registration data could not be loaded. Try again or check the
              schedule.
            </Text>
            <Button
              variant='light'
              size='xs'
              onClick={() => setRetry((value) => value + 1)}
              style={{ alignSelf: 'flex-start' }}
            >
              Try again
            </Button>
          </Stack>
        )}
        {!loading && !error && visible && (
          <>
            <Text fw={600} size='sm'>
              {getTermLabel(visible.snapshot.term)}
            </Text>
            {visible.sections.length ? (
              visible.sections.map((section) => (
                <SectionRow
                  key={`${courseId}-${visible.snapshot.term}-${section.crn}`}
                  section={section}
                  term={visible.snapshot.term}
                />
              ))
            ) : (
              <Text size='sm'>
                {courseId} is not offered in{' '}
                {getTermLabel(visible.snapshot.term)} in the published schedule.
              </Text>
            )}
            {updated && !Number.isNaN(updated.getTime()) && (
              <Text size='xs' c='dimmed'>
                Data updated{' '}
                <time dateTime={updated.toISOString()}>
                  {updated.toLocaleString()}
                </time>
              </Text>
            )}
          </>
        )}
        <Group justify='space-between' gap='xs'>
          <Text size='xs' c='dimmed'>
            Seats can change. Confirm availability and registration eligibility
            in OSCAR.
          </Text>
          <Anchor component={Link} href='/schedule' size='sm'>
            View full schedule
          </Anchor>
        </Group>
      </Stack>
    </Paper>
  );
}
