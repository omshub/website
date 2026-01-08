import type { StorybookConfig } from '@storybook/nextjs-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-docs'
  ],

  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },

  viteFinal: async (config) => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        preserveSymlinks: false,
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include || []),
          '@mui/icons-material',
          '@mui/material',
        ],
      },
    };
  },
};
export default config;
