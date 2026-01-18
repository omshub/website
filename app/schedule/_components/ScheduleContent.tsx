'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  Table,
  Badge,
  Paper,
  Group,
  Center,
  Loader,
  Anchor,
  Box,
  Tooltip,
  Stack,
  SimpleGrid,
  ThemeIcon,
  Progress,
  Alert,
  ActionIcon,
  CopyButton,
  Select,
  TextInput,
} from '@mantine/core';
import {
  IconSearch,
  IconCalendar,
  IconUsers,
  IconListCheck,
  IconSchool,
  IconAlertCircle,
  IconRefresh,
  IconBriefcase,
  IconStar,
  IconBookmark,
  IconCopy,
  IconCheck,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

// Data repository URL
const DATA_REPO_BASE = 'https://raw.githubusercontent.com/omshub/data/main';

// Decode HTML entities from API data
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

// Types for the data from omshub/data repo
interface RawCourseSection {
  crn: string;
  sectionNumber: string;
  instructor: string | null;
  enrolled: number;
  capacity: number;
  seatsAvailable: number;
  waitCount?: number;
  waitCapacity?: number;
}

interface RawCourseEntry {
  courseId: string;
  subject: string;
  courseNumber: string;
  name: string;
  sections: RawCourseSection[];
  totalSeats: number;
  totalEnrolled: number;
}

interface RawAvailabilityData {
  term: string;
  termName: string;
  lastUpdated: string;
  courses: {
    [courseId: string]: RawCourseEntry;
  };
}

interface CourseMetadata {
  courseId: string;
  name: string;
  departmentId: string;
  courseNumber: string;
  url: string | null;
  isFoundational: boolean;
  aliases: string[];
  isDeprecated: boolean;
}

interface CourseMetadataMap {
  [courseId: string]: CourseMetadata;
}

// Specialization types
interface CoreCourseGroup {
  name: string;
  pickCount: number;
  courseIds: string[];
}

interface Specialization {
  specializationId: string;
  name: string;
  programId: string;
  coreCourses?: CoreCourseGroup[];
  electiveCourseIds?: string[];
}

interface SpecializationMap {
  [specId: string]: Specialization;
}

interface Program {
  programId: string;
  name: string;
  url: string;
}

interface ProgramMap {
  [programId: string]: Program;
}

// Processed section for display
interface CourseSection {
  crn: string;
  courseId: string;
  name: string;
  aliases: string[];
  instructor: string;
  sectionNumber: string;
  capacity: number;
  enrolled: number;
  seatsAvailable: number;
  waitlist: number;
  url: string | null;
}

// Term code utilities
function getTermCode(year: number, semester: 'sp' | 'sm' | 'fa'): string {
  const semesterCodes = { sp: '02', sm: '05', fa: '08' };
  return `${year}${semesterCodes[semester]}`;
}

function parseTermCode(termCode: string): { year: number; semester: string } {
  const year = parseInt(termCode.substring(0, 4));
  const semCode = termCode.substring(4);
  const semesterMap: Record<string, string> = { '02': 'Spring', '05': 'Summer', '08': 'Fall' };
  return { year, semester: semesterMap[semCode] || 'Unknown' };
}

function getTermLabel(termCode: string): string {
  const { year, semester } = parseTermCode(termCode);
  return `${semester} ${year}`;
}

// Get current semester based on month
function getCurrentSemester(): { year: number; semester: 'sp' | 'sm' | 'fa' } {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();

  if (month >= 1 && month <= 4) {
    return { year, semester: 'sp' }; // Spring: Jan-Apr
  } else if (month >= 5 && month <= 7) {
    return { year, semester: 'sm' }; // Summer: May-Jul
  } else {
    return { year, semester: 'fa' }; // Fall: Aug-Dec
  }
}

// Available semesters - current and past back to 2014, most recent first
function getAvailableSemesters(): { value: string; label: string }[] {
  const { year: currentYear, semester: currentSem } = getCurrentSemester();
  const semesters: { value: string; label: string }[] = [];
  const semesterOrder: ('sp' | 'sm' | 'fa')[] = ['sp', 'sm', 'fa'];
  const startYear = 2014; // OMSCS program started

  // Start from current semester and go backwards to 2014
  let year = currentYear;
  let semIndex = semesterOrder.indexOf(currentSem);

  while (year >= startYear) {
    const sem = semesterOrder[semIndex];
    const semLabel = sem === 'sp' ? 'Spring' : sem === 'sm' ? 'Summer' : 'Fall';
    semesters.push({
      value: getTermCode(year, sem),
      label: `${semLabel} ${year}`,
    });

    // Move to previous semester
    semIndex--;
    if (semIndex < 0) {
      semIndex = 2; // wrap to Fall
      year--;
    }
  }

  return semesters;
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <Paper
      p="lg"
      radius="md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        overflow: 'hidden', /* Prevent overflow */
        position: 'relative', /* Contain stacking context */
      }}
    >
      <Group gap="md">
        <ThemeIcon size={48} radius="md" variant="light" color={color} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          {icon}
        </ThemeIcon>
        <div>
          <Text size="xl" fw={700} c="white" lh={1}>
            {value}
          </Text>
          <Text size="sm" c="white" style={{ opacity: 0.8 }} fw={500}>
            {label}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

