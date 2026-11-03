'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Anchor,
  Button,
  Group,
  Text,
  Tooltip,
  VisuallyHidden,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { getTermLabel } from '../../../schedule/_lib/semesters';
import {
  discoverRegistration,
  getCourseRegistrationSections,
  RegistrationSection,
} from './registration';

function CrnButton({
  section,
  term,
  showSection,
}: {
  section: RegistrationSection;
  term: string;
  showSection: boolean;
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(section.crn);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };

  return (
    <>
      <Tooltip
        label={
          status === 'copied' ? 'Copied' : `Copy CRN for ${getTermLabel(term)}`
        }
      >
        <Button
          variant='transparent'
          size='compact-sm'
          onClick={copy}
          aria-label={`Copy CRN ${section.crn} for section ${section.sectionNumber}, ${getTermLabel(term)}`}
          rightSection={
            status === 'copied' ? (
              <IconCheck size={14} />
            ) : (
              <IconCopy size={14} />
            )
          }
          styles={{
            root: {
              color: '#ffffff',
              padding: '4px 6px',
              height: 'auto',
              minHeight: 32,
            },
            label: { fontWeight: 600 },
          }}
        >
          {showSection && (
            <Text component='span' size='sm' c='#c5d3df' mr={6}>
              {section.sectionNumber}
            </Text>
          )}
          CRN {section.crn}
        </Button>
      </Tooltip>
      <Text
        component='span'
        role='status'
        aria-live='polite'
        size='xs'
        c='white'
      >
        {status === 'failed' ? (
          `Could not copy. Select CRN ${section.crn} manually.`
        ) : (
          <VisuallyHidden>
            {status === 'copied' ? `CRN ${section.crn} copied.` : ''}
          </VisuallyHidden>
        )}
      </Text>
    </>
  );
}

export default function CourseRegistration({ courseId }: { courseId: string }) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{
    courseId: string;
    term: string;
    sections: RegistrationSection[];
  } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setError(false);
    setResult(null);
    void discoverRegistration(controller.signal)
      .then(({ snapshot }) => {
        const sections = getCourseRegistrationSections(snapshot, courseId);
        if (active) setResult({ courseId, term: snapshot.term, sections });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [courseId, retry]);

  const visible = result?.courseId === courseId ? result : null;
  const scheduleLink = (
    <Anchor
      component={Link}
      href='/schedule'
      size='sm'
      c='#e8d99f'
      underline='hover'
    >
      Schedule
    </Anchor>
  );

  return (
    <Group
      component='section'
      aria-label='Course registration'
      gap={6}
      align='center'
      wrap='wrap'
    >
      {error ? (
        <>
          <Text component='span' size='sm' c='#c5d3df' role='alert'>
            CRN unavailable
          </Text>
          <Button
            variant='transparent'
            size='compact-sm'
            c='white'
            onClick={() => setRetry((value) => value + 1)}
          >
            Retry
          </Button>
          {scheduleLink}
        </>
      ) : !visible ? (
        <Text component='span' size='sm' c='#c5d3df' role='status'>
          Loading CRN…
        </Text>
      ) : (
        <>
          <Text component='span' size='sm' c='#c5d3df'>
            {getTermLabel(visible.term)}
          </Text>
          <Text component='span' c='#849bad' aria-hidden='true'>
            ·
          </Text>
          {visible.sections.length ? (
            visible.sections.map((section) => (
              <CrnButton
                key={`${visible.term}-${section.crn}`}
                section={section}
                term={visible.term}
                showSection={visible.sections.length > 1}
              />
            ))
          ) : (
            <>
              <Text component='span' size='sm' c='#c5d3df'>
                Not offered this term
              </Text>
              {scheduleLink}
            </>
          )}
        </>
      )}
    </Group>
  );
}
