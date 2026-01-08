import React from 'react';
import { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'OMSHub',
  description: "Georgia Tech's Online Master's Course Catalog",
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <InitColorSchemeScript
          attribute="data-omshub-color-scheme"
          modeStorageKey="omshub-mode"
        />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
