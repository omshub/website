import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reviews/recent?limit=20&offset=0&search=keyword
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const search = searchParams.get('search')?.trim() || '';

  try {
    const supabase = await createClient();

    // Build query with optional search
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    let countQuery = supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true });

    // Add search filter if provided
    if (search) {
      query = query.ilike('body', `%${search}%`);
      countQuery = countQuery.ilike('body', `%${search}%`);
    }

    const { data: reviews, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching recent reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Get total count for pagination info
    const { count } = await countQuery;

    return NextResponse.json({
      reviews: reviews || [],
      pagination: {
        offset,
        limit,
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/reviews/recent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
