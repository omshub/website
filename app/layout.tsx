import React from 'react';
import { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ColorSchemeScript } from '@mantine/core';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import Providers from '@/components/providers/Providers';
import { inter } from './fonts';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://omshub.org'),
  title: {
    default: 'OMSHub - Georgia Tech OMS Course Reviews',
    template: '%s | OMSHub',
  },
  description:
    'Community-driven course reviews for Georgia Tech Online Master\'s programs. Read honest student reviews, ratings, and workload estimates for OMSCS, OMSA, and OMSCyber courses.',
  keywords: [
    'Georgia Tech',
    'OMSCS',
    'OMSA',
    'OMSCyber',
    'online masters',
    'course reviews',
    'computer science',
    'analytics',
    'cybersecurity',
    'GT OMS',
    'student reviews',
    'course ratings',
    'workload',
    'difficulty',
  ],
  authors: [{ name: 'OMSHub Community' }],
  creator: 'OMSHub',
  publisher: 'OMSHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://omshub.org',
    siteName: 'OMSHub',
    title: 'OMSHub - Georgia Tech OMS Course Reviews',
    description:
      'Community-driven course reviews for Georgia Tech Online Master\'s programs. Read honest student reviews for OMSCS, OMSA, and OMSCyber.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OMSHub - Georgia Tech OMS Course Reviews',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMSHub - Georgia Tech OMS Course Reviews',
    description:
      'Community-driven course reviews for Georgia Tech Online Master\'s programs.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: 'https://omshub.org',
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1b1e' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googleapis.com" />
        <ColorSchemeScript defaultColorScheme="auto" />
        {/* WCAG-compliant dimmed color override */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root, [data-mantine-color-scheme="light"] { --mantine-color-dimmed: #636c76 !important; }
          [data-mantine-color-scheme="dark"] { --mantine-color-dimmed: #a6a7ab !important; }
        `}} />

        {/* Schema.org Structured Data for SEO */}
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
