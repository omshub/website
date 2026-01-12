import type { Preview } from '@storybook/react';
import React from 'react';
import {
  AppRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'yellow',
  colors: {
    gtGold: [
      '#FFF8E1',
      '#FFECB3',
      '#FFE082',
      '#FFD54F',
      '#FFCA28',
      '#B3A369',
      '#A69A5E',
      '#998F54',
      '#8C8449',
      '#003057',
    ],
    gtNavy: [
      '#E3F2FD',
      '#BBDEFB',
      '#90CAF9',
      '#64B5F6',
      '#42A5F5',
      '#003057',
      '#002D52',
      '#00254D',
      '#001D48',
      '#001543',
    ],
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  defaultRadius: 'md',
});

const mockRouter: AppRouterInstance = {
  push: () => Promise.resolve(true),
  replace: () => Promise.resolve(true),
  prefetch: () => Promise.resolve(),
  back: () => {},
  forward: () => {},
  refresh: () => {},
};

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <AppRouterContext.Provider value={mockRouter}>
          <Story />
        </AppRouterContext.Provider>
      </MantineProvider>
    ),
  ],
};

export default preview;
