import { NextResponse } from 'next/server';
import { getCourseStats } from '@/lib/staticData';
import { publicApiJson } from '@/lib/cacheHeaders';

export async function GET() {
  try {
    const courseStats = await getCourseStats();
    return publicApiJson(courseStats);
  } catch (error) {
    console.error('Error fetching course stats:', error);
    return NextResponse.json({ error: 'Failed to fetch course stats' }, { status: 500 });
  }
}
