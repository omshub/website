import React from 'react';
import Script from 'next/script';
import { Metadata, Viewport } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MicrosoftClarity from '@/components/analytics/MicrosoftClarity';
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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMSHub - Georgia Tech OMS Course Reviews',
    description:
      'Community-driven course reviews for Georgia Tech Online Master\'s programs.',
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
        {/* Preload LCP image for home page */}
        <link rel="preload" as="image" type="image/webp" href="/gt_quad.webp" fetchPriority="high" />
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
        {/* Microsoft Clarity - beforeInteractive for session recording */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <MicrosoftClarity projectId={process.env.NEXT_PUBLIC_CLARITY_ID} />
        )}
        <Providers>{children}</Providers>
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