// Score function for alias-priority search
function getSearchScore(section: CourseSection, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 1; // Show all when no query

  const aliases = section.aliases || [];
  const courseId = section.courseId || '';
  const name = section.name || '';
  const instructor = section.instructor || '';

  // Highest priority: Exact alias match
  if (aliases.some((a) => a.toLowerCase() === normalizedQuery)) {
    return 1000;
  }
  // High priority: Alias starts with query
  if (aliases.some((a) => a.toLowerCase().startsWith(normalizedQuery))) {
    return 900;
  }
  // High priority: Alias contains query
  if (aliases.some((a) => a.toLowerCase().includes(normalizedQuery))) {
    return 800;
  }
  // Medium priority: Course ID exact match
  if (courseId.toLowerCase() === normalizedQuery) {
    return 700;
  }
  // Medium priority: Course ID starts with query
  if (courseId.toLowerCase().startsWith(normalizedQuery)) {
    return 600;
  }
  // Medium priority: Course ID contains query
  if (courseId.toLowerCase().includes(normalizedQuery)) {
    return 500;
  }
  // Lower priority: Name contains query
  if (name.toLowerCase().includes(normalizedQuery)) {
    return 300;
  }
  // Lower priority: Instructor contains query
  if (instructor.toLowerCase().includes(normalizedQuery)) {
    return 200;
  }

  return 0; // No match
}

