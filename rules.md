# NeuroLint Project Rules - MANDATORY WORKFLOW

RULE NUMBER 1: NO ASSUMPTIONS, NO LAZY PATTERNS, NO GUESSWORK.

⚠️ **CRITICAL**: These are not suggestions. Follow EVERY step or you WILL break the transformation pipeline.

---

## 🚨 MANDATORY PRE-WORK CHECKLIST (DO THIS FIRST!)

Before writing ANY code or creating ANY file, you MUST complete this checklist:

### Step 1: RESEARCH (Required for every task)
```
[ ] Read replit.md completely
[ ] Search for relevant existing files/functions before creating new ones
[ ] View ALL files that might be related to the change
[ ] Check existing layer scripts before touching the pipeline
[ ] Verify what already exists BEFORE assuming it's missing
```

### Step 2: UNDERSTAND (No assumptions allowed)
```
[ ] What EXACTLY is the current state of the layer/module?
[ ] What files and exports already exist?
[ ] What is the MINIMAL change needed?
[ ] Which layers depend on this change?
[ ] Will this affect dry-run, backup, or rollback behavior?
```

### Step 3: PLAN (Show your work)
```
[ ] State what you found in research
[ ] List ONLY the files that need changes
[ ] Explain WHY each change is needed
[ ] Confirm the layer order is preserved
[ ] Get user approval if the change is non-trivial or cross-layer
```

### Step 4: EXECUTE (Minimal changes only)
```
[ ] Make ONLY the changes identified in Step 3
[ ] NO rewrites of entire layer scripts
[ ] NO additional features "while you're at it"
[ ] NO touching backup/rollback logic unless that is the task
[ ] Test with --dry-run before applying
```

---

## ❌ FORBIDDEN PATTERNS (Stop immediately if you catch yourself doing these)

- ❌ "Let me rewrite this layer to be cleaner"
- ❌ "I'll add these improvements while I'm at it"
- ❌ Creating a new layer script without checking if one already exists
- ❌ "This looks like it needs a new command" (assumption without research)
- ❌ TODO comments or placeholder transform logic
- ❌ Skipping the Apache 2.0 license header in new files
- ❌ Regex-based code transforms — always use AST via `@babel/parser` + `@babel/traverse`
- ❌ Modifying files without triggering a backup first
- ❌ Hardcoding file paths — use glob patterns and the existing path utilities
- ❌ Breaking the standard `transform()` return contract (see Layer API below)

---

## ✅ CORRECT PATTERNS (This is what good looks like)

- ✅ "Let me check what exists first" (search, view file)
- ✅ "Layer 4 already handles `window` guards, so I only need to extend its rule set"
- ✅ "Minimal change: add one visitor to the existing traverse call in fix-layer-3"
- ✅ "Researched: the backup session is created in cli.js before layers run — I don't need to add one"
- ✅ Full implementation, no TODOs, production-ready
- ✅ Every new transform is covered by a test in `__tests__/`
- ✅ Dry-run always works before any file is written

---

## 🎯 Project Identity

NeuroLint is an **enterprise-grade, deterministic code transformation CLI**, NOT a basic linter:

- 8-layer progressive AST transformation pipeline
- Zero AI — every fix is rule-based and auditable
- Automatic backup + rollback on failure
- Security forensics including CVE detection (Layer 8)
- Published as `@neurolint/cli` on npm
- Landing page at `landing/` (Vite + React, served on port 5000)

**Everything must be production-quality, fully implemented, and integrated with the existing pipeline.**

---

## 🏗️ Architecture: The 8-Layer Pipeline

Layers run in strict order. Each layer is self-contained and must not assume a previous layer succeeded.

| Layer | Script | Responsibility |
|-------|--------|---------------|
| 1 | `scripts/fix-layer-1-config.js` | `tsconfig.json`, `package.json`, `next.config.js` settings |
| 2 | `scripts/fix-layer-2-patterns.js` | Common code patterns: console logs, `var→const/let`, HTML entities, unused imports |
| 3 | `scripts/fix-layer-3-components.js` | React: `key` props, `alt` attributes, ARIA labels, accessibility |
| 4 | `scripts/fix-layer-4-hydration.js` | SSR safety: `window`/`document` guards, mounted-state checks |
| 5 | `scripts/fix-layer-5-nextjs.js` | App Router, `'use client'` directives, Next.js 15/16 migrations, React 19 compat |
| 6 | `scripts/fix-layer-6-testing.js` | Test infrastructure, error boundary suggestions |
| 7 | `scripts/fix-layer-7-adaptive.js` | Cross-session learned patterns with confidence scoring |
| 8 | `scripts/fix-layer-8-security/` | IoC detection, CVE scanning, behavioral AST analysis |

