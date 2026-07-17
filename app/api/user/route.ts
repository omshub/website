import { uncachedApiJson } from '@/lib/cacheHeaders';
import { getAuthenticatedClaims } from '@/lib/supabase/auth';
import { createClient } from '@/lib/supabase/server';

const USER_PROFILE_COLUMNS =
  'id,has_gt_email,education_level,subject_area,work_years,specialization';

export async function GET() {
  const supabase = await createClient();
  const auth = await getAuthenticatedClaims(supabase);

  if (!auth) {
    return uncachedApiJson({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(USER_PROFILE_COLUMNS)
      .eq('id', auth.userId)
      .maybeSingle();

    if (error) throw error;
    if (!user) {
      return uncachedApiJson({ userId: null, hasGTEmail: false, reviews: {} });
    }

    return uncachedApiJson({
      userId: user.id,
      hasGTEmail: user.has_gt_email,
      educationLevelId: user.education_level,
      subjectAreaId: user.subject_area,
      workYears: user.work_years,
      specializationId: user.specialization,
      reviews: {},
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return uncachedApiJson({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST() {
  const supabase = await createClient();
  const auth = await getAuthenticatedClaims(supabase);

  if (!auth) {
    return uncachedApiJson({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const hasGTEmail = auth.email?.endsWith('@gatech.edu') ?? false;
    const { data: user, error } = await supabase
      .from('users')
      .upsert(
        { id: auth.userId, has_gt_email: hasGTEmail },
        { onConflict: 'id' }
      )
      .select('id,has_gt_email')
      .single();

    if (error) throw error;

    return uncachedApiJson({
      userId: user.id,
      hasGTEmail: user.has_gt_email,
      reviews: {},
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return uncachedApiJson({ error: 'Failed to create user' }, { status: 500 });
  }
}
