import { NextResponse } from 'next/server';
import { getCourseStats } from '@/lib/staticData';

export async function GET() {
  try {
    const courseStats = await getCourseStats();
    return NextResponse.json(courseStats);
  } catch (error) {
    console.error('Error fetching course stats:', error);
    return NextResponse.json({ error: 'Failed to fetch course stats' }, { status: 500 });
  }
}
