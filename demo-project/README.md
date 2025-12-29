# NeuroLint Demo Showcase

This demo project intentionally contains code issues across all 8 layers that NeuroLint can automatically fix, plus the CVE-2025-55182 security vulnerability.

## Issues Present

### CVE-2025-55182 - CRITICAL Security Vulnerability
- **react**: ^19.0.0 (VULNERABLE - needs 19.0.1+)
- **next**: ^16.0.0 (VULNERABLE - needs 16.0.7+)

### Layer 1: Configuration Issues
- `tsconfig.json`: target "es5" (should be "es2022"), module "commonjs" (should be "esnext")
- `next.config.js`: deprecated experimental flags, missing modern settings

### Layer 2: Pattern Issues
- HTML entities not escaped (`&quot;` instead of `"`)
- `console.log` statements in production code
- `var` instead of `const/let`
- Unused imports

### Layer 3: Component Issues
- Missing `key` prop in `.map()` iterations
- Missing `alt` attribute on images
- Missing accessibility attributes (aria-label, role)

### Layer 4: Hydration Issues
- Direct `window.localStorage` access without SSR guards
- `document.getElementById` in component body
- `navigator` access without hydration safety

### Layer 5: Next.js Issues
- Missing `'use client'` directives
- Improper Server Component patterns
- Outdated imports (`next/router` instead of `next/navigation`)

### Layer 6: Testing Issues
- No error boundaries
- No test files
- Missing error handling

### Layer 7: Adaptive Patterns
- Project-specific patterns NeuroLint will learn

---

## Demo Commands

```bash
# Step 1: Scan for CVE-2025-55182
npx @neurolint/cli security:cve-2025-55182 . --dry-run

# Step 2: Fix CVE-2025-55182
npx @neurolint/cli security:cve-2025-55182 . --fix

# Step 3: Analyze all issues
npx @neurolint/cli analyze . --verbose

# Step 4: Preview all layer fixes
npx @neurolint/cli fix . --all-layers --dry-run --verbose

# Step 5: Apply all fixes
npx @neurolint/cli fix . --all-layers --verbose

# Step 6: Verify changes
git diff
```

## Expected Fixes

After running NeuroLint, all issues will be automatically fixed:

- Security vulnerabilities patched (React 19.0.1, Next.js 16.0.7)
- Modern TypeScript configuration
- Clean code patterns
- Accessible components with proper keys
- SSR-safe hydration guards
- Proper Next.js App Router patterns
- Error boundaries added
