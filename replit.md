# NeuroLint CLI

## Overview

NeuroLint is a deterministic, rule-based code transformation tool for React, Next.js, and TypeScript projects. Unlike AI-powered tools, it uses Abstract Syntax Tree (AST) parsing and predefined transformation rules to automatically fix code issues with 100% reliability. The project features an 8-layer progressive architecture that handles everything from configuration fixes to security forensics.

**Core Purpose:** Automatically resolve common React/Next.js development issues including hydration errors, missing accessibility attributes, framework migration breaking changes, and critical security vulnerabilities.

**Key Technologies:**
- **AST Engine:** Babel parser, traverse, and generator for code transformation
- **Frontend:** React 19.2 with Vite 4.5 for landing page
- **CLI Framework:** Node.js with custom spinner and backup systems
- **Testing:** Jest with 132 passing tests

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### 8-Layer Transformation Architecture

The core engine processes code through progressive layers, each handling specific categories of issues:

**Layer 1 - Configuration:** Fixes `tsconfig.json`, `package.json`, and `next.config.js` settings. Detects Next.js version and applies appropriate compiler options (ES2022 target, ESNext modules).

**Layer 2 - Pattern Fixes:** Removes console statements, fixes HTML entities, replaces `var` with `const/let`, and cleans unused imports. Uses AST-based detection with regex fallbacks.

**Layer 3 - Component Fixes:** Adds missing React `key` props in map iterations, `alt` attributes on images, and ARIA labels for accessibility.

**Layer 4 - Hydration Guards:** Wraps browser API calls (`window`, `document`, `localStorage`, `navigator`) with SSR-safe checks using `typeof window !== 'undefined'`.

**Layer 5 - Next.js Optimization:** Adds `'use client'` directives, migrates deprecated imports (`next/router` → `next/navigation`), and handles React 19 breaking changes (ReactDOM.render → createRoot).

**Layer 6 - Testing Infrastructure:** Adds error boundaries, suggests test scaffolding, and provides MSW/RSC testing guidance.

**Layer 7 - Adaptive Learning:** Production-grade pattern learning with smart extraction (only learns from files with actual React hooks), confidence scoring (70%+ threshold), suggestion/change separation, and verbose debug logging. Stores custom rules in `.neurolint/learned-rules.json`. Backed by 41 comprehensive unit tests.

**Layer 8 - Security Forensics:** Detects 80+ Indicators of Compromise (IoC) including obfuscated eval, credential leaks, and post-exploitation patterns. Includes CVE-2025-55182 (React Server Components RCE) detection and patching.

### AST Transformation Engine

**Core Components:**
- `ast-transformer.js`: Babel-based parser and code generator with TypeScript/JSX support
- `validator.js`: Syntax validation and transformation safety checks
- `backup-manager.js`: Automatic backup creation with SHA-256 checksums and retention limits

**Design Pattern:** Parse → Transform → Validate → Backup → Apply. All transformations are validated before writing to disk. If validation fails, the system falls back to regex-based transformations or reverts changes.

**Error Handling:** Production-grade error aggregator tracks errors per-file with phase/context information. Circuit breaker pattern prevents cascading failures. ReDoS protection via SafeRegex utility with pattern pre-validation.

### Framework Migration Systems

**Next.js 16 Migrator:** (`scripts/migrate-nextjs-16.js`)
- Renames `middleware.ts` → `proxy.ts` with function export updates
- Migrates `experimental.ppr` → Cache Components pattern
- Adds async handling for params/searchParams
- Implements new caching APIs (updateTag, refresh, cacheLife)

**React 19 Compatibility:** (`scripts/enhanced-react19-dom.js`)
- Converts `ReactDOM.render` → `createRoot().render`
- Migrates `react-dom/test-utils` → `react` (act function)
- Removes deprecated `ReactDOM.hydrate`, `findDOMNode`, `unmountComponentAtNode`

**React Compiler Detector:** (`scripts/react-compiler-detector.js`)
- Identifies manual memoization patterns (useMemo, useCallback, React.memo)
- Calculates potential bundle size savings from compiler adoption
- Suggests automatic optimization opportunities

### Security Architecture

**CVE-2025-55182 Handler:** Critical Remote Code Execution vulnerability in React Server Components (CVSS 10.0)
- Detects vulnerable React 19.0.0-19.2.0 and Next.js 15.x-16.x versions
- Updates `package.json` to patched versions (React 19.0.1+, Next.js 16.0.7+)
- Validates `react-server-dom-*` package versions
- Provides dry-run preview before applying patches

