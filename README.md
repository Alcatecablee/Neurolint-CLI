# NeuroLint CLI

> Deterministic code transformation for React, Next.js, and TypeScript projects

[![npm version](https://img.shields.io/npm/v/@neurolint/cli.svg)](https://www.npmjs.com/package/@neurolint/cli)
[![npm downloads](https://img.shields.io/npm/dm/@neurolint/cli.svg)](https://www.npmjs.com/package/@neurolint/cli)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Tests](https://img.shields.io/badge/tests-676%20passing-brightgreen.svg)](./__tests__)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

**The only tool that actually FIXES your code** — deterministic, rule-based transformations (NOT AI) that automatically resolve 50+ code issues across 8 progressive layers.

---

## CRITICAL SECURITY ALERT: React Server Components CVEs

[![CVE-2025-55182](https://img.shields.io/badge/CVE--2025--55182-CRITICAL%20(10.0)-red.svg)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
[![CVE-2025-55184](https://img.shields.io/badge/CVE--2025--55184-HIGH%20(7.5)-orange.svg)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)
[![CVE-2025-55183](https://img.shields.io/badge/CVE--2025--55183-MEDIUM%20(5.3)-yellow.svg)](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)

**Three vulnerabilities have been discovered in React Server Components affecting all React 19 apps:**

| CVE | Severity | Description |
|-----|----------|-------------|
| **CVE-2025-55182** | CRITICAL (10.0) | Remote Code Execution |
| **CVE-2025-55184** | HIGH (7.5) | Denial of Service |
| **CVE-2025-55183** | MEDIUM (5.3) | Source Code Exposure |

### One-Command Fix

```bash
# Preview changes (recommended first)
npx @neurolint/cli security:cve-2025-55182 . --dry-run

# Apply the fix
npx @neurolint/cli security:cve-2025-55182 . --fix

# Scan for indicators of compromise
npx @neurolint/cli security:scan-compromise . --verbose

# Install patched dependencies
npm install
```

**Affected:** React 19.0.0-19.2.1, Next.js 15.x-16.x with App Router, React Router RSC, Vite RSC, Waku, and more.

**NOT Affected:** React 18 and earlier, SPAs without React Server Components, Next.js Pages Router.

**Fully Patched versions:** React 19.0.2, 19.1.3, 19.2.2 | Next.js 15.0.5+, 15.1.9+, 15.2.6+, 15.3.6+, 15.4.8+, 15.5.7+, 16.0.7+, 16.1.0+, 16.2.1+

**WARNING:** Versions 19.0.1, 19.1.2, 19.2.1 patched RCE but are still vulnerable to DoS and source exposure.

[Read the full security advisory →](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components)

---

## The Problem

Modern React and Next.js development suffers from repetitive, time-consuming code quality issues:

- **Hydration errors** — `window is not defined`, localStorage accessed during SSR
- **Missing accessibility** — Images without alt text, buttons without aria-labels
- **Framework migrations** — React 19 and Next.js 16 breaking changes require manual fixes
- **Outdated configurations** — TypeScript and Next.js configs causing build failures
- **Inconsistent patterns** — Teams waste hours in code review on style issues
- **Dependency conflicts** — Package version incompatibilities block upgrades

**The cost:** Hours of manual fixes, delayed releases, production bugs, and developer frustration.

## The Solution

NeuroLint uses deterministic, rule-based transformations — NOT artificial intelligence.

- **AST Parsing** — Understands code structure through Abstract Syntax Trees
- **Pattern Recognition** — Identifies anti-patterns using predefined rules
- **Repeatable Results** — Same input always produces same output
- **No Hallucinations** — No LLM guessing or unpredictable rewrites
- **Auditable** — Every transformation is documented and traceable

**No AI black box. Just intelligent, rule-based code fixes.**

---

## How It Works: The Orchestration Pattern

NeuroLint's critical differentiator is its **5-step fail-safe orchestration system** that prevents corrupted code from ever reaching production:

### Step 1: AST-First Transformation
Attempts precise code transformation using Abstract Syntax Tree parsing for deep structural understanding of your code.

### Step 2: First Validation
Immediately validates the AST transformation to ensure the code remains syntactically correct and maintains semantic integrity.

### Step 3: Regex Fallback (If AST Fails)
If AST parsing fails or Step 2 validation fails, falls back to regex-based transformation as a safety net.

### Step 4: Second Validation
Re-validates the regex transformation with the same strict checks. No shortcuts — every transformation path must pass validation.

### Step 5: Accept Only If Valid
**Changes are only applied if they pass validation.** If validation fails at any step, the transformation is automatically reverted to the last known good state.

```
┌──────────────────────────────────────────────────────────────┐
│  Original Code (Last Known Good State)                      │
│  ↓                                                           │
│  Step 1: Try AST Transformation                             │
│  ↓                                                           │
│  Step 2: Validate AST Result ✓/✗                            │
│  ├─ Valid ✓ → Step 5: Accept changes                        │
│  └─ Invalid ✗ → Step 3: Try Regex Fallback                  │
│     ↓                                                        │
│     Step 4: Validate Regex Result ✓/✗                       │
│     ├─ Valid ✓ → Step 5: Accept changes                     │
│     └─ Invalid ✗ → REVERT (no changes applied)              │
└──────────────────────────────────────────────────────────────┘
```

**Why This Matters:**
- **AI tools**: Generate code → Hope it works → Debug when it breaks → Waste developer time
- **NeuroLint**: Transform → Validate → Fallback if needed → Re-validate → Accept only if valid

**This is why NeuroLint never breaks your code** — unlike AI tools that can hallucinate invalid syntax, NeuroLint's orchestration pattern guarantees every change is validated twice before acceptance.

---

## Quick Start

### Installation

```bash
npm install -g @neurolint/cli
```

### First Run

```bash
# Analyze your project
neurolint analyze . --verbose

# Preview fixes (safe, no changes)
neurolint fix . --all-layers --dry-run --verbose

# Apply fixes
neurolint fix . --all-layers --verbose
```

### Example Transformation

**Before:**
```tsx
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}
```

**After:**
```tsx
'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : undefined}
      type="button"
    >
      {children}
    </button>
  );
}

export default Button;
```

**Fixed automatically:** TypeScript types, 'use client' directive, aria-label, button type, exports

---

## What NeuroLint Fixes

### 8-Layer Progressive Architecture

Each layer builds on the previous, ensuring safe and comprehensive transformations:

1. **Configuration Modernization** — Updates tsconfig.json, next.config.js, package.json to modern standards
2. **Pattern Standardization** — Removes HTML entity corruption, console.log, unused imports
3. **Accessibility & Components** — Adds React keys, WCAG 2.1 AA compliance, proper attributes
4. **SSR/Hydration Safety** — Protects against hydration errors with client-side API guards
5. **Next.js App Router** — Optimizes 'use client', Server Components, import structure
6. **Testing & Error Handling** — Generates error boundaries, scaffolds test files
7. **Adaptive Learning** — Production-grade pattern learning with 70%+ confidence scoring and 41 unit tests
8. **Security Forensics** — Post-exploitation detection, compromise scanning, incident response

[See detailed layer documentation in CLI_USAGE.md](./CLI_USAGE.md#layer-overview-table)

---

## Migration Tools

NeuroLint automates framework migrations with zero breaking changes:

### React 19 Migration
```bash
neurolint migrate-react19 . --dry-run --verbose
neurolint migrate-react19 . --verbose
```
Handles forwardRef removal, string refs, ReactDOM.render → createRoot, and more.

### Next.js 16 Migration
```bash
neurolint migrate-nextjs-16 . --dry-run --verbose
neurolint migrate-nextjs-16 . --verbose
```
Automates middleware → proxy rename, async params, caching APIs, PPR migration.

### Dependency Compatibility
```bash
neurolint check-deps . --fix
```
Detects React 19 incompatibilities, auto-generates .npmrc, adds package.json overrides.

[See complete migration guides in CLI_USAGE.md](./CLI_USAGE.md#migration-commands)

---

## Analysis Tools

### Turbopack Readiness
```bash
neurolint check-turbopack .
```
Analyzes Webpack configurations and recommends Turbopack migration path.

### React Compiler Opportunities
```bash
neurolint check-compiler .
```
Detects manual memoization patterns and recommends React Compiler adoption.

### Router Complexity Assessment
```bash
neurolint assess-router . --verbose
```
Scores project complexity (0-100) and recommends optimal setup (React vs Next.js).

### React 19.2 Feature Detection
```bash
neurolint detect-react192 .
```
Identifies opportunities for View Transitions, useEffectEvent, Activity components.

[See analysis tool documentation in CLI_USAGE.md](./CLI_USAGE.md#analysis-tools)

---

## Command Reference

### Core Commands
```bash
neurolint analyze [path]        # Scan for issues
neurolint fix [path]             # Apply automatic fixes
neurolint validate [path]        # Validate without changes
neurolint layers                 # List transformation layers
neurolint stats [path]           # Project statistics
```

### Migration Commands
```bash
neurolint migrate-react19 [path]     # React 19 migration
neurolint migrate-nextjs-16 [path]   # Next.js 16 migration
neurolint migrate-biome [path]       # Biome migration
neurolint simplify [path]            # Reduce project complexity
```

### Analysis Commands
```bash
neurolint check-deps [path]          # React 19 dependency checker
neurolint check-turbopack [path]     # Turbopack readiness
neurolint check-compiler [path]      # React Compiler opportunities
neurolint assess-router [path]       # Router complexity
neurolint detect-react192 [path]     # React 19.2 features
```

### Advanced Commands
```bash
neurolint backup                 # Manage backups
neurolint rules                  # Custom rule management
neurolint restore                # Restore from backup
```

**Flags:**
- `--verbose` — Detailed output
- `--dry-run` — Preview changes without applying
- `--backup` — Create backup before modifications
- `--layers=1,2,3` — Apply specific layers
- `--all-layers` — Apply all 8 layers
- `--fix` — Auto-fix issues (for check commands)

[See complete command reference in CLI_USAGE.md](./CLI_USAGE.md#command-atlas)

---

## Real-World Impact

### Accessibility Compliance
**Scenario:** Meeting WCAG 2.1 AA standards for enterprise application

```bash
neurolint fix src/ --layers=3 --verbose
```
**Result:** 150+ accessibility issues fixed automatically, audit-ready codebase

### React 19 Upgrade
**Scenario:** Migrating production app from React 18 to React 19

```bash
neurolint check-deps . --fix
neurolint migrate-react19 . --verbose
```
**Result:** All breaking changes handled automatically, smooth upgrade

### Next.js 16 Upgrade
**Scenario:** Adopting Next.js 16 caching model and middleware changes

```bash
neurolint migrate-nextjs-16 . --verbose
```
**Result:** Middleware renamed, PPR migrated, async APIs updated, zero manual work

[See more use cases in CLI_USAGE.md](./CLI_USAGE.md#guided-workflows)

---

## Integration

### Pre-commit Hook
```bash
neurolint fix src/ --layers=2,3 --dry-run || exit 1
```

### CI/CD Pipeline
```bash
neurolint analyze src/ --format=json --output=analysis.json
neurolint fix src/ --all-layers
```

### Team Collaboration
```bash
neurolint rules --export=team-rules.json
neurolint rules --import=team-rules.json
```

[See integration examples in CLI_USAGE.md](./CLI_USAGE.md#integration--automation)

---

## Documentation

- **[Complete Usage Guide](./CLI_USAGE.md)** — Comprehensive command reference and workflows
- **[Layer 8 Security Forensics](./docs/LAYER-8-SECURITY-FORENSICS.md)** — Security forensics specification and IoC detection
- **[Changelog](./CHANGELOG.md)** — Version history and release notes
- **[Contributing](./CONTRIBUTING.md)** — Contribution guidelines
- **[Code of Conduct](./CODE_OF_CONDUCT.md)** — Community standards
- **[License](./LICENSE)** — Apache License 2.0

---

## Why NeuroLint?

### vs ESLint
ESLint identifies problems. NeuroLint **fixes** them. Auto-fixes accessibility, hydration errors, and framework migrations that ESLint cannot handle.

### vs AI Code Tools
AI tools hallucinate and produce unpredictable results. NeuroLint uses deterministic AST transformations — same input always produces same output. Auditable, repeatable, enterprise-ready.

### vs Manual Fixes
Manual fixes are slow, error-prone, and expensive. NeuroLint processes hundreds of files in seconds with zero breaking changes.

---

## Support

- **Issues:** [github.com/Alcatecablee/Neurolint/issues](https://github.com/Alcatecablee/Neurolint/issues)
- **Discussions:** [github.com/Alcatecablee/Neurolint/discussions](https://github.com/Alcatecablee/Neurolint/discussions)
- **Email:** clivemakazhu@gmail.com

---

## License

**Apache License 2.0**

All code in this repository is free and open-source under Apache 2.0:

| Component | Description |
|-----------|-------------|
| CLI (`cli.js`, `src/`, `scripts/`) | Command-line tool and transformation engine |
| VS Code Extension (`vscode-extension/`) | Editor integration |
| Core Engine (`shared-core/`) | Shared transformation utilities |
| Landing Page (`landing/`) | Project website |

- Free forever — No fees, no restrictions
- Commercial use allowed — Use in your company or enterprise
- Modify and distribute — Fork, customize, and share as needed
- Patent protection — Includes explicit patent grant

[Read the full license](./LICENSE)

The NeuroLint SaaS (hosted dashboard, team features) is a separate commercial product maintained in a private repository.

---

## Contributing

We welcome contributions from the community. Please read our [Contributing Guide](./CONTRIBUTING.md) to get started.

---

**NeuroLint** — Deterministic code fixing. No AI. No surprises.
