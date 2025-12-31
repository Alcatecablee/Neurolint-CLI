# NeuroLint GitHub Action - Complete Guide

> **Deterministic code transformation for React, Next.js, and TypeScript projects using 8 progressive AST-based layers**

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Inputs & Configuration](#inputs--configuration)
4. [Layer Guide](#layer-guide)
5. [Workflow Examples](#workflow-examples)
6. [Output & Results](#output--results)
7. [Troubleshooting](#troubleshooting)

---

## Overview

NeuroLint is **NOT an AI tool**. It uses:

- **Abstract Syntax Tree (AST) parsing** for deep code understanding
- **Rule-based transformations** with deterministic, repeatable results
- **Multi-layer architecture** (8 layers, each targetable independently)
- **Validation & rollback** — changes are only applied if safe
- **NO AI guessing**, NO hallucinations, NO unpredictable rewrites

### Why Use NeuroLint in CI/CD?

| Problem | Solution |
|---------|----------|
| Hydration errors slip through code review | Layer 4 detects `window is not defined` patterns |
| React 19 CVEs not caught | Layer 8 detects CVE-2025-55182, CVE-2025-55183, CVE-2025-55184 |
| Missing accessibility attributes | Layer 3 adds `alt`, `aria-label`, `key` props |
| Inconsistent code patterns | Layer 2 standardizes patterns automatically |
| Configuration drift | Layer 1 validates `tsconfig.json`, `next.config.js` |
| Framework migration overhead | Layer 5 handles React 19 & Next.js 16 migration |

---

## Quick Start

### Minimal Configuration (5 minutes)

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  neurolint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Alcatecablee/neurolint@v1
        with:
          layers: 'all'
          dry-run: 'true'
```

This runs all 8 layers in preview mode without modifying files.

### Security-Focused (Recommended for CI)

```yaml
- uses: Alcatecablee/neurolint@v1
  with:
    layers: '1,4,5,8'
    fail-on-changes: 'true'
```

Runs:
- **Layer 1**: Config validation
- **Layer 4**: Hydration safety checks
- **Layer 5**: Next.js/React 19 migration
- **Layer 8**: Security forensics & CVE detection

Fails the build if issues found.

---

## Inputs & Configuration

### Input: `layers`

Which layers to execute (1-8).

**Format:**
- `all` — Run all 8 layers (default)
- `1,2,3` — Specific layers (comma-separated)
- Single number: `5` — Just Layer 5

**Examples:**
```yaml
layers: 'all'              # All 8 layers
layers: '1,2,3'            # Layers 1, 2, 3 (config + patterns + components)
layers: '8'                # Security forensics only
layers: '1,4,5,8'          # Security-focused
layers: '2,3,6,7'          # Code quality focused
```

### Input: `path`

Target directory or file to scan.

**Default:** `.` (project root)

**Examples:**
```yaml
path: './src'              # Scan src directory
path: './apps/web'         # Scan specific app
path: './src/components'   # Scan specific folder
```

### Input: `dry-run`

Preview changes without applying them.

**Default:** `false`

**Recommended:** Start with `true`, review output, then set `false` only if comfortable.

```yaml
dry-run: 'true'            # Preview mode
dry-run: 'false'           # Apply changes
```

### Input: `verbose`

Enable detailed logging for debugging.

**Default:** `false`

```yaml
verbose: 'true'            # Show detailed logs
```

### Input: `fail-on-changes`

Fail the workflow if any changes would be made (useful for enforcement).

**Default:** `false`

```yaml
fail-on-changes: 'true'    # Fail if changes detected
```

### Input: `include`

File patterns to include in scan.

**Default:** `**/*.{ts,tsx,js,jsx,json}`

```yaml
include: '**/*.{ts,tsx}'    # Only TypeScript
include: 'src/**/*.tsx'     # src directory only
```

### Input: `exclude`

File patterns to exclude from scan.

**Default:** `node_modules,dist,.next,coverage,build`

```yaml
exclude: '__tests__,*.test.ts,.stories.tsx'
exclude: 'node_modules,.next'
```

---

## Layer Guide

### Layer 1: Configuration (Fast)

**What it fixes:**
- `tsconfig.json` — Compiler options, strict mode
- `next.config.js` — Next.js compiler settings
- `package.json` — Dependencies, scripts
- Turbopack configuration suggestions

**Use case:** Every CI run

```yaml
layers: '1'
```

### Layer 2: Patterns (Fast)

**What it fixes:**
- HTML entities (`&quot;` → `"`)
- Console statements (`console.log()` removal)
- Variable declarations (`var` → `const/let`)
- Import cleanup (unused imports)
- React 19 deprecated methods

**Use case:** Code standardization

```yaml
layers: '2'
```

### Layer 3: Components (Fast)

**What it fixes:**
- Missing `key` props on mapped elements
- Missing `alt` attributes on images
- Missing `aria-label` on buttons
- Missing component variants
- Missing form input types

**Use case:** Accessibility & best practices

```yaml
layers: '3'
```

### Layer 4: Hydration (Critical)

**What it fixes:**
- `window is not defined` errors
- `document is not defined` errors
- `localStorage` SSR safety
- Browser API guards
- Server-side vs client-side detection

**Use case:** Next.js SSR apps (run in CI!)

```yaml
layers: '4'
```

### Layer 5: Next.js & React Optimization (Medium)

**What it fixes:**
- Missing `'use client'` directives
- Deprecated Next.js features
- React 19 breaking changes
- Server components migration prep
- Dynamic imports optimization

**Use case:** Framework upgrades

```yaml
layers: '5'
```

### Layer 6: Testing (Fast)

**What it fixes:**
- Error boundary suggestions
- Test scaffolding guidance
- Testing library best practices

**Use case:** Testing infrastructure

```yaml
layers: '6'
```

### Layer 7: Adaptive Learning (Smart)

**What it fixes:**
- Custom transformation rules (learns from codebase)
- Production pattern detection
- Confidence-scored recommendations

**Use case:** Long-running projects

```yaml
layers: '7'
```

### Layer 8: Security Forensics (Critical)

**What it fixes:**
- React Server Component CVEs (CVE-2025-55182, 55183, 55184)
- Indicators of Compromise (IoCs)
- Behavioral security threats
- Dependency vulnerabilities
- RSC-specific exploits

**Use case:** Security audits (run in CI!)

```yaml
layers: '8'
```

### Layer Combinations

**Security Focus** (Layers 1, 4, 5, 8):
```yaml
layers: '1,4,5,8'
```

**Code Quality** (Layers 2, 3, 6, 7):
```yaml
layers: '2,3,6,7'
```

**Fast Track** (Layers 1-3, fastest):
```yaml
layers: '1,2,3'
```

**Comprehensive** (all 8):
```yaml
layers: 'all'
```

---

## Workflow Examples

### Example 1: Daily Security Scan

```yaml
name: Security Check

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Alcatecablee/neurolint@v1
        with:
          layers: '1,4,5,8'
          fail-on-changes: 'true'
          verbose: 'true'
```

### Example 2: PR Code Quality Review

```yaml
name: PR Quality Gate

on: pull_request

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Alcatecablee/neurolint@v1
        id: neurolint
        with:
          layers: '2,3,6,7'
          dry-run: 'true'
      
      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## NeuroLint Analysis
              
- **Changes:** ${{ steps.neurolint.outputs.changes-count }}
- **Summary:** ${{ steps.neurolint.outputs.summary }}
- **Files:** ${{ steps.neurolint.outputs.affected-files }}`
            })
```

### Example 3: Auto-Fix on Main Branch

```yaml
name: Auto-Fix

on:
  push:
    branches: [main]

jobs:
  autofix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Alcatecablee/neurolint@v1
        with:
          layers: 'all'
          dry-run: 'false'
          path: './src'
      
      - name: Create PR for fixes
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: apply neurolint fixes'
          title: 'NeuroLint: Automated Code Fixes'
```

### Example 4: React 19 & Next.js 16 Migration Check

```yaml
name: Migration Check

on: [push]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Alcatecablee/neurolint@v1
        with:
          layers: '5'
          dry-run: 'true'
          verbose: 'true'
```

---

## Output & Results

The action provides these outputs:

| Output | Type | Description |
|--------|------|-------------|
| `summary` | string | Human-readable summary |
| `changes-count` | number | Number of changes detected |
| `affected-files` | string | Pipe-separated list of files |
| `layers-run` | string | Which layers were executed |

### Using Outputs

```yaml
- uses: Alcatecablee/neurolint@v1
  id: neurolint
  with:
    layers: 'all'

- name: Print results
  run: |
    echo "Changes: ${{ steps.neurolint.outputs.changes-count }}"
    echo "Summary: ${{ steps.neurolint.outputs.summary }}"
    echo "Files: ${{ steps.neurolint.outputs.affected-files }}"
```

---

## Troubleshooting

### Q: "Module not found: @neurolint/cli"

**Solution:** Ensure Node.js 20+ is installed:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### Q: No changes detected even though code has issues

**Solution:** Check file patterns match your files:
```yaml
- uses: Alcatecablee/neurolint@v1
  with:
    include: '**/*.{ts,tsx,js,jsx}'
    verbose: 'true'
```

### Q: Action runs but makes no changes

**Possible reasons:**
1. Code is already clean
2. File patterns don't match (`include` too restrictive)
3. Excluded patterns are too broad
4. Selected layers don't detect those issues

**Debug:**
```yaml
with:
  dry-run: 'true'
  verbose: 'true'
  layers: 'all'
```

### Q: Build fails when fail-on-changes is true

**Expected behavior** — The action intentionally fails to stop deployment if issues are found.

**To fix locally:**
```bash
npx @neurolint/cli fix ./src --layers 1,2,3,4,5,6,7,8
git add .
git commit -m 'fix: apply neurolint fixes'
git push
```

### Q: How to apply fixes locally?

```bash
# Install NeuroLint globally
npm install -g @neurolint/cli

# Run fixes on your project
neurolint fix ./src --layers all

# Or specific layers
neurolint fix ./src --layers 1,4,5,8
```

---

## Performance Benchmarks

Layer execution time (on typical project):

| Layer | Time | Complexity |
|-------|------|-----------|
| 1 | ~50ms | Very fast |
| 2 | ~100ms | Fast |
| 3 | ~200ms | Fast |
| 4 | ~500ms | Medium |
| 5 | ~600ms | Medium |
| 6 | ~150ms | Fast |
| 7 | ~500ms | Varies |
| 8 | ~700ms | Medium |

**All 8 layers:** ~3s

---

## Support

- **GitHub Issues:** [Alcatecablee/Neurolint/issues](https://github.com/Alcatecablee/Neurolint/issues)
- **Documentation:** [NeuroLint CLI Guide](https://github.com/Alcatecablee/Neurolint/blob/main/README.md)

---

## License

Apache License 2.0 — See LICENSE for details
