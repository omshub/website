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

async function importAuth() {
  const exportDir = './export';

  console.log('Starting Supabase auth import...\n');

  // Import auth users and create mapping
  console.log('Importing auth users...');
  const authUsers = JSON.parse(
    fs.readFileSync(path.join(exportDir, 'auth-users.json'), 'utf-8')
  );

  const uidMapping = new Map<string, string>();

  for (const fbUser of authUsers) {
    try {
      // First try to create the user
      const { data, error } = await supabase.auth.admin.createUser({
        email: fbUser.email,
        email_confirm: fbUser.emailVerified ?? false,
        user_metadata: {
          firebase_uid: fbUser.uid,
          display_name: fbUser.displayName,
        },
      });

      if (data.user) {
        uidMapping.set(fbUser.uid, data.user.id);
        await supabase.from('user_id_mapping').upsert({
          firebase_uid: fbUser.uid,
          supabase_uid: data.user.id,
        });
      } else if (error?.message?.includes('already been registered')) {
        // User exists, look them up by email
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === fbUser.email);
        if (existingUser) {
          uidMapping.set(fbUser.uid, existingUser.id);
          await supabase.from('user_id_mapping').upsert({
            firebase_uid: fbUser.uid,
            supabase_uid: existingUser.id,
          });
        }
      } else if (error) {
        console.error(`  Error creating user ${fbUser.email}:`, error.message);
      }
    } catch (e) {
      console.error(`  Error processing user ${fbUser.email}:`, e);
    }
    process.stdout.write(`  Processed ${uidMapping.size}/${authUsers.length} users\r`);
  }
  console.log(`\n  Imported/mapped ${uidMapping.size} auth users\n`);

  // Verify counts
  console.log('Verifying auth import...');
  const { count: mappingCount } = await supabase
    .from('user_id_mapping')
    .select('*', { count: 'exact', head: true });

  console.log(`  User ID mappings: ${mappingCount}`);

  console.log('\nAuth import complete!');
}

importAuth().catch(console.error);
