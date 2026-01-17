import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('SUPABASE_URL is required for migration');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required for migration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface FirestoreExport {
  __collections__?: {
    usersData?: Record<string, { __collections__?: Record<string, unknown>; [key: string]: unknown }>;
    _reviewsDataFlat?: Record<string, Record<string, unknown>>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface Review {
  id: string;
  reviewerId?: string | null;
  courseId?: string;
  year?: number;
  semesterId?: string;
  body?: string;
  workload?: number;
  difficulty?: number;
  overall?: number;
  staffSupport?: number | null;
  isLegacy?: boolean;
  isGTVerifiedReviewer?: boolean;
  upvotes?: number;
  downvotes?: number;
  isRecommended?: boolean | null;
  isGoodFirstCourse?: boolean | null;
  isPairable?: boolean | null;
  hasGroupProjects?: boolean | null;
  hasWritingAssignments?: boolean | null;
  hasExamsQuizzes?: boolean | null;
  hasMandatoryReadings?: boolean | null;
  hasProgrammingAssignments?: boolean | null;
  hasProvidedDevEnv?: boolean | null;
  programmingLanguagesIds?: string[];
  preparation?: number | null;
  omsCoursesTaken?: number | null;
  hasRelevantWorkExperience?: boolean | null;
  experienceLevelId?: string | null;
  gradeId?: string | null;
  created?: number;
  modified?: number | null;
  reviewId?: string;
  [key: string]: unknown;
}

interface UserData {
  id: string;
  hasGTEmail?: boolean;
  educationLevelId?: string | null;
  subjectAreaId?: string | null;
  workYears?: number | null;
  specializationId?: string | null;
  [key: string]: unknown;
}

function loadFirestoreData(exportDir: string): { reviews: Review[]; users: UserData[] } {
  const firestoreExportPath = path.join(exportDir, 'firestore-export.json');

  // Check if we have a Firestore export file
  if (fs.existsSync(firestoreExportPath)) {
    console.log('  Loading from firestore-export.json...');
    const firestoreExport: FirestoreExport = JSON.parse(
      fs.readFileSync(firestoreExportPath, 'utf-8')
    );

    const reviews: Review[] = [];
    const users: UserData[] = [];

    // Extract reviews from _reviewsDataFlat collection
    const reviewsCollection = firestoreExport.__collections__?._reviewsDataFlat || firestoreExport._reviewsDataFlat;
    if (reviewsCollection && typeof reviewsCollection === 'object') {
      for (const [docId, docData] of Object.entries(reviewsCollection)) {
        if (docData && typeof docData === 'object') {
          reviews.push({ id: docId, ...docData } as Review);
        }
      }
    }

    // Extract users from usersData collection
    const usersCollection = firestoreExport.__collections__?.usersData || firestoreExport.usersData;
    if (usersCollection && typeof usersCollection === 'object') {
      for (const [docId, docData] of Object.entries(usersCollection)) {
        if (docData && typeof docData === 'object') {
          users.push({ id: docId, ...docData } as UserData);
        }
      }
    }

    console.log(`  Found ${reviews.length} reviews and ${users.length} users in Firestore export`);
    return { reviews, users };
  }

  // Fall back to individual files (legacy format)
  console.log('  Loading from individual JSON files...');

  const reviewsPath = path.join(exportDir, 'reviews.json');
  const usersPath = path.join(exportDir, 'users.json');

  const reviews: Review[] = fs.existsSync(reviewsPath)
    ? JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'))
    : [];

  const users: UserData[] = fs.existsSync(usersPath)
    ? JSON.parse(fs.readFileSync(usersPath, 'utf-8'))
    : [];

  console.log(`  Found ${reviews.length} reviews and ${users.length} users`);
  return { reviews, users };
}

async function importData() {
  const exportDir = './export';

  console.log('Starting Supabase data import...\n');

  // Load UID mapping from database (created by import:auth)
  console.log('Loading UID mapping from database...');
  const { data: mappings, error: mappingError } = await supabase
    .from('user_id_mapping')
    .select('firebase_uid, supabase_uid');

  if (mappingError) {
    console.error('Error loading UID mapping:', mappingError);
    console.error('Make sure you run import:auth first!');
    process.exit(1);
  }

  const uidMapping = new Map<string, string>();
  for (const mapping of mappings || []) {
    uidMapping.set(mapping.firebase_uid, mapping.supabase_uid);
  }
  console.log(`  Loaded ${uidMapping.size} UID mappings\n`);

  if (uidMapping.size === 0) {
    console.error('No UID mappings found. Run import:auth first!');
    process.exit(1);
  }

  // Load Firestore data
  console.log('Loading Firestore data...');
  const { reviews, users } = loadFirestoreData(exportDir);

  // 1. Import user profiles for ALL mapped auth users
  console.log('\nImporting user profiles...');

  // Create a map of Firebase user data for lookup
  const fbUserDataMap = new Map<string, UserData>();
  for (const user of users) {
    fbUserDataMap.set(user.id, user);
  }

  let userCount = 0;
  // Create a user profile for EVERY mapped auth user
  for (const [firebaseUid, supabaseUid] of uidMapping.entries()) {
    const fbUserData = fbUserDataMap.get(firebaseUid);
    const { error } = await supabase.from('users').upsert({
      id: supabaseUid,
      has_gt_email: fbUserData?.hasGTEmail ?? false,
      education_level: fbUserData?.educationLevelId ?? null,
      subject_area: fbUserData?.subjectAreaId ?? null,
      work_years: fbUserData?.workYears ?? null,
      specialization: fbUserData?.specializationId ?? null,
    });

    if (!error) userCount++;
  }
  console.log(`  Imported ${userCount} user profiles\n`);

  // 2. Import reviews
  console.log('Importing reviews...');

  let reviewCount = 0;
  let errorCount = 0;
  const batchSize = 100;

  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize);
    const reviewsToInsert = batch.map((review: Review) => {
      const mappedReviewerId = review.reviewerId
        ? uidMapping.get(review.reviewerId)
        : null;

      return {
        id: review.reviewId || review.id,
        course_id: review.courseId,
        reviewer_id: mappedReviewerId,
        year: review.year,
        semester: review.semesterId,
        body: review.body,
        workload: review.workload,
        difficulty: review.difficulty,
        overall: review.overall,
        staff_support: review.staffSupport ?? null,
        is_legacy: review.isLegacy ?? false,
        is_gt_verified: review.isGTVerifiedReviewer ?? false,
        upvotes: review.upvotes ?? 0,
        downvotes: review.downvotes ?? 0,
        is_recommended: review.isRecommended ?? null,
        is_good_first_course: review.isGoodFirstCourse ?? null,
        is_pairable: review.isPairable ?? null,
        has_group_projects: review.hasGroupProjects ?? null,
        has_writing_assignments: review.hasWritingAssignments ?? null,
        has_exams_quizzes: review.hasExamsQuizzes ?? null,
        has_mandatory_readings: review.hasMandatoryReadings ?? null,
        has_programming_assignments: review.hasProgrammingAssignments ?? null,
        has_provided_dev_env: review.hasProvidedDevEnv ?? null,
        programming_languages: review.programmingLanguagesIds ?? [],
        preparation: review.preparation ?? null,
        oms_courses_taken: review.omsCoursesTaken ?? null,
        has_relevant_work_experience: review.hasRelevantWorkExperience ?? null,
        experience_level: review.experienceLevelId ?? null,
        grade: review.gradeId ?? null,
        created_at: review.created
          ? new Date(review.created).toISOString()
          : new Date().toISOString(),
        modified_at: review.modified
          ? new Date(review.modified).toISOString()
          : null,
      };
    });

    const { error } = await supabase.from('reviews').upsert(reviewsToInsert);

    if (!error) {
      reviewCount += batch.length;
    } else {
      errorCount += batch.length;
      console.error(`  Error importing batch at ${i}:`, error);
    }

    process.stdout.write(`  Processed ${Math.min(i + batchSize, reviews.length)}/${reviews.length} reviews\r`);
  }
  console.log(`\n  Imported ${reviewCount} reviews (${errorCount} errors)\n`);

  // 3. Verify counts
  console.log('Verifying import...');
  const { count: reviewDbCount } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true });
  const { count: userDbCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  console.log(`  Reviews: ${reviewDbCount}`);
  console.log(`  Users: ${userDbCount}`);

  console.log('\nData import complete!');
}

importData().catch(console.error);