**Layer 8 IoC Detection:** 80 behavioral signatures across categories:
- Code execution patterns (eval, Function constructor, child_process.exec)
- Obfuscation detection (hex encoding, base64, string concatenation)
- Data exfiltration (fetch to suspicious domains, credential patterns)
- Persistence mechanisms (cron jobs, service installations)

**Signature Analyzer:** AST-based pattern matching with severity scoring (critical/high/medium/low). Includes 5 React 19-specific patterns:
- BEHAV-023: User input in `use(fetch())` calls
- BEHAV-024: Code execution in `useActionState` handlers
- BEHAV-025: XSS risks in `useOptimistic` with dangerouslySetInnerHTML
- BEHAV-026: Data leaks in `startTransition`
- BEHAV-027: Cache poisoning with user-specific data

### CLI Command System

**Primary Commands:**
- `analyze <path>`: Scan for issues without modification
- `fix <path> --layer <1-8>`: Apply specific layer transformations
- `fix-all <path>`: Run all 8 layers sequentially
- `security:cve-2025-55182 <path>`: Patch critical React vulnerability
- `migrate-react19 <path>`: Apply React 19 breaking change fixes
- `migrate-nextjs-16 <path>`: Migrate to Next.js 16 patterns

**Global Flags:**
- `--dry-run`: Preview changes without writing files
- `--verbose`: Detailed operation logging
- `--fix`: Apply transformations (required for modification)

**Backup System:** All transformations create timestamped backups in `.neurolint-backups/` with metadata (SHA-256 hash, timestamp, original path). Automatic retention management keeps last 10-50 backups.

## External Dependencies

### Code Transformation Stack
- **@babel/parser** - JavaScript/TypeScript/JSX parsing
- **@babel/traverse** - AST node traversal and manipulation
- **@babel/generator** - Code generation from modified AST
- **@babel/types** - AST node type definitions and utilities

### CLI & File System
- **glob** - Pattern-based file discovery
- **cli-cursor** - Terminal cursor control
- **restore-cursor** - Cursor state restoration
- **log-symbols** - Cross-platform terminal symbols
- **strip-ansi** - ANSI code removal for output parsing
- **wcwidth** - Character width calculation

### Frontend (Landing Page)
- **React 19.2 + React DOM** - UI framework
- **Vite 4.5** - Build tool and dev server
- **TailwindCSS 3.4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **react-syntax-highlighter** - Code snippet display
- **next-themes** - Dark mode support
- **react-router-dom 7.9** - Client-side routing

### Analytics & Monitoring
- **@vercel/analytics** - Usage analytics
- **@vercel/speed-insights** - Performance monitoring

### Testing Infrastructure
- **Jest 30.2** - Test runner with 132 tests
- **@types/jest** - TypeScript definitions for testing

### Build & Development
- **@vitejs/plugin-react** - Vite React plugin
- **autoprefixer** - CSS vendor prefixing
- **postcss** - CSS transformation pipeline
- **TypeScript 5.3** - Type checking (noEmit mode only)

**Note:** No database dependencies. All state is file-based (JSON) stored in `.neurolint/` directory.

## Recent Changes (December 2025)

### Documentation Accuracy Audit (December 8, 2025)
- **Fixed fake layer names**: Replaced ConfigMaster, PatternCleanse, ReactRepair, HydraFix, NextGuard, TestReady, AdaptiveLearn with real CLI names (Configuration, Patterns, Components, Hydration, Next.js, Testing, Adaptive, Security Forensics)
- **Verified CLI reference**: DocsCliReference.tsx layers output now matches actual `neurolint layers` command
- **Fixed scroll-to-top navigation**: Added useEffect in DocsLayout.tsx to scroll to top on page changes
- **Updated 6 docs files**: DocsArchitecture.tsx, DocsQuickstart.tsx, DocsCommandFix.tsx, DocsCliReference.tsx, plus layer pages

