'use client';

import Link from 'next/link';
import { Breadcrumbs as MantineBreadcrumbs, Anchor, Text, Container, Box } from '@mantine/core';
import { IconChevronRight, IconHome } from '@tabler/icons-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

export default function Breadcrumbs({ items, showHome = true }: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  return (
    <Box
      py="sm"
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Container size="xl">
        <MantineBreadcrumbs
          separator={<IconChevronRight size={14} color="var(--mantine-color-gray-5)" />}
        >
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const isHome = index === 0 && showHome;

            if (isLast) {
              return (
                <Text key={item.label} size="sm" c="grayMatter" fw={500}>
                  {item.label}
                </Text>
              );
            }

            return (
              <Anchor
                key={item.label}
                component={Link}
                href={item.href || '/'}
                size="sm"
                c="boldBlue"
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {isHome && <IconHome size={14} />}
                {item.label}
              </Anchor>
            );
          })}
        </MantineBreadcrumbs>
      </Container>
    </Box>
  );
}
