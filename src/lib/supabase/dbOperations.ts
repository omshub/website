import { createClient } from './server';
import type { Database } from './database.types';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];
type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

// ============================================
// REVIEWS
// ============================================

/**
 * Get reviews for a course, optionally filtered by year and semester
 */
export async function getReviews(
  courseId: string,
  year?: number,
  semester?: string
): Promise<Review[]> {
  const supabase = await createClient();
  let query = supabase
    .from('reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (year) query = query.eq('year', year);
  if (semester) query = query.eq('semester', semester);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Get all reviews for a course (all years/semesters)
 */
export async function getAllCourseReviews(courseId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all course reviews:', error);
    throw error;
  }

  return data ?? [];
}

type ReviewsCountsByYearSem = {
  [year: number]: { [semesterTerm: number]: number };
};

/**
 * Get review counts grouped by year and semester for a course
 * Converts Supabase semester format (sp, sm, fa) to semester term (1, 2, 3)
 */
export async function getReviewsCountsByYearSem(
  courseId: string
): Promise<ReviewsCountsByYearSem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('year, semester')
    .eq('course_id', courseId);

  if (error) {
    console.error('Error fetching review counts:', error);
    throw error;
  }

  const semesterToTerm: Record<string, number> = {
    sp: 1,
    sm: 2,
    fa: 3,
  };

  const counts: ReviewsCountsByYearSem = {};
  const reviewData = data as Array<{ year: number; semester: string }> | null;
  (reviewData ?? []).forEach((review) => {
    const year = review.year;
    const semesterTerm = semesterToTerm[review.semester] ?? 1;

    if (!counts[year]) {
      counts[year] = {};
    }
    if (!counts[year][semesterTerm]) {
      counts[year][semesterTerm] = 0;
    }
    counts[year][semesterTerm]++;
  });

  return counts;
}

/**
 * Get recent reviews across all courses, sorted by newest first
 * @param limit Maximum number of reviews to return (default 100)
 */
export async function getReviewsRecent(limit: number = 100): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent reviews:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Get recent reviews for a specific course
 */
export async function getRecentReviewsForCourse(courseId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching recent reviews for course:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Get a single review by ID
 */
export async function getReview(reviewId: string): Promise<Review | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching review:', error);
    throw error;
  }

  return data;
}

/**
 * Add a new review
 */
export async function addReview(review: ReviewInsert): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();

  if (error) {
    console.error('Error adding review:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing review
 */
export async function updateReview(
  reviewId: string,
  reviewData: ReviewUpdate
): Promise<Review> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .update({ ...reviewData, modified_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('Error updating review:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// ============================================
// USERS
// ============================================

/**
 * Get user by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching user:', error);
    throw error;
  }

  return data;
}

/**
 * Get user's reviews
 */
export async function getUserReviews(userId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }

  return data ?? [];
}

/**
 * Create a new user (usually handled by trigger, but available for migration)
 */
export async function addUser(user: UserInsert): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }

  return data;
}

/**
 * Update user profile
 */
export async function editUser(
  userId: string,
  userData: UserUpdate
): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return data;
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

