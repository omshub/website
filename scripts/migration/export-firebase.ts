import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
// You'll need to download your service account key from Firebase Console
const serviceAccount = JSON.parse(
  fs.readFileSync('./service-account-key.json', 'utf-8')
) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

async function exportAuthUsers() {
  const exportDir = './export';
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  console.log('Starting Firebase Auth export...\n');

  // Export Firebase Auth users
  console.log('Exporting auth users...');
  const authUsers: object[] = [];
  let nextPageToken: string | undefined;

  do {
    const result = await getAuth().listUsers(1000, nextPageToken);
    authUsers.push(...result.users.map((u) => u.toJSON()));
    nextPageToken = result.pageToken;
    process.stdout.write(`  Fetched ${authUsers.length} auth users...\r`);
  } while (nextPageToken);

  fs.writeFileSync(
    path.join(exportDir, 'auth-users.json'),
    JSON.stringify(authUsers, null, 2)
  );
  console.log(`\n  Exported ${authUsers.length} auth users\n`);

  console.log('Auth export complete! File saved to ./export/auth-users.json');
  console.log('\nNext steps:');
  console.log('1. Download Firestore data from Firebase Console (Export to JSON)');
  console.log('2. Place the Firestore export in ./export/firestore-export.json');
  console.log('3. Run: pnpm run import:auth');
  console.log('4. Run: pnpm run import:data');
}

exportAuthUsers().catch(console.error);
