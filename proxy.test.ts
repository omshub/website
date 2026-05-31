import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('proxy matcher', () => {
  const source = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8');

  it('does not run Supabase session proxy for public browsing paths', () => {
    expect(source).toContain("'/api/user/:path*'");
    expect(source).toContain("'/user/:path*'");
    expect(source).not.toContain("'/((?!");
  });
});
