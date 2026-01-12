'use client';

import { Box, Button, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { spotlight } from '@mantine/spotlight';
import { GT_COLORS } from '@/lib/theme';

export default function SearchButton() {
  return (
    <Box ta="center">
      <Button
        size="lg"
        leftSection={<IconSearch size={18} />}
        onClick={() => spotlight.open()}
        radius="md"
        style={{
          backgroundColor: GT_COLORS.techGold,
          color: GT_COLORS.navy,
        }}
      >
        Search Courses
      </Button>
      <Text size="xs" c="white" mt="xs" style={{ opacity: 0.7 }}>
        Press <kbd style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: 4 }}>Ctrl+K</kbd> to search
      </Text>
    </Box>
  );
}
