-- ============================================
-- OMSHUB SUPABASE SCHEMA
-- Migration: 001_initial_schema
-- ============================================
--
-- This schema contains:
-- - users: User profiles (synced with Supabase Auth)
-- - reviews: Course reviews (course data comes from static GitHub repo)
-- - user_id_mapping: Firebase to Supabase user ID mapping (for migration)
--
-- NOTE: Course data is NOT stored in Supabase. It comes from:
-- https://raw.githubusercontent.com/omshub/data/main/static/courses.json
-- ============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_gt_email BOOLEAN DEFAULT FALSE,
  education_level TEXT CHECK (education_level IN ('bach', 'mast', 'phd') OR education_level IS NULL),
  subject_area TEXT,
  work_years INTEGER,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
-- NOTE: course_id references static course data, not a database table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  year INTEGER NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('sp', 'sm', 'fa')),
  body TEXT,
  workload NUMERIC,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  overall INTEGER CHECK (overall BETWEEN 1 AND 5),
  staff_support INTEGER CHECK (staff_support BETWEEN 1 AND 5),
  is_legacy BOOLEAN DEFAULT FALSE,
  is_gt_verified BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  -- Course logistics
  is_recommended BOOLEAN,
  is_good_first_course BOOLEAN,
  is_pairable BOOLEAN,
  has_group_projects BOOLEAN,
  has_writing_assignments BOOLEAN,
  has_exams_quizzes BOOLEAN,
  has_mandatory_readings BOOLEAN,
  has_programming_assignments BOOLEAN,
  has_provided_dev_env BOOLEAN,
  programming_languages TEXT[] DEFAULT '{}',
  -- User background
  preparation INTEGER CHECK (preparation BETWEEN 1 AND 5),
  oms_courses_taken INTEGER,
  has_relevant_work_experience BOOLEAN,
  experience_level TEXT CHECK (experience_level IN ('jr', 'mid', 'sr') OR experience_level IS NULL),
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ
);

-- User ID mapping table (for Firebase -> Supabase migration)
CREATE TABLE IF NOT EXISTS user_id_mapping (
  firebase_uid TEXT PRIMARY KEY,
  supabase_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_course_id ON reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_course_year_sem ON reviews(course_id, year, semester);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_mapping_supabase ON user_id_mapping(supabase_uid);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Trigger function to auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, has_gt_email)
  VALUES (
    NEW.id,
    NEW.email LIKE '%@gatech.edu'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_id_mapping ENABLE ROW LEVEL SECURITY;

-- Reviews: Public read
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Reviews: Users can create their own
CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Reviews: Users can update their own
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Reviews: Users can delete their own
CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Users: Can read own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users: Can insert own profile (for migration)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users: Can update own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- User ID mapping: Service role only (no public access)
CREATE POLICY "User ID mapping is service role only"
  ON user_id_mapping FOR ALL
  USING (false);
