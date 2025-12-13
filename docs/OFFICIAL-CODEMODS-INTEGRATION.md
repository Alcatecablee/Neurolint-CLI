# Official Codemods Integration Strategy

> **NeuroLint works WITH official React and Next.js codemods, not against them.**

This document outlines NeuroLint's strategy for integrating with official framework codemods to provide a comprehensive, safe migration experience.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [What Official Codemods Do](#what-official-codemods-do)
3. [What NeuroLint Adds](#what-neurolint-adds)
4. [Integration Architecture](#integration-architecture)
5. [Command Usage](#command-usage)
6. [Supported Codemods](#supported-codemods)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Philosophy

Official codemods are maintained by React and Next.js core teams. They are:
- Battle-tested on thousands of codebases
- Focused on breaking changes between framework versions
- Conservative and well-documented

NeuroLint complements official codemods by:
- Handling 50+ additional fixes that codemods don't cover
- Adding security scanning with 90+ IoC signatures
- Providing accessibility and hydration safety fixes
- Learning project-specific patterns over time

**The recommended workflow is sequential:**
1. Run official codemods first (handles breaking changes)
2. Run NeuroLint second (handles everything else)

---

## What Official Codemods Do

### React 19 Codemods

React 19 codemods are run via the `codemod` CLI tool (recommended by React team):

| Codemod | What It Does | Command |
|---------|--------------|---------|
| `migration-recipe` | Runs ALL React 19 codemods at once | `npx codemod@latest react/19/migration-recipe` |
| `replace-reactdom-render` | Converts `ReactDOM.render()` to `createRoot().render()` | `npx codemod@latest react/19/replace-reactdom-render --target ./src` |
| `replace-string-ref` | Converts string refs to callback refs | `npx codemod@latest react/19/replace-string-ref --target ./src` |
| `replace-act-import` | Updates act import from react-dom/test-utils to react | `npx codemod@latest react/19/replace-act-import --target ./src` |
| `replace-use-form-state` | Replaces useFormState with useActionState | `npx codemod@latest react/19/replace-use-form-state --target ./src` |

### Next.js 15 Codemods

| Codemod | What It Does | Command |
|---------|--------------|---------|
| `next-async-request-api` | Makes `cookies()`, `headers()`, `params` async | `npx @next/codemod@latest next-async-request-api .` |
| `next-request-geo-ip` | Migrates geo/ip to `@vercel/functions` | `npx @next/codemod@latest next-request-geo-ip .` |
| `app-dir-runtime-config-experimental-edge` | Changes `experimental-edge` to `edge` runtime | `npx @next/codemod@latest app-dir-runtime-config-experimental-edge .` |

### Next.js 16 Codemods

| Codemod | What It Does | Command |
|---------|--------------|---------|
| `remove-experimental-ppr` | Removes `experimental_ppr` Route Segment Config | `npx @next/codemod@latest remove-experimental-ppr .` |
| `remove-unstable-prefix` | Removes `unstable_` prefix from stabilized APIs | `npx @next/codemod@latest remove-unstable-prefix .` |
| `middleware-to-proxy` | Migrates middleware convention to proxy | `npx @next/codemod@latest middleware-to-proxy .` |

---

## What NeuroLint Adds

Official codemods handle breaking changes. NeuroLint handles everything else:

| Category | Official Codemods | NeuroLint |
|----------|-------------------|-----------|
| **React Keys** | No coverage | Auto-adds keys to `.map()` with smart ID detection (Layer 3) |
| **Accessibility** | No coverage | `aria-label`, `alt` tags, WCAG compliance (Layer 3) |
| **Hydration Safety** | No coverage | SSR guards for `window`/`document`/`localStorage` (Layer 4) |
| **'use client' Directive** | No coverage | Auto-detects hooks and adds directive (Layer 5) |
| **Console Cleanup** | No coverage | AST-safe removal with comments (Layer 2) |
| **Security Scanning** | No coverage | 90 IoC signatures, CVE detection (Layer 8) |
| **Config Modernization** | No coverage | tsconfig, next.config best practices (Layer 1) |
| **Adaptive Learning** | No coverage | Project-specific pattern learning (Layer 7) |
| **Backup & Rollback** | No coverage | Centralized backups with SHA-256 verification |

---

## Integration Architecture

### Sequential Execution Model

```
┌─────────────────────────────────────────────────────────────┐
│                    User Command                              │
│  neurolint migrate-react19 . --with-official-codemods       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Official Codemods (Breaking Changes)              │
│  ─────────────────────────────────────────────              │
│  • npx codemod@latest react/19/replace-reactdom-render      │
│  • npx codemod@latest react/19/replace-string-ref           │
│  • npx codemod@latest react/19/replace-act-import           │
│  • npx codemod@latest react/19/replace-use-form-state       │
│                                                              │
│  Status: Each codemod runs independently                    │
│  Failure: Logged but does not block Phase 2                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: NeuroLint Enhancements (Everything Else)          │
│  ─────────────────────────────────────────────              │
│  • Layer 2: Pattern fixes                                    │
│  • Layer 3: Component fixes (keys, accessibility)           │
│  • Layer 4: Hydration safety                                │
│  • Layer 5: Next.js optimization                            │
│                                                              │
│  Status: Full validation after each layer                   │
│  Backup: Created before any modifications                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PHASE 3: Security Scan (Optional but Recommended)          │
│  ─────────────────────────────────────────────              │
│  • Layer 8: IoC detection                                   │
│  • CVE-2025-55182/55183/55184 vulnerability check           │
│  • Baseline comparison if available                         │
└─────────────────────────────────────────────────────────────┘
```

### Graceful Degradation

If official codemods are not available (npm not installed, network issues):
1. NeuroLint logs a warning
2. Continues with its own transformations
3. Reports which official codemods were skipped
4. Suggests running them manually later

---

## Command Usage

### CLI Flags for Official Codemods

| Flag | Description |
|------|-------------|
| `--with-official-codemods` | Run official React/Next.js codemods before NeuroLint enhancements |
| `--skip-official` | Skip official codemods (use with `--with-official-codemods` or `migrate-nextjs-15`) |
| `--recipe` | Use `migration-recipe` for faster all-in-one React 19 migration |
| `--codemod-version <ver>` | Pin codemod package version for reproducibility |

**Note on `--codemod-version`:** This flag pins the version of the codemod package used by the specific command:
- For `migrate-react19`: Pins `codemod@<version>` (React codemods)
- For `migrate-nextjs-15/16`: Pins `@next/codemod@<version>` (Next.js codemods)

These are different npm packages with different version lines, so use version numbers appropriate for each.

### React 19 Migration with Official Codemods

```bash
# Preview what will happen (recommended first step)
neurolint migrate-react19 . --with-official-codemods --dry-run --verbose

# Apply all migrations
neurolint migrate-react19 . --with-official-codemods --verbose

# Use migration-recipe for faster all-in-one migration
neurolint migrate-react19 . --with-official-codemods --recipe --verbose

# Pin codemod version for reproducibility
neurolint migrate-react19 . --with-official-codemods --codemod-version 1.0.0 --verbose

# Apply without official codemods (NeuroLint only)
neurolint migrate-react19 . --verbose
```

### Next.js 15 Migration

The `migrate-nextjs-15` command runs official Next.js 15 codemods **by default**:

```bash
# Preview Next.js 15 migration (runs official codemods by default)
neurolint migrate-nextjs-15 . --dry-run --verbose

# Apply Next.js 15 migration
neurolint migrate-nextjs-15 . --verbose

# Skip official codemods, run NeuroLint enhancements only
neurolint migrate-nextjs-15 . --skip-official --verbose
```

### Next.js 16 Migration with Official Codemods

```bash
# For Next.js 16 upgrades (requires --with-official-codemods)
neurolint migrate-nextjs-16 . --with-official-codemods --dry-run --verbose

# Apply Next.js 16 migration
neurolint migrate-nextjs-16 . --with-official-codemods --verbose
```

### Using the Full Upgrade Command (Recommended)

For the most comprehensive upgrade experience, use Next.js's built-in upgrade:

```bash
# Upgrades Next.js, React, and applies all relevant codemods
npx @next/codemod upgrade major
```

### Manual Sequential Workflow

If you prefer to run codemods manually:

```bash
# Step 1: Run React 19 migration recipe (all codemods at once)
npx codemod@latest react/19/migration-recipe --target ./src

# Step 2: Run NeuroLint for comprehensive modernization
neurolint fix . --all-layers --verbose

# Step 3: Security scan
neurolint security:scan-compromise .
```

---

## Supported Codemods

### React 19 Migration (`--with-official-codemods`)

| Codemod | Applied | Description |
|---------|---------|-------------|
| `replace-reactdom-render` | Yes | Critical for React 19 |
| `replace-string-ref` | Yes | Deprecated in React 19 |
| `replace-act-import` | Yes | Updated test utilities |
| `replace-use-form-state` | Yes | Renamed to useActionState |

### Next.js 15 Migration (`--with-official-codemods`)

| Codemod | Applied | Description |
|---------|---------|-------------|
| `next-async-request-api` | Yes | Async cookies/headers/params |
| `next-request-geo-ip` | Yes | Request API updates |
| `app-dir-runtime-config-experimental-edge` | Yes | Runtime config update |

### Next.js 16 Migration (`--with-official-codemods`)

| Codemod | Applied | Description |
|---------|---------|-------------|
| `remove-experimental-ppr` | Yes | PPR config cleanup |
| `remove-unstable-prefix` | Yes | API stabilization |
| `middleware-to-proxy` | Yes | Middleware migration |

---

## Error Handling

### Codemod Execution Errors

```
[Phase 1] Running official React 19 codemods...
  [OK] replace-reactdom-render - completed
  [SKIP] replace-string-ref - no changes needed
  [ERROR] replace-act-import - command failed (see below)
  
  Note: Codemod errors are non-blocking. NeuroLint will continue.
  
[Phase 2] Running NeuroLint enhancements...
```

### npx Not Available

```
[Phase 1] Running official React 19 codemods...
  [WARN] npx not found. Skipping official codemods.
  [INFO] Install Node.js 18+ for codemod support.
  [INFO] You can run codemods manually later.
  
[Phase 2] Running NeuroLint enhancements...
```

### Network Issues

```
[Phase 1] Running official React 19 codemods...
  [WARN] Could not download codemod@latest
  [INFO] Check your network connection or run codemods manually.
  
[Phase 2] Running NeuroLint enhancements...
```

---

## Best Practices

### 1. Always Preview First

```bash
neurolint migrate-react19 . --with-official-codemods --dry-run --verbose
```

### 2. Commit Before Migration

```bash
git add -A && git commit -m "Pre-migration checkpoint"
neurolint migrate-react19 . --with-official-codemods --verbose
```

### 3. Run Security Scan After Migration

```bash
neurolint migrate-react19 . --with-official-codemods --verbose
neurolint security:cve-2025-55182 . --fix  # Patch critical CVE
```

### 4. Review Changes Before Pushing

```bash
git diff
npm run test  # or your test command
npm run build  # verify build succeeds
```

---

## Comparison: Codemods Alone vs NeuroLint Integration

| Metric | Official Codemods Only | NeuroLint Integration |
|--------|------------------------|----------------------|
| Breaking changes fixed | Yes | Yes (via codemods) |
| React keys added | No | Yes |
| Accessibility improved | No | Yes |
| Hydration errors fixed | No | Yes |
| Security vulnerabilities detected | No | Yes |
| Backup before changes | No | Yes |
| Rollback capability | No | Yes |
| Pattern learning | No | Yes |

---

## FAQ

### Q: Do I need to run official codemods separately?

No. With `--with-official-codemods`, NeuroLint runs them for you in the correct order.

### Q: What if an official codemod fails?

NeuroLint logs the error and continues. Codemod failures are non-blocking because:
1. The codemod may not be applicable to your code
2. NeuroLint may have equivalent transformations
3. You can run the codemod manually later

### Q: Can I use NeuroLint without official codemods?

Yes. Simply omit the `--with-official-codemods` flag. NeuroLint's Layer 5 includes many React 19 and Next.js transformations.

### Q: Which should I trust more?

Both. Official codemods are maintained by framework authors. NeuroLint adds comprehensive validation, backup, and rollback that official codemods lack.

### Q: What's the difference between `react-codemod` and `codemod`?

The `codemod` CLI (from codemod.com) is now recommended by the React team. It runs faster, handles more complex migrations, and has better TypeScript support. NeuroLint uses `npx codemod@latest` for React codemods.

---

## Version Compatibility

| NeuroLint Version | React Codemods | Next.js Codemods |
|-------------------|----------------|------------------|
| 1.5.0+ | codemod@latest (react/19/*) | @next/codemod@latest |
| 1.4.x | Not supported | Not supported |

---

## Related Documentation

- [CLI Usage Guide](../CLI_USAGE.md)
- [Layer 5: Next.js Optimization](./LAYER-5-NEXTJS.md)
- [Security Forensics](./LAYER-8-SECURITY-FORENSICS.md)
- [Backup & Rollback](./BACKUP-SYSTEM.md)