### Layer Execution Rules

- **Always run lower layers before higher ones.** Don't invoke Layer 5 on code that hasn't passed Layer 1.
- **Each layer is opt-in via `SmartLayerSelector`** in `cli.js`. Do not bypass it.
- **Layer 8 is fully wired** into the fix pipeline alongside Layers 1–7. Do not treat it as optional.
- **Failure in one layer must not crash the pipeline.** Return a failure state; let the orchestrator handle it.

---

## 🔧 Layer API Contract

Every layer script MUST export a `transform` function with this exact signature and return shape:

```javascript
/**
 * @param {string} code - Source code to transform
 * @param {string} filePath - Absolute path to the file being transformed
 * @param {object} options - CLI options (dryRun, verbose, etc.)
 * @returns {{ success: boolean, code: string, changeCount: number, changes: string[], error?: string }}
 */
async function transform(code, filePath, options) {
  try {
    // ... AST transformation logic ...
    return {
      success: true,
      code: transformedCode,
      changeCount: changes.length,
      changes: changes, // human-readable descriptions
    };
  } catch (err) {
    return {
      success: false,
      code: code,         // return original on failure
      changeCount: 0,
      changes: [],
      error: err.message,
    };
  }
}

module.exports = { transform };
```

**Never throw from a layer. Always catch and return `success: false` with the original code.**

---

## 🌳 AST Transformation Rules

All code transforms MUST use the AST pipeline — never regex on source strings.

```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript', 'decorators-legacy'],
});

traverse(ast, {
  // visitors here
});

const output = generate(ast, { retainLines: true }, code);
```

### AST Rules
- **Parse options**: always include `['jsx', 'typescript']` plugins minimum
- **`retainLines: true`** in generate to minimize diffs
- **Visitor pattern**: one concern per visitor node type — don't stack unrelated logic in a single visitor
- **Never mutate `path.node` directly without cloning** where identity matters
- **Side-effect tracking**: collect all changes in an array, only write the file after the full traversal

---

## 💾 Backup System

The backup system is non-negotiable. It runs before ANY file is written.

- **`backup-manager.js`** — standard backup manager
- **`backup-manager-production.js`** — higher limits, enhanced logging for production runs
- Backups live in `.neurolint-backups/` with SHA-256 checksums and timestamps
- **`backup-encryption.js`** — optional encryption layer for sensitive codebases
- **`backup-error-handler.js`** — circuit breaker and aggregated error reporting

### Rules
- ✅ Always create a backup session before the first file write in any command
- ✅ On layer failure, trigger rollback for that session
- ✅ For `migrate-nextjs-16`, create a centralized backup session covering ALL files before any rename or write
- ❌ Never skip backup in non-dry-run mode, even for "small" changes

---

## 🖥️ CLI Command Standards

All commands in `cli.js` must follow these conventions:

| Requirement | Detail |
|-------------|--------|
| `--dry-run` | Every command must support dry-run; zero files written in this mode |
| `--verbose` | Extended logging showing per-file change counts |
| `--json` | Machine-readable output for CI/CD integration |
| Spinner feedback | Use `simple-ora.js` for progress (not raw `console.log` during processing) |
| Exit codes | `0` = success, `1` = errors found/unfixed, `2` = fatal/unexpected error |
| Backup before write | Always; use the backup manager session pattern |

### Adding a New Command

1. Check `cli.js` for existing commands with similar scope
2. Define the command with `program.command()`
3. Add `--dry-run`, `--verbose`, `--json` flags
4. Start a backup session before any file I/O
5. Call the relevant layer `transform()` functions via `fix-master.js`
6. Output a summary with change counts per file

---

## 🔒 Security Layer (Layer 8) Rules

Layer 8 is the security forensics engine. Handle it with extra care:

- **100 IoC signatures** covering code injection, DoS, data exfiltration, RSC-specific exploits, and Next.js CVEs (updated 2026-07-12)
- **33 AST behavioral patterns** for React 19 hook anomalies
- **CVE coverage**: CVE-2025-55182 (RCE), CVE-2025-55183 (Source Code Exposure), CVE-2025-55184 (DoS), CVE-2025-67779 (Incomplete DoS Fix), CVE-2025-66478 (Next.js RSC RCE, CVSS 10.0), CVE-2026-23864 (Next.js RSC DoS, CVSS 7.5)
- **Partially patched version tracking**: `rceOnlyPatched` (19.0.1/19.1.2/19.2.1) vs `incompleteDoSPatched` (19.0.2/19.1.3/19.2.2). Fully patched: 19.0.3+, 19.1.4+, 19.2.3+. Latest (June 2026): 19.0.7, 19.1.8, 19.2.7
- **Next.js CVE-2025-66478**: fixed in 15.5.7 / 16.0.7. **CVE-2026-23864**: fixed in 15.5.10

