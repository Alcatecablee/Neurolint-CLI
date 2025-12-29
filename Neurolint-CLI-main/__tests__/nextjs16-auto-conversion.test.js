/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const NextJS16Migrator = require('../scripts/migrate-nextjs-16.js');
const fs = require('fs').promises;
const path = require('path');

describe('Next.js 16 Auto-Conversion Features', () => {
  let migrator;
  let testDir;

  beforeEach(async () => {
    migrator = new NextJS16Migrator({ verbose: false, dryRun: false });
    testDir = path.join(__dirname, 'fixtures', 'nextjs16-auto');
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Auto-add "use cache" directive', () => {
    test('should add use cache to components with fetch', async () => {
      const componentContent = `
export default async function Page() {
  const data = await fetch('/api/data');
  const json = await data.json();
  return <div>{json.title}</div>;
}`;
      
      const componentPath = path.join(testDir, 'page.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain("'use cache'");
    });

    test('should add use cache to components with database access', async () => {
      const componentContent = `
import { db } from './db';

export default async function UserList() {
  const users = await db.user.findMany();
  return <div>{users.map(u => <div key={u.id}>{u.name}</div>)}</div>;
}`;
      
      const componentPath = path.join(testDir, 'users.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain("'use cache'");
    });

    test('should add use cache to components with prisma', async () => {
      const componentContent = `
import { prisma } from '@/lib/prisma';

export default async function Posts() {
  const posts = await prisma.post.findMany();
  return <div>{posts.length} posts</div>;
}`;
      
      const componentPath = path.join(testDir, 'posts.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain("'use cache'");
    });

    test('should not add use cache to client components', async () => {
      const componentContent = `
'use client';

export default async function ClientComponent() {
  const data = await fetch('/api/data');
  return <div>Client</div>;
}`;
      
      const componentPath = path.join(testDir, 'client.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      const useCacheCount = (newContent.match(/'use cache'/g) || []).length;
      expect(useCacheCount).toBe(0);
    });

    test('should not duplicate use cache directive', async () => {
      const componentContent = `
'use cache';

export default async function Page() {
  const data = await fetch('/api/data');
  return <div>{data}</div>;
}`;
      
      const componentPath = path.join(testDir, 'cached.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      const useCacheCount = (newContent.match(/'use cache'/g) || []).length;
      expect(useCacheCount).toBe(1);
    });

    test('should place use cache after imports', async () => {
      const componentContent = `
import { db } from './db';
import { User } from './types';

export default async function Page() {
  const users = await db.query();
  return <div>Users</div>;
}`;
      
      const componentPath = path.join(testDir, 'imports.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      const importIndex = newContent.lastIndexOf('import');
      const useCacheIndex = newContent.indexOf("'use cache'");
      expect(useCacheIndex).toBeGreaterThan(importIndex);
    });
  });

  describe('Auto-convert sync params to async', () => {
    test('should convert { params } to async with await props.params', async () => {
      const pageContent = `
export default function Page({ params }) {
  const { slug } = params;
  return <div>{slug}</div>;
}`;
      
      const pagePath = path.join(testDir, 'page.tsx');
      await fs.writeFile(pagePath, pageContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(pagePath, 'utf8');
      expect(newContent).toContain('async function Page(props)');
      expect(newContent).toContain('await props.params');
    });

    test('should convert params with searchParams', async () => {
      const pageContent = `
export default function Page({ params, searchParams }) {
  const { id } = params;
  const { query } = searchParams;
  return <div>{id} - {query}</div>;
}`;
      
      const pagePath = path.join(testDir, 'search.tsx');
      await fs.writeFile(pagePath, pageContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(pagePath, 'utf8');
      expect(newContent).toContain('async function Page(props)');
      expect(newContent).toContain('await props.params');
      expect(newContent).toContain('await props.searchParams');
    });

    test('should preserve component name when converting', async () => {
      const pageContent = `
export default function ProductPage({ params }) {
  const { productId } = params;
  return <div>Product: {productId}</div>;
}`;
      
      const pagePath = path.join(testDir, 'product.tsx');
      await fs.writeFile(pagePath, pageContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(pagePath, 'utf8');
      expect(newContent).toContain('async function ProductPage(props)');
    });

    test('should handle nested destructuring', async () => {
      const pageContent = `
export default function Page({ params }) {
  const { userId, postId } = params;
  return <div>{userId}/{postId}</div>;
}`;
      
      const pagePath = path.join(testDir, 'nested.tsx');
      await fs.writeFile(pagePath, pageContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(pagePath, 'utf8');
      expect(newContent).toContain('await props.params');
      expect(newContent).toContain('userId, postId');
    });
  });

  describe('Auto-await cookies() and headers()', () => {
    test('should add await to cookies() calls', async () => {
      const routeContent = `
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  return Response.json({ token });
}`;
      
      const routePath = path.join(testDir, 'route.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('await cookies()');
    });

    test('should add await to headers() calls', async () => {
      const routeContent = `
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const userAgent = headersList.get('user-agent');
  return Response.json({ userAgent });
}`;
      
      const routePath = path.join(testDir, 'headers-route.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('await headers()');
    });

    test('should not duplicate await for cookies()', async () => {
      const routeContent = `
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'already-await.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      const awaitCount = (newContent.match(/await cookies\(\)/g) || []).length;
      expect(awaitCount).toBe(1);
    });

    test('should handle both cookies and headers in same file', async () => {
      const routeContent = `
import { cookies, headers } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const headersList = headers();
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'both.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('await cookies()');
      expect(newContent).toContain('await headers()');
    });

    test('should ensure function is async when adding await', async () => {
      const componentContent = `
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  return <div>Page</div>;
}`;
      
      const componentPath = path.join(testDir, 'sync-page.tsx');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain('async function Page()');
    });
  });

  describe('Smart cacheLife guidance', () => {
    test('should add cacheLife comment for revalidateTag usage', async () => {
      const routeContent = `
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('products');
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'revalidate.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('cacheLife');
      expect(newContent).toContain("'use cache'");
    });

    test('should not modify revalidateTag signature', async () => {
      const routeContent = `
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('users');
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'tag.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      // Ensure revalidateTag still takes single string argument
      expect(newContent).toContain("revalidateTag('users')");
      expect(newContent).not.toContain("revalidateTag('users', cacheLife");
    });

    test('should provide example of cacheLife usage', async () => {
      const routeContent = `
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('data');
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'example.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain("cacheLife('hours')");
      expect(newContent).toContain('export const revalidate');
    });

    test('should not duplicate cacheLife comments', async () => {
      const routeContent = `
// Consider using cacheLife() in your cache configuration
import { revalidateTag } from 'next/cache';

export async function POST() {
  revalidateTag('data');
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'no-dup.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      const cacheLifeCount = (newContent.match(/Consider using cacheLife/g) || []).length;
      expect(cacheLifeCount).toBe(1);
    });
  });

  describe('updateTag detection', () => {
    test('should suggest updateTag for read-your-writes patterns', async () => {
      const routeContent = `
export async function POST() {
  const data = await fetch('/api/data', { method: 'POST', body: JSON.stringify({}) });
  // Manual cache invalidation
  invalidateCache();
  return Response.json(data);
}`;
      
      const routePath = path.join(testDir, 'mutation.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('updateTag');
    });

    test('should detect manual invalidation patterns', async () => {
      const routeContent = `
export async function POST() {
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
  // Refresh cache manually
  refreshCache();
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'refresh.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain('updateTag');
    });

    test('should include import suggestion for updateTag', async () => {
      const routeContent = `
export async function POST() {
  const data = await fetch('/api/data', { method: 'POST' });
  mutateCache();
  return Response.json(data);
}`;
      
      const routePath = path.join(testDir, 'import.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain("import { updateTag } from 'next/cache'");
    });

    test('should suggest tag name based on filename', async () => {
      const routeContent = `
export async function POST() {
  await fetch('/api/products', { method: 'POST' });
  invalidateCache();
  return Response.json({ ok: true });
}`;
      
      const routePath = path.join(testDir, 'products-route.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).toContain("updateTag('products-route')");
    });

    test('should not suggest updateTag when not needed', async () => {
      const routeContent = `
export async function GET() {
  const data = await fetch('/api/data');
  return Response.json(data);
}`;
      
      const routePath = path.join(testDir, 'simple-get.ts');
      await fs.writeFile(routePath, routeContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(routePath, 'utf8');
      expect(newContent).not.toContain('updateTag');
    });
  });

  describe('unstable_cache migration', () => {
    test('should mark unstable_cache for migration', async () => {
      const componentContent = `
import { unstable_cache } from 'next/cache';

const getData = unstable_cache(
  async () => {
    return fetch('/api/data');
  },
  ['data']
);`;
      
      const componentPath = path.join(testDir, 'unstable.ts');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain('MIGRATED');
      expect(newContent).toContain('use cache');
    });

    test('should preserve unstable_cache functionality while marking', async () => {
      const componentContent = `
import { unstable_cache } from 'next/cache';

export const getUsers = unstable_cache(
  async () => db.users.findMany(),
  ['users'],
  { revalidate: 3600 }
);`;
      
      const componentPath = path.join(testDir, 'cache.ts');
      await fs.writeFile(componentPath, componentContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(componentPath, 'utf8');
      expect(newContent).toContain('unstable_cache');
      expect(newContent).toContain('MIGRATED');
    });
  });

  describe('Complete auto-conversion workflow', () => {
    test('should apply all conversions to a complex file', async () => {
      const pageContent = `
import { cookies } from 'next/headers';

export default function UserPage({ params }) {
  const cookieStore = cookies();
  const { userId } = params;
  const data = fetch(\`/api/users/\${userId}\`);
  
  return <div>{data.name}</div>;
}`;
      
      const pagePath = path.join(testDir, 'complex.tsx');
      await fs.writeFile(pagePath, pageContent);

      await migrator.migrate(testDir);

      const newContent = await fs.readFile(pagePath, 'utf8');
      
      // Should be async
      expect(newContent).toContain('async function UserPage(props)');
      
      // Should await cookies
      expect(newContent).toContain('await cookies()');
      
      // Should convert params
      expect(newContent).toContain('await props.params');
    });

    test('should track all changes made', async () => {
      const appDir = path.join(testDir, 'app');
      await fs.mkdir(appDir, { recursive: true });
      
      await fs.writeFile(
        path.join(appDir, 'page.tsx'),
        `export default function Page({ params }) { const { id } = params; return <div>{id}</div>; }`
      );
      
      await fs.writeFile(
        path.join(testDir, 'middleware.ts'),
        `export function middleware(req) { return NextResponse.next(); }`
      );

      const result = await migrator.migrate(testDir);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.summary.total).toBeGreaterThan(0);
    });

    test('should handle errors gracefully', async () => {
      const invalidPath = path.join(testDir, 'invalid', 'nested', 'file.tsx');
      
      // Don't create the directory structure - test error handling
      const result = await migrator.migrate(invalidPath);

      // Should not throw, but handle gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Change tracking', () => {
    test('should record caching API migration changes', async () => {
      const componentContent = `
import { unstable_cache } from 'next/cache';

export const getData = unstable_cache(async () => fetch('/api/data'), ['data']);`;
      
      const componentPath = path.join(testDir, 'api.ts');
      await fs.writeFile(componentPath, componentContent);

      const result = await migrator.migrate(testDir);

      expect(result.changes).toContainEqual(
        expect.objectContaining({
          type: 'caching_api_migration',
          description: expect.stringContaining('caching APIs')
        })
      );
    });

    test('should record async API update changes', async () => {
      const pageContent = `
export default function Page({ params }) {
  const { slug } = params;
  return <div>{slug}</div>;
}`;
      
      const pagePath = path.join(testDir, 'slug.tsx');
      await fs.writeFile(pagePath, pageContent);

      const result = await migrator.migrate(testDir);

      expect(result.changes).toContainEqual(
        expect.objectContaining({
          type: 'async_api_update',
          description: expect.stringContaining('async APIs')
        })
      );
    });
  });
});
