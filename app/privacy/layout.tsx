import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | OMSHub',
  description:
    'OMSHub privacy policy - how we handle your data with transparency and respect for your privacy.',
  openGraph: {
    title: 'Privacy Policy | OMSHub',
    description:
      'OMSHub privacy policy - how we handle your data with transparency and respect for your privacy.',
    type: 'website',
    siteName: 'OMSHub',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
