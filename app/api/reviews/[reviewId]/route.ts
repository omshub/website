'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedClaims } from '@/lib/supabase/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  courseReviewsCacheTag,
  RECENT_REVIEWS_CACHE_TAG,
} from '@/lib/supabase/publicReviews';

function invalidateReviewCaches(courseId: string) {
  revalidateTag(courseReviewsCacheTag(courseId), 'max');
  revalidateTag(RECENT_REVIEWS_CACHE_TAG, 'max');
  revalidatePath(`/course/${courseId}`);
  revalidatePath('/recents');
}

// DELETE /api/reviews/[reviewId]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await context.params;
    const supabase = await createClient();

    const auth = await getAuthenticatedClaims(supabase);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the review belongs to the user
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('reviewer_id, course_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.reviewer_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    invalidateReviewCaches(review.course_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/reviews/[reviewId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/reviews/[reviewId]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await context.params;
    const body = await request.json();
    const supabase = await createClient();

    const auth = await getAuthenticatedClaims(supabase);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if the review belongs to the user
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('reviewer_id, course_id')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (existingReview.reviewer_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the review
    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        body: body.body,
        workload: body.workload,
        difficulty: body.difficulty,
        overall: body.overall,
        modified_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    invalidateReviewCaches(existingReview.course_id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/reviews/[reviewId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
