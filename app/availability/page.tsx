import { Metadata } from 'next';
import AvailabilityContent from './AvailabilityContent';

export const metadata: Metadata = {
  title: 'Course Schedule - OMSHub',
  description: 'View Georgia Tech OMS course schedule and enrollment data by semester',
};

export default function AvailabilityPage() {
  return <AvailabilityContent />;
}
