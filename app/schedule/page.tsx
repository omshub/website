import { Metadata } from 'next';
import ScheduleContent from './_components/ScheduleContent';

export const metadata: Metadata = {
  title: 'Course Schedule - OMSHub',
  description: 'View Georgia Tech OMS course schedule and enrollment data by semester',
};

export default function SchedulePage() {
  return <ScheduleContent />;
}
