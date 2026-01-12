'use client';

import { useState, useEffect } from 'react';
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
  TextInput,
  Box,
  Tooltip,
  Stack,
  SimpleGrid,
  ThemeIcon,
  Select,
  Progress,
} from '@mantine/core';
import {
  IconSearch,
  IconCalendar,
  IconUsers,
  IconClock,
  IconChevronDown,
  IconSchool,
  IconListCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { GT_COLORS } from '@/lib/theme';

interface CourseSection {
  crn: string;
  courseId: string;
  name: string;
  aliases: string[];
  instructor: string;
  lastUpdate: string;
  status: string;
  capacity: number;
  enrolled: number;
  waitlist: number;
}

// Course aliases mapping - fetched from static data
const courseAliases: Record<string, string[]> = {
  'CS-6035': ['IIS', 'InfoSec'],
  'CS-6150': ['CFG', 'C4G', 'CG'],
  'CS-6200': ['GIOS', 'IOS', 'OS'],
  'CS-6210': ['AOS'],
  'CS-6238': ['SCS', 'SecSys'],
  'CS-6250': ['CN'],
  'CS-6261': ['CIR'],
  'CS-6262': ['NSS', 'NetSec'],
  'CS-6265': ['HPCA'],
  'CS-6291': ['ESO'],
  'CS-6300': ['SDP'],
  'CS-6340': ['SAT', 'SwTest'],
  'CS-6211': ['SICC', 'SDCC'],
};

// Mock data for demonstration - replace with actual API call
const mockSections: CourseSection[] = [
  {
    crn: '24565',
    courseId: 'CS-6035',
    name: 'Intro To Info Security',
    aliases: courseAliases['CS-6035'] || [],
    instructor: 'Venquist, Sanhorn',
    lastUpdate: '47 / 52',
    status: 'Active',
    capacity: 1000,
    enrolled: 47,
    waitlist: 52,
  },
  {
    crn: '29611',
    courseId: 'CS-6150',
    name: 'Computing For Good',
    aliases: courseAliases['CS-6150'] || [],
    instructor: 'Gaelharison, Kyle',
    lastUpdate: '1544 / 1920',
    status: 'Active',
    capacity: 1920,
    enrolled: 1544,
    waitlist: 0,
  },
  {
    crn: '25612',
    courseId: 'CS-6200',
    name: 'Graduate Intro to OS',
    aliases: courseAliases['CS-6200'] || [],
    instructor: 'Gavrilovska, Ada',
    lastUpdate: '1001 / 1200',
    status: 'Active',
    capacity: 1200,
    enrolled: 1001,
    waitlist: 0,
  },
  {
    crn: '24581',
    courseId: 'CS-6210',
    name: 'Sys Design Cloud Comput',
    aliases: courseAliases['CS-6210'] || [],
    instructor: 'Ramachandran, U.',
    lastUpdate: '82 / 75',
    status: 'Active',
    capacity: 500,
    enrolled: 82,
    waitlist: 75,
  },
  {
    crn: '26400',
    courseId: 'CS-6238',
    name: 'Secure Computer Systems',
    aliases: courseAliases['CS-6238'] || [],
    instructor: 'Ahamad, Mustaque',
    lastUpdate: '0 / 0',
    status: 'Active',
    capacity: 700,
    enrolled: 0,
    waitlist: 0,
  },
  {
    crn: '27614',
    courseId: 'CS-6250',
    name: 'Computer Networks',
    aliases: courseAliases['CS-6250'] || [],
    instructor: 'Boldyreva, A.',
    lastUpdate: '0 / 0',
    status: 'Active',
    capacity: 500,
    enrolled: 0,
    waitlist: 0,
  },
  {
    crn: '24261',
    courseId: 'CS-6261',
    name: 'Cyber Incident Response',
    aliases: courseAliases['CS-6261'] || [],
    instructor: 'Lamme, Jimmy',
    lastUpdate: '0 / 0',
    status: 'Active',
    capacity: 400,
    enrolled: 0,
    waitlist: 0,
  },
  {
    crn: '23910',
    courseId: 'CS-6262',
    name: 'Network Security',
    aliases: courseAliases['CS-6262'] || [],
    instructor: 'Zolwon, J.',
    lastUpdate: '43 / 60',
    status: 'Active',
    capacity: 600,
    enrolled: 43,
    waitlist: 60,
  },
  {
    crn: '23605',
    courseId: 'CS-6265',
    name: 'High Perf Comput Arch',
    aliases: courseAliases['CS-6265'] || [],
    instructor: 'Prvulovic, Milos',
    lastUpdate: '260 / 300',
    status: 'Active',
    capacity: 300,
    enrolled: 260,
    waitlist: 0,
  },
  {
    crn: '25297',
    courseId: 'CS-6291',
    name: 'Embedded Software Opt',
    aliases: courseAliases['CS-6291'] || [],
    instructor: 'Pande, Santosh',
    lastUpdate: '0 / 0',
    status: 'Active',
    capacity: 400,
    enrolled: 0,
    waitlist: 0,
  },
  {
    crn: '27435',
    courseId: 'CS-6300',
    name: 'Software Dev & Design',
    aliases: courseAliases['CS-6300'] || [],
    instructor: 'Moss, Ellisa',
    lastUpdate: '523 / 600',
    status: 'Active',
    capacity: 600,
    enrolled: 523,
    waitlist: 0,
  },
  {
    crn: '43482',
    courseId: 'CS-6340',
    name: 'Software Analysis & Test',
    aliases: courseAliases['CS-6340'] || [],
    instructor: 'Naik, Mayur',
    lastUpdate: '67 / 96',
    status: 'Active',
    capacity: 500,
    enrolled: 67,
    waitlist: 96,
  },
];

const semesters = [
  { value: 'spring-2026', label: 'Spring 2026' },
  { value: 'fall-2025', label: 'Fall 2025' },
  { value: 'summer-2025', label: 'Summer 2025' },
  { value: 'spring-2025', label: 'Spring 2025' },
];

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

  // Highest priority: Exact alias match
  if (section.aliases.some((a) => a.toLowerCase() === normalizedQuery)) {
    return 1000;
  }
  // High priority: Alias starts with query
  if (section.aliases.some((a) => a.toLowerCase().startsWith(normalizedQuery))) {
    return 900;
  }
  // High priority: Alias contains query
  if (section.aliases.some((a) => a.toLowerCase().includes(normalizedQuery))) {
    return 800;
  }
  // Medium priority: Course ID exact match
  if (section.courseId.toLowerCase() === normalizedQuery) {
    return 700;
  }
  // Medium priority: Course ID starts with query
  if (section.courseId.toLowerCase().startsWith(normalizedQuery)) {
    return 600;
  }
  // Medium priority: Course ID contains query
  if (section.courseId.toLowerCase().includes(normalizedQuery)) {
    return 500;
  }
  // Lower priority: Name contains query
  if (section.name.toLowerCase().includes(normalizedQuery)) {
    return 300;
  }
  // Lower priority: Instructor contains query
  if (section.instructor.toLowerCase().includes(normalizedQuery)) {
    return 200;
  }

  return 0; // No match
}