### Documentation Expansion (December 8, 2025)
- **20+ new documentation pages**: Created comprehensive docs matching Supabase/Vercel enterprise quality
- **Dark minimalist theme**: Pure black (#000000) backgrounds, zinc-900/zinc-800 surfaces, white text, zinc-800 borders only
- **NO colorful icons**: Removed all emoji-style icons per user preference
- **Command pages**: analyze, fix, migrate-react19, migrate-nextjs-16 with full flag documentation
- **Layer pages**: All 8 layers with real CLI names (Configuration, Patterns, Components, Hydration, Next.js, Testing, Adaptive, Security Forensics)
- **Security pages**: CVE-2025-55182, IoC Detection, Incident Response workflows
- **Guide pages**: CI/CD Integration, Backup & Restore, Troubleshooting
- **Technical pages**: How It Works, AST Transformations with architecture details
- **Sidebar navigation**: All pages accessible via collapsible sidebar sections
- **Verified working**: All routes configured in main.jsx, screenshots confirmed styling

### npm Publishing Preparation (December 8, 2025)
- **package.json cleanup**: Moved frontend-only dependencies (react, react-dom, lucide-react, @vercel/analytics, @vercel/speed-insights, asciinema-player, next-themes, react-router-dom, react-syntax-highlighter, ora, cli-cursor, log-symbols, restore-cursor, strip-ansi, wcwidth) from dependencies to devDependencies
- **engines field**: Updated minimum Node.js version from >=16.0.0 to >=18.0.0 for glob@12 compatibility
- **Lean production dependencies**: CLI now only requires @babel/generator, @babel/parser, @babel/traverse, @babel/types, and glob for runtime
- **Verified**: All CLI commands working (--version, --help, analyze, fix, layers)
- **npm pack verified**: Package includes all required files without frontend bloat

### Version 1.4.11 - Pattern Matching Fix (December 8, 2025)
- **Critical bug fix**: Fixed glob pattern matching for `.neurolint/` exclusions on Windows
- Dots in patterns like `.neurolint` were not escaped (matched any character in regex)
- Root-level paths weren't matched by `**/.neurolint/**` pattern
- Added proper regex escaping and root-level pattern fallback

### Version 1.4.10 - Windows Compatibility Fix (December 8, 2025)
- **Critical bug fix**: Fixed path separator issue causing `node_modules` to be scanned on Windows
- Windows uses `\` but exclusion patterns use `/`, causing 6,645 files to be scanned instead of ~12
- Added `.replace(/\\/g, '/')` to normalize paths in `scripts/fix-layer-8-security/index.js`
- Added `.neurolint/**` and `.neurolint-backups/**` to default exclusions

### Pre-Publishing Security Audit Fixes
- **CLI handleLayers command**: Added Layer 8 (Security Forensics) to the layers listing - previously only showed 7 layers
- **LandingFeatures.tsx**: Updated from 6 to 8 layers with correct descriptions for AdaptiveLearn and SecurityForensics
- **UI Components**: Created missing components (badge.tsx, button.tsx, glowing-border.tsx) in landing/src/components/ui/
- **Marketing copy**: Updated "All 6 code-fixing layers" to "All 8 code-fixing layers"

### CLI Output Improvements (December 10, 2025)
- **Centralized output utility**: Created `shared-core/cli-output.js` with TTY detection, NO_COLOR/CI env support, and consistent severity-to-stream routing
- **Colorized spinner**: Updated `simple-ora.js` to use colors when TTY detected, text-based symbols ([OK], [ERROR], [WARN], [INFO]) for accessibility
- **Proper stderr routing**: Errors and warnings now consistently route to stderr across all CLI components
- **Actionable hints**: Added HINTS map in CLIReporter for severity-specific and category-specific guidance
- **No emojis**: All output uses text-based symbols per user preference
- **TTY-aware colors**: Colors automatically disabled in CI environments or when output is piped

### SEO Optimization (December 10, 2025)
- **2 New Blog Posts**: "ESLint vs NeuroLint" comparison and "React 19 Migration Guide 2025"
- **Updated blog metadata**: SEO-optimized titles and descriptions for all 9 blog posts
- **Keyword focus**: React code fixer, ESLint alternative, React hydration error fix, React 19 migration
- **Sitemap updated**: Added new blog posts with high priority (0.9)
- **Docs SEO**: Updated Layer 4 (Hydration) and migrate-react19 docs with keyword-rich titles
- **Structured content**: Added FAQ sections, table of contents, and internal links for better indexing

### Verified Components
- All 132 tests passing including 60+ Layer 8 security forensics tests
- Layer 8 CLI commands fully functional (scan-compromise, create-baseline, compare-baseline, incident-response)
- 80 IoC signatures with behavioral and signature analyzers
- CVE-2025-55182 detection and patching operational