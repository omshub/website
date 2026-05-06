import { Metadata } from 'next';
import LazyScheduleContent from './_components/LazyScheduleContent';

export const metadata: Metadata = {
  title: 'Course Schedule - OMSHub',
  description: 'View Georgia Tech OMS course schedule and enrollment data by semester',
};

export default function SchedulePage() {
  return <LazyScheduleContent />;
}
