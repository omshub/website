'use client';

import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Box,
  Badge,
  Stack,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCode,
  IconUsers,
  IconShield,
  IconHeart,
} from '@tabler/icons-react';
import { GT_COLORS } from '@/lib/theme';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <Paper p="xl" radius="lg" withBorder>
      <ThemeIcon size="xl" radius="md" variant="light" color={color} mb="md">
        {icon}
      </ThemeIcon>
      <Text size="lg" fw={600} mb="xs">
        {title}
      </Text>
      <Text size="sm" c="grayMatter">
        {description}
      </Text>
    </Paper>
  );
}

const features = [
  {
    icon: <IconCode size={24} stroke={1.5} />,
    title: 'Open Source',
    description:
      'Fully open-source project built by the community, for the community. Contribute code, report issues, or suggest features on GitHub.',
    color: 'blue',
  },
  {
    icon: <IconUsers size={24} stroke={1.5} />,
    title: 'Community Driven',
    description:
      'Reviews from real students who have completed the courses. Get authentic insights from your peers to make informed decisions.',
    color: 'teal',
  },
  {
    icon: <IconShield size={24} stroke={1.5} />,
    title: 'Privacy First',
    description:
      'You own your data. This is a strictly non-profit venture. Your contributions help the community, not corporate interests.',
    color: 'violet',
  },
  {
    icon: <IconHeart size={24} stroke={1.5} />,
    title: 'Free Forever',
    description:
      'No ads, no paywalls, no corporate sponsors. This site runs entirely on volunteer effort and will always be free to use.',
    color: 'red',
  },
];

export default function AboutPage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        py="xl"
        style={{
          background: `linear-gradient(135deg, ${GT_COLORS.navy} 0%, #001a30 100%)`,
          borderBottom: `3px solid ${GT_COLORS.techGold}`,
        }}
      >
        <Container size="lg">
          <Stack align="center" gap="md">
            <Badge
              size="lg"
              variant="gradient"
              gradient={{ from: GT_COLORS.techGold, to: GT_COLORS.buzzGold }}
            >
              By Students, For Students
            </Badge>
            <Title order={1} c="white" ta="center" fw={700}>
              About OMSHub
            </Title>
            <Text c="white" ta="center" size="lg" style={{ opacity: 0.9 }} maw={600}>
              Helping Georgia Tech OMS students make informed course selections through community-driven reviews and insights.
            </Text>
          </Stack>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        {/* Feature Cards - 2x2 Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="xl">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </SimpleGrid>

        {/* Mission Section */}
        <Paper p="xl" radius="lg" withBorder>
          <Title order={2} size="h3" fw={600} mb="md">
            Our Mission
          </Title>
          <Text size="md" c="grayMatter">
            The goal of OMSHub is to facilitate current and prospective Georgia Tech OMSx students with effective determination of their course selections, guided by the advice and wisdom of their peers. We believe in transparency, community ownership, and the power of shared knowledge.
          </Text>
        </Paper>
      </Container>
    </Box>
  );
}
