/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,

  // Allow Clarity bot to access assets for session replay
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,

  env: {
    baseUrl: process.env.BASE_URL,
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 31536000, // 1 year cache
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/spotlight',
      '@mantine/notifications',
      '@tabler/icons-react',
      '@supabase/supabase-js',
    ],
    // Inline CSS into HTML for better Clarity session replay support
    inlineCss: true,
  },

  // Reduce unused JavaScript with tree shaking
  modularizeImports: {
    '@tabler/icons-react': {
      transform: '@tabler/icons-react/dist/esm/icons/{{member}}',
    },
  },
};