export default function AvailabilityContent() {
  const [activeSemester, setActiveSemester] = useState('spring-2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<CourseSection[]>(mockSections);

  useEffect(() => {
    // In production, fetch from OSCAR API based on semester
    setLoading(true);
    // Simulated API call
    setTimeout(() => {
      setSections(mockSections);
      setLoading(false);
    }, 500);
  }, [activeSemester]);

  // Filter and sort with alias priority
  const filteredAndSortedSections = sections
    .map((section) => ({
      section,
      score: getSearchScore(section, searchQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.section);

  // Calculate stats
  const totalEnrolled = sections.reduce((sum, s) => sum + s.enrolled, 0);
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const totalWaitlist = sections.reduce((sum, s) => sum + s.waitlist, 0);

  const getEnrollmentColor = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 0.9) return GT_COLORS.newHorizon;
    if (ratio >= 0.7) return GT_COLORS.buzzGold;
    return GT_COLORS.canopyLime;
  };

  const getEnrollmentBadgeColor = (enrolled: number, capacity: number) => {
    const ratio = enrolled / capacity;
    if (ratio >= 0.9) return 'red';
    if (ratio >= 0.7) return 'orange';
    return 'green';
  };

  const getSemesterLabel = () => {
    const semester = semesters.find(s => s.value === activeSemester);
    return semester?.label || 'Unknown';
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        pos="relative"
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box
          pos="absolute"
          top={-100}
          right={-100}
          w={300}
          h={300}
          style={{
            background: `radial-gradient(circle, ${GT_COLORS.techGold}15 0%, transparent 70%)`,
            borderRadius: '50%',
          }}
        />

        <Container size="lg" py="xl" pos="relative" style={{ zIndex: 1 }}>
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

          {/* Stats */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" maw={800} mx="auto">
            <StatCard
              icon={<IconSchool size={24} color="white" />}
              value={sections.length}
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
              value={totalWaitlist}
              label="On Waitlists"
              color="orange"
            />
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Filters */}
        <Paper p="md" radius="lg" withBorder mb="xl" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
          <Group gap="md" wrap="wrap">
            <Select
              value={activeSemester}
              onChange={(value) => setActiveSemester(value || 'spring-2026')}
              data={semesters}
              size="md"
              w={180}
              leftSection={<IconCalendar size={16} />}
              rightSection={<IconChevronDown size={14} />}
              styles={{
                input: {
                  fontWeight: 600,
                  backgroundColor: 'white',
                },
              }}
            />
            <TextInput
              placeholder="Search by alias (GIOS, ML), course ID, or instructor..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              size="md"
              style={{ flex: 1, minWidth: 300 }}
              styles={{
                input: {
                  backgroundColor: 'white',
                },
              }}
            />
          </Group>
        </Paper>

        {/* Results Header */}
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} size="h3">
              {getSemesterLabel()} Courses
            </Title>
            <Text size="sm" c="dimmed">
              Last updated at 8:35 AM from OSCAR
            </Text>
          </div>
          <Badge variant="light" color="gray" size="lg">
            {filteredAndSortedSections.length} courses
          </Badge>
        </Group>

        {/* Table */}
        <Paper radius="lg" withBorder style={{ overflow: 'hidden' }}>
          {loading ? (
            <Center h={300}>
              <Loader color={GT_COLORS.techGold} />
            </Center>
          ) : (
            <Table.ScrollContainer minWidth={800}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead style={{ backgroundColor: GT_COLORS.navy }}>
                  <Table.Tr>
                    <Table.Th style={{ color: 'white' }}>CRN</Table.Th>
                    <Table.Th style={{ color: 'white' }}>Course</Table.Th>
                    <Table.Th style={{ color: 'white' }}>Instructor</Table.Th>
                    <Table.Th style={{ color: 'white', textAlign: 'center' }}>Enrollment</Table.Th>
                    <Table.Th style={{ color: 'white', textAlign: 'center' }}>Waitlist</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredAndSortedSections.map((section) => (
                    <Table.Tr key={section.crn}>
                      <Table.Td>
                        <Badge variant="outline" size="sm" style={{ borderColor: GT_COLORS.grayMatter, color: GT_COLORS.grayMatter }}>
                          {section.crn}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={4}>
                          <Group gap="xs">
                            <Anchor
                              component={Link}
                              href={`/course/${section.courseId}`}
                              fw={600}
                              style={{ color: GT_COLORS.boldBlue }}
                            >
                              {section.courseId}
                            </Anchor>
                            {section.aliases.length > 0 && (
                              <Tooltip label="Common abbreviations for this course">
                                <Badge variant="light" size="xs" style={{ backgroundColor: `${GT_COLORS.olympicTeal}15`, color: GT_COLORS.olympicTeal }}>
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
                              {Math.round((section.enrolled / section.capacity) * 100)}%
                            </Text>
                          </Group>
                          <Progress
                            value={(section.enrolled / section.capacity) * 100}
                            size="sm"
                            radius="xl"
                            color={getEnrollmentBadgeColor(section.enrolled, section.capacity)}
                          />
                        </Stack>
                      </Table.Td>
                      <Table.Td ta="center">
                        {section.waitlist > 0 ? (
                          <Badge variant="filled" size="sm" style={{ backgroundColor: GT_COLORS.buzzGold, color: GT_COLORS.navy }}>
                            {section.waitlist}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">-</Text>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Paper>

        {/* Empty State */}
        {!loading && filteredAndSortedSections.length === 0 && (
          <Paper p="xl" radius="lg" withBorder ta="center">
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
      </Container>
    </>
  );
}
