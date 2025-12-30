# NeuroLint GitHub Action

Deterministic code transformation for React, Next.js, and TypeScript projects. Fix 50+ code issues across **8 progressive layers** with AST parsing no AI guessing, no hallucinations.

## What NeuroLint Does

NeuroLint uses **Abstract Syntax Tree (AST)** parsing and **rule-based transformations** to automatically fix common development issues:

- **Layer 1 - Configuration:** Fix `tsconfig.json`, `package.json`, `next.config.js`
- **Layer 2 - Patterns:** Remove console statements, HTML entities, convert `var` → `const/let`
- **Layer 3 - Components:** Add missing `key` props, `alt` attributes, ARIA labels
- **Layer 4 - Hydration:** Guard `window`, `document`, `localStorage` for SSR safety
- **Layer 5 - Next.js:** Migrate deprecated features, add `'use client'`, React 19 fixes
- **Layer 6 - Testing:** Error boundary suggestions, test scaffolding guidance
- **Layer 7 - Adaptive Learning:** Learn and store custom transformation rules
- **Layer 8 - Security Forensics:** Detect CVEs (React 19, Next.js), IoCs, behavioral threats

## Quick Start

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  neurolint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Preview all changes (dry-run)
      - uses: ./
        with:
          layers: 'all'
          dry-run: 'true'
      
      # Run security checks only
      - uses: ./
        with:
          layers: '1,4,5,8'  # Config, Hydration, Next.js, Security
```

## Inputs

| Input | Description | Default | Example |
|-------|-------------|---------|---------|
| `layers` | Which layers to run: `all` or comma-separated (1-8) | `all` | `1,2,3` or `all` |
| `path` | Target directory to scan | `.` | `./src` or `./apps/web` |
| `dry-run` | Preview without applying changes | `false` | `true` |
| `verbose` | Enable detailed logging | `false` | `true` |
| `fail-on-changes` | Fail workflow if changes detected | `false` | `true` |
| `include` | File patterns to include | `**/*.{ts,tsx,js,jsx,json}` | `**/*.tsx` |
| `exclude` | File patterns to exclude | `node_modules,dist,.next,coverage,build` | `__tests__,.test.ts` |

## Outputs

| Output | Description |
|--------|-------------|
| `summary` | Summary message of execution |
| `changes-count` | Number of changes detected |
| `affected-files` | List of files that would be modified |
| `layers-run` | Which layers were executed |

## Usage Examples

### 1. All Layers (Comprehensive Check)

```yaml
- uses: ./
  with:
    layers: 'all'
    dry-run: 'true'
```

Runs all 8 layers, previewing all potential changes.

### 2. Security Focus (Layers 1, 4, 5, 8)

```yaml
- uses: ./
  with:
    layers: '1,4,5,8'
    path: './src'
    fail-on-changes: 'true'
```

- **Layer 1:** Config vulnerabilities
- **Layer 4:** Hydration bugs (SSR safety)
- **Layer 5:** Next.js optimization
- **Layer 8:** Security forensics + CVEs

### 3. Code Quality (Layers 2, 3, 6, 7)

```yaml
- uses: ./
  with:
    layers: '2,3,6,7'
    path: './src'
```

- **Layer 2:** Pattern fixes
- **Layer 3:** Component best practices
- **Layer 6:** Testing infrastructure
- **Layer 7:** Adaptive learning

### 4. React 19 & Next.js 16 Migration (Layer 5)

```yaml
- uses: ./
  with:
    layers: '5'
    path: './src'
    dry-run: 'true'
```

Checks for deprecated APIs and migration opportunities.

### 5. Hydration & SSR Issues (Layer 4)

```yaml
- uses: ./
  with:
    layers: '4'
    path: './src'
```

Detects and fixes `window is not defined`, SSR safety issues.

### 6. Security CVE Detection (Layer 8)

```yaml
- uses: ./
  with:
    layers: '8'
    fail-on-changes: 'true'
```

Scans for React Server Component CVEs, IoCs, behavioral threats.

### 7. Custom Include/Exclude Patterns

```yaml
- uses: ./
  with:
    layers: '1,2,3'
    include: '**/*.{ts,tsx}'
    exclude: '__tests__,*.test.ts,.stories.tsx'
    verbose: 'true'
```

### 8. Apply Fixes (Production Use)

```yaml
- uses: ./
  with:
    layers: 'all'
    dry-run: 'false'  # Actually apply changes
    path: './src'
```

WARNING: Only use `dry-run: false` after reviewing output with `dry-run: true`.

## Advanced Workflow Example

```yaml
name: Code Quality & Security

on: [push, pull_request]

jobs:
  neurolint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      # Phase 1: Dry-run all checks
      - name: Preview All Changes
        uses: ./
        with:
          layers: 'all'
          dry-run: 'true'
          verbose: 'true'

      # Phase 2: Fail if security issues found
      - name: Security Check
        uses: ./
        with:
          layers: '1,4,5,8'
          fail-on-changes: 'true'

      # Phase 3: Apply fixes (only on main branch)
      - name: Apply Fixes
        if: github.ref == 'refs/heads/main'
        uses: ./
        with:
          layers: 'all'
          dry-run: 'false'

      # Phase 4: Create PR with changes (if any)
      - name: Create PR if fixes applied
        if: github.ref == 'refs/heads/main'
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: apply neurolint fixes'
          title: 'NeuroLint: Automated Code Fixes'
          body: |
            Automated code quality improvements from NeuroLint
            - ${{ steps.apply.outputs.summary }}
```

## Layer Selection Guide

| Use Case | Recommended Layers | Reasoning |
|----------|-------------------|-----------|
| **Daily CI/CD** | `1,2,3,4` | Fast, safe, catches common issues |
| **Security audit** | `1,4,5,8` | Detects CVEs, SSR bugs, config issues |
| **Code quality** | `2,3,6,7` | Patterns, components, testing, learning |
| **Pre-commit** | `2,4` | Lightweight, catches obvious issues |
| **Full check** | `all` or `1-8` | Comprehensive, slower |
| **Migration** | `5` | React 19 & Next.js 16 prep |

## Performance Tips

- **Layers 1-3:** Very fast (~100ms)
- **Layer 4:** Medium (~500ms) - SSR checks
- **Layer 5:** Medium (~500ms) - AST traversal
- **Layer 6:** Fast (~200ms)
- **Layer 7:** Depends on codebase size
- **Layer 8:** Medium (~500ms) - Security scanning

**Pro tip:** Run layers 1-4 in CI, full check nightly.

## Troubleshooting

### Action fails with "Module not found"

Ensure Node.js 20+ is installed:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### Changes not detected

Check file patterns:
```yaml
- uses: ./
  with:
    include: '**/*.{ts,tsx,js,jsx}'  # Match your files
    verbose: 'true'
```

### Want to apply fixes locally?

```bash
npx @neurolint/cli fix ./src --layers 1,2,3,4
```

## Contributing

Found a bug? Have a feature request? Open an issue on [GitHub](https://github.com/Alcatecablee/Neurolint).

## License

Apache License 2.0 — See [LICENSE](../LICENSE) for details.