export default function ScheduleContent() {
  const semesters = useMemo(() => {
    return getAvailableSemesters();
  }, []);
  const [activeSemester, setActiveSemester] = useState(semesters[0]?.value || '202602');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<SpecializationMap>({});
  const [programs, setPrograms] = useState<ProgramMap>({});
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch course metadata, availability, specializations, and programs in parallel
        const [metadataResponse, availabilityResponse, specializationsResponse, programsResponse] = await Promise.all([
          fetch(`${DATA_REPO_BASE}/static/courses.json`),
          fetch(`${DATA_REPO_BASE}/data/${activeSemester}.json`),
          fetch(`${DATA_REPO_BASE}/static/specializations.json`),
          fetch(`${DATA_REPO_BASE}/static/programs.json`),
        ]);

        if (!metadataResponse.ok) {
          throw new Error('Failed to fetch course metadata');
        }

        if (!availabilityResponse.ok) {
          if (availabilityResponse.status === 404) {
            // No data for this semester yet
            setSections([]);
            setLastUpdated(null);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch availability data');
        }

        const metadata: CourseMetadataMap = await metadataResponse.json();
        const availability: RawAvailabilityData = await availabilityResponse.json();

        // Parse specializations and programs (non-critical, so don't fail on error)
        if (specializationsResponse.ok) {
          const specData: SpecializationMap = await specializationsResponse.json();
          setSpecializations(specData);
        }
        if (programsResponse.ok) {
          const progData: ProgramMap = await programsResponse.json();
          setPrograms(progData);
        }

        // Combine data
        const combinedSections: CourseSection[] = [];


        if (!availability.courses) {
          throw new Error('No courses data in availability response');
        }

        // Course numbers to exclude (thesis, dissertation, assistantships, etc.)
        const excludedCourseNumbers = new Set(['6999', '7000', '7999', '8997', '8998', '8999', '9000']);

        for (const [courseId, courseData] of Object.entries(availability.courses)) {
          // Extract course number from courseId (e.g., "CS-6035" -> "6035")
          const courseNumber = courseId.split('-')[1];
          if (courseNumber && excludedCourseNumbers.has(courseNumber)) {
            continue; // Skip thesis, dissertation, and assistantship courses
          }

          const courseInfo = metadata[courseId];

          // Only include courses that are in the official course metadata
          // This filters out non-OMSCS courses like ECE-8903 (Special Problems)
          if (!courseInfo) {
            continue;
          }
          const sections = courseData.sections || [];

          for (const section of sections) {
            combinedSections.push({
              crn: section.crn,
              courseId,
              name: decodeHtmlEntities(courseInfo?.name || courseData.name || courseId),
              aliases: courseInfo?.aliases || [],
              instructor: section.instructor || 'TBA',
              sectionNumber: section.sectionNumber,
              capacity: section.capacity,
              enrolled: section.enrolled,
              seatsAvailable: section.seatsAvailable,
              waitlist: section.waitCount || 0,
              url: courseInfo?.url || null,
            });
          }
        }

        // Sort by courseId
        combinedSections.sort((a, b) => a.courseId.localeCompare(b.courseId));

        setSections(combinedSections);
        setLastUpdated(availability.lastUpdated ? new Date(availability.lastUpdated).toLocaleString() : new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Error fetching availability data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeSemester]);

  // Build specialization options for dropdown (flat list with program prefix)
  const specializationOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];

    Object.values(specializations).forEach((spec) => {
      // Only include specializations that have course data
      if (spec.coreCourses?.length || spec.electiveCourseIds?.length) {
        const programName = programs[spec.programId]?.name || spec.programId.toUpperCase();
        options.push({
          value: spec.specializationId,
          label: `${decodeHtmlEntities(programName)} - ${decodeHtmlEntities(spec.name)}`,
        });
      }
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [specializations, programs]);

  // Get selected specialization data
  const selectedSpec = selectedSpecialization ? specializations[selectedSpecialization] : null;

  // Get all core course IDs for selected specialization
  const coreCourseIds = useMemo(() => {
    if (!selectedSpec?.coreCourses) return new Set<string>();
    const ids = new Set<string>();
    selectedSpec.coreCourses.forEach((group) => {
      (group.courseIds || []).forEach((id) => ids.add(id));
    });
    return ids;
  }, [selectedSpec]);

  // Get elective course IDs for selected specialization
  const electiveCourseIds = useMemo(() => {
    return new Set(selectedSpec?.electiveCourseIds || []);
  }, [selectedSpec]);

  // Filter and sort with alias priority
  const filteredAndSortedSections = useMemo(() => {
    if (!Array.isArray(sections)) {
      return [];
    }

    const scored = sections.map((section) => ({
      section,
      score: getSearchScore(section, searchQuery),
    }));

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.section);
  }, [sections, searchQuery]);

  // Group sections by core/elective/free when specialization is selected
  const groupedSections = useMemo(() => {

    if (!selectedSpec) {
      return { all: filteredAndSortedSections || [] };
    }

    const core: CourseSection[] = [];
    const electives: CourseSection[] = [];
    const freeElectives: CourseSection[] = [];

    (filteredAndSortedSections || []).forEach((section) => {
      if (coreCourseIds.has(section.courseId)) {
        core.push(section);
      } else if (electiveCourseIds.has(section.courseId)) {
        electives.push(section);
      } else {
        freeElectives.push(section);
      }
    });

    return { core, electives, freeElectives };
  }, [filteredAndSortedSections, selectedSpec, coreCourseIds, electiveCourseIds]);

  // Calculate stats
  const safeSections = sections || [];
  const totalEnrolled = safeSections.reduce((sum, s) => sum + s.enrolled, 0);
  const totalWaitlist = safeSections.reduce((sum, s) => sum + s.waitlist, 0);
  const uniqueCourses = new Set(safeSections.map((s) => s.courseId)).size;

  // Accessible text colors (5:1+ contrast on white)
  const getEnrollmentColor = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 0.9) return '#c92a2a'; // Dark red (accessible)
    if (ratio >= 0.7) return '#7a5d00'; // Dark amber (5.2:1 on white)
    return '#256029'; // Dark green (accessible)
  };

  const getEnrollmentBadgeColor = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 0.9) return 'red';
    if (ratio >= 0.7) return 'orange';
    return 'green';
  };

  // Get registration status based on enrollment data
  const getRegistrationStatus = (section: CourseSection) => {
    const { seatsAvailable, capacity, waitlist } = section;

    // Waitlist takes priority - if anyone is on waitlist, it's effectively full
    if (waitlist > 0) {
      return { status: 'Waitlist', color: GT_COLORS.newHorizon, description: `${waitlist} on waitlist` };
    }

    // No seats available
    if (seatsAvailable <= 0) {
      return { status: 'Closed', color: GT_COLORS.grayMatter, description: 'No seats available' };
    }

    // Calculate fill percentage
    const fillPercentage = capacity > 0 ? ((capacity - seatsAvailable) / capacity) * 100 : 0;

    // Over 80% full = Limited
    if (fillPercentage >= 80) {
      return { status: 'Limited', color: GT_COLORS.buzzGold, description: `${seatsAvailable} seat${seatsAvailable === 1 ? '' : 's'} left (${Math.round(fillPercentage)}% full)` };
    }

    // Under 80% full = Open
    return { status: 'Open', color: GT_COLORS.canopyLime, description: `${seatsAvailable} seats available` };
  };

  // Check if viewing current semester (for showing status)
  const { year: currentYear, semester: currentSem } = getCurrentSemester();
  const currentTermCode = getTermCode(currentYear, currentSem);
  const isCurrentSemester = activeSemester === currentTermCode;

  // Reusable table row renderer
  const renderSectionRow = (section: CourseSection, showCoreElectiveBadge = false) => {
    const regStatus = getRegistrationStatus(section);

    return (
    <Table.Tr key={`${section.crn}-${section.sectionNumber}`}>
      <Table.Td>
        <Group gap={4} wrap="nowrap">
          <Badge variant="filled" size="sm" color="dark">
            {section.crn}
          </Badge>
          <CopyButton value={section.crn} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy CRN'} withArrow position="right">
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  color={copied ? 'teal' : 'gray'}
                  onClick={copy}
                  aria-label={copied ? 'CRN copied to clipboard' : `Copy CRN ${section.crn} to clipboard`}
                >
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Table.Td>
      {isCurrentSemester && (
        <Table.Td ta="center">
          <Tooltip label={regStatus.description}>
            <Badge
              variant="filled"
              size="sm"
              style={{ backgroundColor: regStatus.color, color: (regStatus.status === 'Open' || regStatus.status === 'Limited') ? GT_COLORS.navy : 'white' }}
            >
              {regStatus.status}
            </Badge>
          </Tooltip>
        </Table.Td>
      )}
      <Table.Td>
        <Stack gap={4}>
          <Group gap="xs">
            {section.url ? (
              <Anchor
                href={section.url}
                target="_blank"
                fw={600}
                style={{ color: GT_COLORS.boldBlue }}
                underline="always"
              >
                {section.courseId}
              </Anchor>
            ) : (
              <Text fw={600} style={{ color: GT_COLORS.boldBlue }}>
                {section.courseId}
              </Text>
            )}
            {showCoreElectiveBadge && coreCourseIds.has(section.courseId) && (
              <Tooltip label="Core course for this specialization">
                <Badge variant="filled" size="xs" color="violet">
                  Core
                </Badge>
              </Tooltip>
            )}
            {showCoreElectiveBadge && electiveCourseIds.has(section.courseId) && (
              <Tooltip label="Elective for this specialization">
                <Badge variant="filled" size="xs" color="teal">
                  Elective
                </Badge>
              </Tooltip>
            )}
            {section.aliases.length > 0 && (
              <Tooltip label="Common abbreviations for this course">
                <Badge variant="light" size="xs" style={{ backgroundColor: `${GT_COLORS.olympicTeal}25`, color: '#006670' }}>
                  {section.aliases.join(' / ')}
                </Badge>
              </Tooltip>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {section.name}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{section.instructor}</Text>
      </Table.Td>
      <Table.Td>
        <Stack gap={4} w={120}>
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {section.enrolled} / {section.capacity}
            </Text>
            <Text size="xs" fw={600} style={{ color: getEnrollmentColor(section.enrolled, section.capacity) }}>
              {section.capacity > 0 ? Math.round((section.enrolled / section.capacity) * 100) : 0}%
            </Text>
          </Group>
          <Progress.Root size="sm" radius="xl">
            <Progress.Section
              value={section.capacity > 0 ? (section.enrolled / section.capacity) * 100 : 0}
              color={getEnrollmentBadgeColor(section.enrolled, section.capacity)}
              aria-label={`Enrollment progress: ${section.enrolled} out of ${section.capacity} seats filled`}
            />
          </Progress.Root>
        </Stack>
      </Table.Td>
      <Table.Td ta="center">
        {section.waitlist > 0 ? (
          <Badge variant="filled" size="sm" style={{ backgroundColor: '#7a5d00', color: 'white' }}>
            {section.waitlist}
          </Badge>
        ) : (
          <Text size="sm" c="dimmed">-</Text>
        )}
      </Table.Td>
    </Table.Tr>
    );
  };

  // Reusable table component
  const renderTable = (sectionsList: CourseSection[], showCoreElectiveBadge = false) => (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead style={{ backgroundColor: GT_COLORS.navy }}>
          <Table.Tr>
            <Table.Th style={{ color: 'white' }}>CRN</Table.Th>
            {isCurrentSemester && <Table.Th style={{ color: 'white', textAlign: 'center' }}>Status</Table.Th>}
            <Table.Th style={{ color: 'white' }}>Course</Table.Th>
            <Table.Th style={{ color: 'white' }}>Instructor</Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>Enrollment</Table.Th>
            <Table.Th style={{ color: 'white', textAlign: 'center' }}>Waitlist</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(sectionsList || []).map((section) => renderSectionRow(section, showCoreElectiveBadge))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );

  return (
    <>
      {/* Hero Section */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Container size="lg" py="xl">
          <Stack gap="md" align="center" mb="xl">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              Live Registration Data
            </Badge>
            <Title order={1} c="white" ta="center" fw={700}>
              Course Schedule
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={600}>
              View real-time enrollment data for OMS courses. Find available seats, waitlist counts, and plan your semester.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" maw={800} mx="auto" style={{ overflow: 'hidden' }}>
            <StatCard
              icon={<IconSchool size={24} color="white" />}
              value={uniqueCourses}
              label="Courses Offered"
              color="blue"
            />
            <StatCard
              icon={<IconUsers size={24} color="white" />}
              value={totalEnrolled.toLocaleString()}
              label="Total Enrolled"
              color="teal"
            />
            <StatCard
              icon={<IconListCheck size={24} color="white" />}
              value={totalWaitlist.toLocaleString()}
              label="On Waitlists"
              color="orange"
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Error Alert */}
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error loading data"
            color="red"
            mb="xl"
            withCloseButton
            onClose={() => setError(null)}
          >
            {error}. Please try again later or select a different semester.
          </Alert>
        )}

        {/* Filters */}
        <Paper
          p="md"
          mb="xl"
          radius="lg"
          withBorder
        >
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Select
              label="Semester"
              data={semesters}
              value={activeSemester}
              onChange={(value) => setActiveSemester(value || semesters[0]?.value || '')}
              leftSection={<IconCalendar size={16} />}
              allowDeselect={false}
              comboboxProps={{ withinPortal: true }}
            />

            <Select
              label="Specialization"
              data={[{ value: '', label: 'All Courses' }, ...specializationOptions]}
              value={selectedSpecialization || ''}
              onChange={(value) => setSelectedSpecialization(value || null)}
              leftSection={<IconBriefcase size={16} />}
              searchable
              clearable
              placeholder="All Courses"
              comboboxProps={{ withinPortal: true }}
            />

            <TextInput
              label="Search"
              placeholder="Search by course ID, name, or alias..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftSection={<IconSearch size={16} />}
            />
          </SimpleGrid>

          {/* Selected Specialization Info */}
          {selectedSpec && (
            <Group gap="xs" mt="md">
              <Badge variant="light" color="blue" size="sm">
                {coreCourseIds.size} Core Courses
              </Badge>
              <Badge variant="light" color="teal" size="sm">
                {electiveCourseIds.size} Electives
              </Badge>
              <Text size="xs" c="dimmed">
                in {decodeHtmlEntities(selectedSpec.name)}
              </Text>
            </Group>
          )}
        </Paper>

        {/* Results Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} size="h3">
              {getTermLabel(activeSemester)} Courses
            </Title>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                {lastUpdated ? `Last updated ${lastUpdated}` : 'Data from OSCAR'}
                {' · Updates every 30 minutes'}
              </Text>
              <IconRefresh
                size={14}
                style={{
                  color: GT_COLORS.grayMatter,
                  animation: 'spin-ccw 2s linear infinite',
                }}
              />
              <style>{`
                @keyframes spin-ccw {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(-360deg); }
                }
              `}</style>
            </Group>
          </div>
          <Badge variant="filled" color="dark" size="lg">
            {filteredAndSortedSections.length} sections
          </Badge>
        </Group>

        {/* Table(s) */}
        {loading ? (
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            <Center h={300}>
              <Stack align="center" gap="md">
                <Loader color={GT_COLORS.techGold} />
                <Text c="dimmed" size="sm">Loading course data...</Text>
              </Stack>
            </Center>
          </Paper>
        ) : sections.length === 0 ? (
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            <Center h={300}>
              <Stack align="center" gap="md">
                <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                  <IconCalendar size={30} />
                </ThemeIcon>
                <Title order={3} c="dimmed">
                  No data available
                </Title>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Course availability data for {getTermLabel(activeSemester)} is not yet available.
                  Try selecting a different semester.
                </Text>
              </Stack>
            </Center>
          </Paper>
        ) : selectedSpec ? (
          // Grouped view for specialization
          <Stack gap="xl">
            {/* Core Courses Section */}
            {groupedSections.core && groupedSections.core.length > 0 && (
              <div>
                <Group gap="sm" mb="md">
                  <ThemeIcon size={28} radius="md" variant="light" color="violet">
                    <IconStar size={16} />
                  </ThemeIcon>
                  <Title order={3} size="h4">
                    Core Courses
                  </Title>
                  <Badge variant="light" color="violet" size="sm">
                    {new Set(groupedSections.core.map((s) => s.courseId)).size} courses
                  </Badge>
                </Group>
                <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
                  {renderTable(groupedSections.core)}
                </Paper>
              </div>
            )}

            {/* Elective Courses Section */}
            {groupedSections.electives && groupedSections.electives.length > 0 && (
              <div>
                <Group gap="sm" mb="md">
                  <ThemeIcon size={28} radius="md" variant="light" color="teal">
                    <IconBookmark size={16} />
                  </ThemeIcon>
                  <Title order={3} size="h4">
                    Elective Courses
                  </Title>
                  <Badge variant="light" color="teal" size="sm">
                    {new Set(groupedSections.electives.map((s) => s.courseId)).size} courses
                  </Badge>
                </Group>
                <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
                  {renderTable(groupedSections.electives)}
                </Paper>
              </div>
            )}

            {/* Free Electives Section */}
            {groupedSections.freeElectives && groupedSections.freeElectives.length > 0 && (
              <div>
                <Group gap="sm" mb="md">
                  <ThemeIcon size={28} radius="md" variant="light" color="gray">
                    <IconListCheck size={16} />
                  </ThemeIcon>
                  <Title order={3} size="h4">
                    Free Electives
                  </Title>
                  <Badge variant="light" color="gray" size="sm">
                    {new Set(groupedSections.freeElectives.map((s) => s.courseId)).size} courses
                  </Badge>
                </Group>
                <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
                  {renderTable(groupedSections.freeElectives)}
                </Paper>
              </div>
            )}

            {/* No courses found for this specialization */}
            {(!groupedSections.core || groupedSections.core.length === 0) &&
             (!groupedSections.electives || groupedSections.electives.length === 0) &&
             (!groupedSections.freeElectives || groupedSections.freeElectives.length === 0) && (
              <Paper radius="lg" withBorder p="xl" ta="center">
                <Stack align="center" gap="md">
                  <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                    <IconCalendar size={30} />
                  </ThemeIcon>
                  <Title order={3} c="dimmed">
                    No courses available
                  </Title>
                  <Text c="dimmed" size="sm">
                    No courses for {decodeHtmlEntities(selectedSpec.name)} are offered in {getTermLabel(activeSemester)}.
                  </Text>
                </Stack>
              </Paper>
            )}
          </Stack>
        ) : (
          // Default ungrouped view
          <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
            {renderTable(filteredAndSortedSections)}
          </Paper>
        )}

        {/* Empty Search State */}
        {!loading && sections.length > 0 && filteredAndSortedSections.length === 0 && (
          <Paper p="xl" radius="lg" withBorder ta="center" mt="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <IconSearch size={30} />
              </ThemeIcon>
              <Title order={3} c="dimmed">
                No courses found
              </Title>
              <Text c="dimmed" size="sm">
                Try adjusting your search query or selecting a different semester
              </Text>
            </Stack>
          </Paper>
        )}

        {/* Data Source Attribution */}
        <Text size="xs" c="dimmed" ta="center" mt="xl">
          Data sourced from{' '}
          <Anchor href="https://github.com/omshub/data" target="_blank" size="xs" underline="always">
            omshub/data
          </Anchor>
          {' '}repository, updated automatically from OSCAR.
        </Text>
      </Container>
    </>
  );
}