### Rules
- ❌ Never auto-apply Layer 8 fixes without user confirmation — security transforms are destructive
- ✅ Layer 8 detection always runs in read-only/report mode first
- ✅ SARIF output must be valid for CI tooling integration
- ✅ New CVE signatures go in `scripts/fix-layer-8-security/` and must be added to the signature index

---

## 🎨 Landing Page Standards (`landing/`)

The landing page is a Vite + React site served on port 5000.

**Stack**: React, TypeScript, Tailwind CSS, `vite.config.mjs` at root with `root: 'landing'`

**Structure**:
```
landing/src/
  components/       # Reusable UI blocks
  docs/pages/       # Documentation pages (one per layer/command)
  fixes/pages/      # Interactive fix examples (e.g. HydrationMismatch)
  hooks/            # Custom React hooks
  utils/            # Shared utilities
  Index.tsx         # Root component
```

### Landing Page Rules
- ✅ Every new CLI feature needs a corresponding docs page in `landing/src/docs/pages/`
- ✅ Every new layer gets a `LayersDocSection` component
- ✅ Tailwind only — no inline styles, no separate CSS unless in `index.css` / `globals.css`
- ✅ Components must be accessible (ARIA, keyboard nav, contrast)
- ❌ No hardcoded API URLs — the Vite proxy handles `/api → localhost:3001`
- ❌ No Vercel-specific features that don't work in the Replit dev environment

**Theme**: Dark (`#0a0a0a` background), green accent (`#22c55e`), monospace code blocks, clean typography

---

## 📋 File-Level Documentation Requirements

Every source file MUST include:

```javascript
/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0
 * ...
 *
 * [filename] - [one-line purpose]
 *
 * What this does:
 * Integration points:
 * Data flow: input → output
 */
```

Every exported function MUST include:
1. JSDoc with `@param` and `@returns`
2. Input validation at the top
3. Error handling — never let exceptions bubble out of a layer
4. A note on what it changes if it writes files

---

## 🧪 Testing Requirements

All changes to the transformation pipeline require tests.

- **Test location**: `__tests__/` — one test file per layer (e.g., `layer-3.test.js`)
- **Framework**: Jest (config in `jest.config.cjs`)
- **Pattern**: input code string → call `transform()` → assert output code and `changeCount`
- **Edge cases**: empty file, already-correct file (idempotency), syntax errors in input
- **676 tests currently passing** — every PR must keep this green

```javascript
// Example pattern
const { transform } = require('../scripts/fix-layer-3-components');

test('adds missing alt attribute to img', async () => {
  const input = `<img src="logo.png" />`;
  const result = await transform(input, 'test.jsx', {});
  expect(result.success).toBe(true);
  expect(result.changeCount).toBeGreaterThan(0);
  expect(result.code).toContain('alt=');
});

test('is idempotent when alt already exists', async () => {
  const input = `<img src="logo.png" alt="Logo" />`;
  const result = await transform(input, 'test.jsx', {});
  expect(result.changeCount).toBe(0);
});
```

---

## ⚡ Quick Reference

**Critical Files:**
- `replit.md` — ALWAYS READ FIRST
- `cli.js` — Entry point and command registry
- `fix-master.js` — Layer orchestrator
- `ast-transformer.js` — Core AST utilities
- `validator.js` — Output validation before file write
- `selector.js` — `SmartLayerSelector` logic
- `vite.config.mjs` — Landing page dev server config

**Layer Scripts:** `scripts/fix-layer-{1..8}-*.js`

**Docs:** `docs/LAYER-*-VERIFIED-FACTS_*.md` — ground truth for each layer's known behaviors

---

## 🔄 Self-Check Before Submitting

Ask yourself:

1. ✅ Did I complete the MANDATORY pre-work checklist?
2. ✅ Did I check what exists before creating a new file?
3. ✅ Does my layer export the correct `transform()` contract?
4. ✅ Did I use AST — not regex — for all code transforms?
5. ✅ Is dry-run fully supported with zero file writes?
6. ✅ Is the backup system triggered before any file I/O?
7. ✅ Are there tests covering the change and idempotency?
8. ✅ Does the landing page reflect the new feature if user-facing?
9. ✅ Is it fully implemented — no TODOs, no placeholders?
10. ✅ Did I include the Apache 2.0 license header in new files?

**If ANY answer is "no", STOP and go back to Step 1.**

---

**Last Updated:** July 12, 2026
**Enforcement Level:** MANDATORY — Not following these rules breaks the transformation pipeline and can corrupt user codebases
