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

| Codemod | What It Does | Command |
|---------|--------------|---------|
| `replace-reactdom-render` | Converts `ReactDOM.render()` to `createRoot().render()` | `npx @react-codemod/replace-reactdom-render` |
| `replace-string-ref` | Converts string refs to callback refs | `npx @react-codemod/replace-string-ref` |
| `use-context-hook` | Converts `Context.Consumer` to `useContext()` | `npx @react-codemod/use-context-hook` |
| `rename-unsafe-lifecycles` | Adds `UNSAFE_` prefix to deprecated lifecycles | `npx @react-codemod/rename-unsafe-lifecycles` |

### Next.js Codemods

| Codemod | What It Does | Command |
|---------|--------------|---------|
| `new-link` | Removes nested `<a>` from `<Link>` components | `npx @next/codemod new-link` |
| `next-image-experimental` | Updates Image component API | `npx @next/codemod next-image-experimental` |
| `app-dir-imports` | Updates imports for App Router | `npx @next/codemod app-dir-imports` |
| `metadata` | Converts `Head` to `generateMetadata` | `npx @next/codemod metadata` |
| `next-request-geo-ip` | Updates geo/ip access patterns | `npx @next/codemod next-request-geo-ip` |

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
│  • npx @react-codemod/replace-reactdom-render               │
│  • npx @react-codemod/replace-string-ref                    │
│  • npx @react-codemod/use-context-hook                      │
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

### React 19 Migration with Official Codemods

```bash
# Preview what will happen (recommended first step)
neurolint migrate-react19 . --with-official-codemods --dry-run --verbose

# Apply all migrations
neurolint migrate-react19 . --with-official-codemods --verbose

# Apply without official codemods (NeuroLint only)
neurolint migrate-react19 . --verbose
```

### Next.js 16 Migration with Official Codemods

```bash
# Preview what will happen
neurolint migrate-nextjs-16 . --with-official-codemods --dry-run --verbose

# Apply all migrations
neurolint migrate-nextjs-16 . --with-official-codemods --verbose
```

### Manual Sequential Workflow

If you prefer to run codemods manually:

```bash
# Step 1: Run official codemods
npx @react-codemod/replace-reactdom-render src/ --force
npx @react-codemod/replace-string-ref src/ --force

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
| `use-context-hook` | Yes | Modern context pattern |
| `rename-unsafe-lifecycles` | Yes | Lifecycle method safety |

### Next.js 16 Migration (`--with-official-codemods`)

| Codemod | Applied | Description |
|---------|---------|-------------|
| `new-link` | Yes | Link component update |
| `app-dir-imports` | Yes | App Router compatibility |
| `metadata` | Yes | Metadata API migration |
| `next-request-geo-ip` | Yes | Request API updates |

---

## Error Handling

### Codemod Execution Errors

```
[Phase 1] Running official React codemods...
  [OK] replace-reactdom-render - 5 files transformed
  [SKIP] replace-string-ref - No string refs found
  [ERROR] use-context-hook - Command failed (see below)
  
  Note: Codemod errors are non-blocking. NeuroLint will continue.
  
[Phase 2] Running NeuroLint enhancements...
```

### npx Not Available

```
[Phase 1] Running official React codemods...
  [WARN] npx not found. Skipping official codemods.
  [INFO] Install Node.js 16+ for codemod support.
  [INFO] You can run codemods manually later.
  
[Phase 2] Running NeuroLint enhancements...
```

### Network Issues

```
[Phase 1] Running official React codemods...
  [WARN] Could not download @react-codemod/replace-reactdom-render
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

---

## Version Compatibility

| NeuroLint Version | React Codemods | Next.js Codemods |
|-------------------|----------------|------------------|
| 1.5.0+ | @react-codemod/* | @next/codemod |
| 1.4.x | Not supported | Not supported |

---

## Related Documentation

- [CLI Usage Guide](../CLI_USAGE.md)
- [Layer 5: Next.js Optimization](./LAYER-5-NEXTJS.md)
- [Security Forensics](./LAYER-8-SECURITY-FORENSICS.md)
- [Backup & Rollback](./BACKUP-SYSTEM.md)
