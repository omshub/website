import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | OMSHub',
  description:
    'Learn about OMSHub - a community-driven platform for Georgia Tech OMS course reviews. Open source, privacy-first, and non-profit.',
  openGraph: {
    title: 'About | OMSHub',
    description:
      'Learn about OMSHub - a community-driven platform for Georgia Tech OMS course reviews.',
    type: 'website',
    siteName: 'OMSHub',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
