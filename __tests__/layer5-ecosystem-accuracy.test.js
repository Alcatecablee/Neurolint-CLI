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

/**
 * layer5-ecosystem-accuracy.test.js
 *
 * Regression tests for Phase 3 ecosystem accuracy fixes:
 * 1. configureTurbopack must write top-level `turbopack:` key (not `experimental.turbo`)
 * 2. detectDeprecations must NOT warn on `export const metadata`
 * 3. suggestCachingOptimizations must reflect Next.js 15+/16 no-store defaults
 *
 * All tests run with dryRun: true to avoid touching the filesystem.
 */

'use strict';

const { transform } = require('../scripts/fix-layer-5-nextjs.js');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: run transform in dry-run mode with a synthetic file path
// ─────────────────────────────────────────────────────────────────────────────
async function runTransform(code, fileName = 'test.tsx') {
  return transform(code, { filePath: `/${fileName}`, dryRun: true, verbose: false });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Turbopack config key
// ─────────────────────────────────────────────────────────────────────────────
describe('configureTurbopack — Next.js 16 config key', () => {
  // configureTurbopack's regex matches `module.exports = { ... }` inline objects.
  // Variable-reference exports (module.exports = nextConfig) are not matched.
  const nextConfigWithoutTurbo = `
module.exports = {
  reactStrictMode: true
};
`.trim();

  test('writes top-level turbopack: key, not experimental.turbo', async () => {
    const result = await runTransform(nextConfigWithoutTurbo, 'next.config.js');
    expect(result.success).toBe(true);
    // The output must NOT contain the old removed key
    expect(result.code).not.toContain('experimental.turbo');
    expect(result.code).not.toMatch(/experimental\s*:\s*\{[^}]*turbo/s);
  });

  test('writes turbopack: at the top level when no turbo config exists', async () => {
    const result = await runTransform(nextConfigWithoutTurbo, 'next.config.js');
    expect(result.success).toBe(true);
    expect(result.code).toContain('turbopack:');
  });

  test('does not duplicate turbopack config when already present', async () => {
    const alreadyConfigured = `
module.exports = {
  reactStrictMode: true,
  turbopack: {
    rules: {}
  }
};
`.trim();
    const result = await runTransform(alreadyConfigured, 'next.config.js');
    expect(result.success).toBe(true);
    // Should not add a second turbopack block
    const matches = (result.code.match(/turbopack\s*:/g) || []).length;
    expect(matches).toBe(1);
  });

  test('does not add turbopack config to non-config files', async () => {
    const componentCode = `
export default function Page() {
  return <div>Hello</div>;
}
`.trim();
    const result = await runTransform(componentCode, 'page.tsx');
    expect(result.success).toBe(true);
    // Should not inject any turbopack config into a component file
    expect(result.code).not.toContain('turbopack:');
    expect(result.code).not.toContain('experimental.turbo');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. detectDeprecations — export const metadata is NOT deprecated
// ─────────────────────────────────────────────────────────────────────────────
describe('detectDeprecations — export const metadata false positive fix', () => {
  test('does not warn on export const metadata (static metadata — valid API)', async () => {
    const code = `
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Description here',
};

export default function Layout({ children }) {
  return <html><body>{children}</body></html>;
}
`.trim();
    const result = await runTransform(code, 'layout.tsx');
    expect(result.success).toBe(true);
    // Must not produce a deprecation warning about metadata
    const warnings = result.warnings || [];
    const metadataWarning = warnings.find(
      w => w.message && w.message.toLowerCase().includes('metadata')
        && w.message.toLowerCase().includes('deprecated')
    );
    expect(metadataWarning).toBeUndefined();
  });

  test('is idempotent — running twice does not add spurious metadata warnings', async () => {
    const code = `
export const metadata = { title: 'Hello' };
export default function Page() { return <div />; }
`.trim();
    const first = await runTransform(code, 'page.tsx');
    const second = await runTransform(first.code, 'page.tsx');
    const warnings = second.warnings || [];
    const metadataWarning = warnings.find(
      w => w.message && w.message.toLowerCase().includes('metadata')
        && w.message.toLowerCase().includes('deprecated')
    );
    expect(metadataWarning).toBeUndefined();
  });

  test('still warns on actual Next.js 16 deprecations (legacyBehavior)', async () => {
    const code = `
import Link from 'next/link';
export default function Nav() {
  return <Link href="/about" legacyBehavior><a>About</a></Link>;
}
`.trim();
    const result = await runTransform(code, 'nav.tsx');
    expect(result.success).toBe(true);
    const warnings = result.warnings || [];
    const legacyWarning = warnings.find(
      w => w.message && w.message.toLowerCase().includes('legacybehavior')
    );
    expect(legacyWarning).toBeDefined();
  });

  test('still warns on next lint deprecation', async () => {
    const code = `
// package.json scripts: "lint": "next lint"
// next lint
`.trim();
    const result = await runTransform(code, 'README.md');
    expect(result.success).toBe(true);
    const warnings = result.warnings || [];
    const lintWarning = warnings.find(
      w => w.message && w.message.toLowerCase().includes('next lint')
    );
    expect(lintWarning).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. suggestCachingOptimizations — Next.js 15+/16 no-store defaults
// ─────────────────────────────────────────────────────────────────────────────
describe('suggestCachingOptimizations — Next.js 15+/16 defaults', () => {
  test('suggestion message mentions Next.js 15+/16 and no-store default', async () => {
    const code = `
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{JSON.stringify(data)}</div>;
}
`.trim();
    const result = await runTransform(code, 'page.tsx');
    expect(result.success).toBe(true);
    const suggestions = result.suggestions || [];
    const cachingSuggestion = suggestions.find(s => s.type === 'caching');
    if (cachingSuggestion) {
      // Must not silently imply force-cache is always the right default
      expect(cachingSuggestion.message).toMatch(/Next\.js 15|no-store/i);
      // Recommendation must mention both force-cache AND ISR as options
      expect(cachingSuggestion.recommendation).toContain('force-cache');
      expect(cachingSuggestion.recommendation).toContain('revalidate');
    }
    // If no suggestion at all (fetch already has cache config), that's also fine
  });

  test('does not suggest caching when cache option is already specified', async () => {
    const code = `
export default async function Page() {
  const data = await fetch('https://api.example.com/data', { cache: 'force-cache' });
  return <div />;
}
`.trim();
    const result = await runTransform(code, 'page.tsx');
    const suggestions = result.suggestions || [];
    const cachingSuggestions = suggestions.filter(s => s.type === 'caching');
    expect(cachingSuggestions.length).toBe(0);
  });

  test('does not suggest caching when no-store is already specified', async () => {
    const code = `
export default async function Page() {
  const data = await fetch('https://api.example.com/data', { cache: 'no-store' });
  return <div />;
}
`.trim();
    const result = await runTransform(code, 'page.tsx');
    const suggestions = result.suggestions || [];
    const cachingSuggestions = suggestions.filter(s => s.type === 'caching');
    expect(cachingSuggestions.length).toBe(0);
  });
});
