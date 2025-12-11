# Changelog

All notable changes to NeuroLint CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.5.3] - 2025-12-11

### Added

#### Layer 8 Security Forensics v2.3.0 - New CVE Detection

Layer 8 has been updated to detect two new React Server Components vulnerabilities disclosed today:

**CVE-2025-55184 (Denial of Service, CVSS 7.5)**
- Malicious request can cause infinite loop during server-side deserialization
- Added 5 new IoC signatures (IOC-081 to IOC-085):
  - Server action infinite loop patterns
  - Recursive self-call detection
  - setImmediate/queueMicrotask/nextTick loop detection
  - RSC payload replay loop patterns
  - Flight protocol deserialization attack surface detection

**CVE-2025-55183 (Source Code Exposure, CVSS 5.3)**
- Malicious request can leak server function source code including hardcoded secrets
- Added 5 new IoC signatures (IOC-086 to IOC-090):
  - Server function toString() exposure
  - Function stringification patterns
  - Hardcoded secrets in server actions
  - Database connection string exposure
  - Error handler source code leaks

**New Behavioral Patterns (BEHAV-028 to BEHAV-032)**
- AST-based detection of infinite loops in server contexts
- Recursive scheduling patterns (setImmediate, queueMicrotask, nextTick)
- Function.toString() exposure in server actions
- Response data containing source code or stack traces

**Enhanced Dependency Assurance**
- Now detects "partially patched" versions (19.0.1, 19.1.2, 19.2.1)
- These versions patched CVE-2025-55182 (RCE) but remain vulnerable to DoS and source exposure
- Fully patched versions: 19.0.2, 19.1.3, 19.2.2

**Verified Numbers**
- 90 total IoC signatures (up from 80)
- 32 behavioral patterns (up from 27)
- 137 passing tests

### Changed
- Version bumped to 1.5.3
- Layer 8 version bumped to 2.3.0

## [1.5.2] - 2025-12-10

### Added

#### CLI Output Improvements
- **Centralized output utility**: Created `shared-core/cli-output.js` with TTY detection, NO_COLOR/CI env support, and consistent severity-to-stream routing
- **Colorized spinner**: Updated `simple-ora.js` to use colors when TTY detected, text-based symbols ([OK], [ERROR], [WARN], [INFO]) for accessibility
- **Proper stderr routing**: Errors and warnings now consistently route to stderr across all CLI components
- **Actionable hints**: Added HINTS map in CLIReporter for severity-specific and category-specific guidance
- **No emojis**: All output uses text-based symbols per user preference
- **TTY-aware colors**: Colors automatically disabled in CI environments or when output is piped

### Changed
- Version bumped to 1.5.2

## [1.5.1] - 2025-12-09

### Added

#### Documentation Expansion
- **20+ new documentation pages**: Created comprehensive docs matching Supabase/Vercel enterprise quality
- **Dark minimalist theme**: Pure black (#000000) backgrounds, zinc-900/zinc-800 surfaces, white text, zinc-800 borders only
- **NO colorful icons**: Removed all emoji-style icons per user preference
- **Command pages**: analyze, fix, migrate-react19, migrate-nextjs-16 with full flag documentation
- **Layer pages**: All 8 layers with real CLI names (Configuration, Patterns, Components, Hydration, Next.js, Testing, Adaptive, Security Forensics)
- **Security pages**: CVE-2025-55182, IoC Detection, Incident Response workflows
- **Guide pages**: CI/CD Integration, Backup & Restore, Troubleshooting
- **Technical pages**: How It Works, AST Transformations with architecture details
- **Sidebar navigation**: All pages accessible via collapsible sidebar sections

#### npm Publishing Preparation
- **package.json cleanup**: Moved frontend-only dependencies to devDependencies
- **engines field**: Updated minimum Node.js version from >=16.0.0 to >=18.0.0 for glob@12 compatibility
- **Lean production dependencies**: CLI now only requires @babel/generator, @babel/parser, @babel/traverse, @babel/types, and glob for runtime

#### Documentation Accuracy Audit
- **Fixed fake layer names**: Replaced ConfigMaster, PatternCleanse, ReactRepair, HydraFix, NextGuard, TestReady, AdaptiveLearn with real CLI names
- **Verified CLI reference**: DocsCliReference.tsx layers output now matches actual `neurolint layers` command
- **Fixed scroll-to-top navigation**: Added useEffect in DocsLayout.tsx to scroll to top on page changes

#### Pre-Publishing Security Audit Fixes
- **CLI handleLayers command**: Added Layer 8 (Security Forensics) to the layers listing - previously only showed 7 layers
- **LandingFeatures.tsx**: Updated from 6 to 8 layers with correct descriptions
- **UI Components**: Created missing components (badge.tsx, button.tsx, glowing-border.tsx)
- **Marketing copy**: Updated "All 6 code-fixing layers" to "All 8 code-fixing layers"

### Fixed

#### Layer 7 Production-Grade Fixes
- **Fixed**: Overly broad `/^/` pattern in `extractPatterns()` that matched everything
  - Now only creates 'use client' patterns for files with actual React hooks (`hasReactHooks`, `hasClientImports` checks)
- **Fixed**: `this` context issue in `executeLayers()` causing `this.backupManager` to be undefined
  - Changed from `this.backupManager` to local `backupManager` instance variables
- **Fixed**: Dry-run mode returning original code instead of transformed code
  - Now returns `updatedCode` so callers can inspect simulated mutations
- **Fixed**: Suggestions inflating `changeCount` metric
  - Suggestions now tracked separately and don't increment transformation counts

### Added
- Verbose error logging in Layer 7 catch blocks (enabled via `NEUROLINT_DEBUG='true'`)
- 41 comprehensive unit tests for Layer 7 in `__tests__/fix-layer-7-adaptive.test.js`
  - RuleStore persistence tests
  - Transform flow tests (including dry-run, suggestions, normalization)
  - Pattern extraction tests with overly broad pattern validation
  - Security pattern extraction tests

### Changed
- Version bumped to 1.5.1

## [1.5.0] - 2025-12-08

### Fixed

#### Layer 8 Performance & Windows Compatibility (Critical)
- **Fixed**: Commands `security:scan-compromise` and `security:incident-response` hanging/timing out
- **Root Cause**: Behavioral analyzer was attempting to parse JSON files with Babel's JavaScript parser
- **Solution**: Added JSON file detection to skip AST parsing (JSON is still scanned via regex signatures)

#### Cross-Platform Path Exclusion
- **Fixed**: Exclusion patterns like `**/.neurolint/**` not working on Windows or for root-level directories
- **Improved**: Pattern matching now extracts core directory names and checks path segments directly
- **Added**: Path normalization for Windows backslash compatibility

### Changed
- Bumped version to 1.5.0

## [1.4.11] - 2025-12-08

### Fixed

#### Pattern Matching Bug (Windows + Root-Level Paths)
- **Critical**: Fixed glob pattern matching for `.neurolint/` and `.neurolint-backups/` exclusions
- Dots in patterns like `.neurolint` were not escaped, causing regex to match any character
- Root-level paths (e.g., `.neurolint/states.json`) weren't matched by `**/.neurolint/**` pattern
- Added proper regex escaping and root-level pattern fallback

## [1.4.10] - 2025-12-08

### Fixed

#### Windows Compatibility Bug
- **Critical**: Fixed path separator issue causing `node_modules` to be scanned on Windows
- Windows uses `\` but exclusion patterns use `/`, causing 6,645 files to be scanned instead of ~12
- Added `.replace(/\\/g, '/')` to normalize paths before exclusion matching

#### Additional Exclusions
- Added `.neurolint/**` to default exclusions (internal state files)
- Added `.neurolint-backups/**` to default exclusions (backup files)

## [1.4.9] - 2025-12-08

### Added

#### React 19 Security Patterns (BEHAV-023 to BEHAV-027)

Added 5 new behavioral analysis patterns specifically targeting React 19 security vulnerabilities:

| Signature | Name | Severity | Detection |
|-----------|------|----------|-----------|
| BEHAV-023 | React 19 use() with User Input | High | Detects user-controlled URLs in use(fetch()) calls |
| BEHAV-024 | useActionState with Code Execution | Critical | Detects eval/exec/spawn in action handlers |
| BEHAV-025 | useOptimistic XSS Risk | High | Detects innerHTML/dangerouslySetInnerHTML in optimistic updates |
| BEHAV-026 | startTransition Data Leak | High | Detects potential data exfiltration in transitions |
| BEHAV-027 | Server Cache Poisoning Risk | High | Detects caching of user-specific sensitive data |

**Technical Implementation:**
- AST-based detection with nested property traversal (not string matching)
- `getRootObject()` walks MemberExpression chains to find root identifiers
- `hasUserInputProperty()` collects property names and checks for tainted sources
- Only flags known user-controlled sources: req/request/context with query/body/params

**Test Coverage:**
- 5 comprehensive tests for BEHAV-023 (2 positive, 3 negative)
- Negative tests ensure "never break code" principle: static URLs, URL objects, database queries
- Test suite expanded to 132 tests (all passing)

### Changed
- Version bumped to 1.4.9

## [2.1.0] - 2025-12-08

### Added

#### Layer 8 Security Hardening

**ReDoS Protection:**
- Added SafeRegex utility with pattern pre-validation to prevent catastrophic backtracking
- Patterns automatically simplified to safer alternatives when dangerous structures detected
- Input chunking for large files to prevent memory exhaustion

**Error Handling:**
- Replaced silent error suppression with ErrorAggregator for proper error tracking
- Per-file error tracking with phase and context information
- Errors cleared between scans for accurate per-file diagnostics

**Memory Management:**
- BehavioralAnalyzer.cleanup() clears currentCode after analysis
- resetForNewScan() methods on all analyzers for proper state cleanup
- Memory monitoring with automatic backpressure during large scans

**New CVE-2025-55182 Signatures (IOC-071 to IOC-080):**
- IOC-071: Server action WebSocket exfiltration
- IOC-072: Server action WebSocket C2 channel
- IOC-073: Malicious service worker registration
- IOC-074: Service worker fetch interception to IP
- IOC-075: PWA manifest tampering with IP
- IOC-076: PWA manifest malicious scope
- IOC-077: Server action response caching attack
- IOC-078: Server action streaming attack
- IOC-079: Server action FormData injection
- IOC-080: Server action bind exploitation

**Other Improvements:**
- Windows path compatibility with normalizePath()
- PathPattern checking for IOC-024
- Rate limiting for large scans
- Base64 threshold increased to 500+ chars to reduce false positives

### Changed
- IoC signature count expanded from 70 to 80
- Test suite expanded from 114 to 127 tests
- Version bumped to 2.1.0

## [1.5.0] - 2025-12-07

### Added

#### Layer 8: Security Forensics (Major Feature)

The most significant addition to NeuroLint - a complete post-exploitation detection and incident response layer. While patches fix vulnerabilities, Layer 8 answers: "Am I already compromised?"

**Core Detection Engine:**
- 70 IoC (Indicator of Compromise) signatures across 11 detection categories
- Signature-based detection with regex and AST pattern matching
- Behavioral analysis for suspicious code execution patterns
- Dependency integrity verification with typosquatting detection

**Detection Categories:**
| Category | Signatures | Coverage |
|----------|------------|----------|
| Code Injection | 10 | eval/atob, Buffer.from, Function constructor, setTimeout with string |
| Obfuscation | 5 | Base64 strings, hex/unicode escapes, JSFuck patterns |
| RSC-Specific | 15 | Server action abuse, credential harvesting, rogue 'use server' |
| Next.js-Specific | 15 | Middleware hijacking, route handler abuse, config injection |
| Backdoor | 7 | Reverse shells, hidden endpoints, SSH keys, webshells |
| Data Exfiltration | 6 | Network beacons, env var theft, AWS credential exfiltration |
| Supply Chain | 5 | Postinstall hooks, git hook tampering, typosquatting |
| Persistence | 4 | System path writes, systemd service, profile modification |
| Crypto Mining | 3 | Mining libraries, worker patterns, stratum protocol |

**New CLI Commands:**
- `security:scan-compromise` - Fast IoC scan with configurable modes (quick/standard/deep/paranoid)
- `security:create-baseline` - Create integrity baseline with SHA-256 hashing
- `security:compare-baseline` - Detect drift from known-good state
- `security:incident-response` - Comprehensive forensic analysis for incident response

**Reporting Formats:**
- **SARIF Reporter** - GitHub Security tab integration (SARIF 2.1.0 compliant)
- **JSON Reporter** - Machine-readable output for CI/CD pipelines
- **HTML Reporter** - Standalone visual reports with full styling
- **CLI Reporter** - Human-readable console output with severity breakdown

**Forensics Capabilities:**
- Timeline reconstruction via git history analysis
- File integrity verification with baseline comparison
- Dependency differ for package integrity
- Behavioral analyzer with AST-based detection
- Evidence collection for SOC teams

**Architecture:**
- Layer 8 follows the "never break code" principle - READ-ONLY by default
- Integrates with Layer 7 (Adaptive) via `securityFindings[]` event
- Scan modes: quick (critical only), standard, deep, paranoid (all patterns)
- Exit codes with `--fail-on` for CI/CD gating

**Documentation:**
- Complete specification document: `docs/LAYER-8-SECURITY-FORENSICS.md`
- 70 IoC signatures documented with MITRE ATT&CK references
- Implementation roadmap and testing strategy

### Changed
- NeuroLint now has **8-layer progressive architecture** (previously 7 layers)
- Updated all documentation to reflect 8-layer architecture
- Version bumped to 1.5.0

### Tests
- 114+ comprehensive tests in `__tests__/layer-8-security.test.js`
- Test fixtures in `__tests__/fixtures/layer-8/` covering all IoC categories
- Full coverage for all detection patterns, reporters, and forensic modules

### Security
- First security scanner built specifically for Next.js + RSC post-exploitation
- Addresses the gap between patching CVE-2025-55182 and detecting if compromise already occurred
- Enables continuous security monitoring via baseline comparison

## [1.4.5] - 2025-12-06

### Fixed
- Fixed `security:cve-2025-55182` backup creation bug where array was passed instead of string path
- Fixed backup result display showing `[object Object]` instead of actual backup path
- Improved error handling for backup failures with proper warning messages

## [1.4.4] - 2025-12-06

### Fixed
- Updated README tests badge from 297 to 457 passing tests
- Ensures npm page displays correct test count

## [1.4.3] - 2025-12-06

### Added
- **Demo Showcase Project** (`demo-project/`) for live demonstrations
  - Comprehensive example with intentional issues across all 7 layers
  - CVE-2025-55182 vulnerable dependencies for security patch demos
  - Complete README with demo commands and expected fixes
  - Real-world patterns: TodoList, UserCard, DataTable, Dashboard, Settings
  - Demonstrates: missing keys, accessibility issues, hydration problems, console.log cleanup

### Changed
- Version bump to 1.4.3 for npm publish
- Updated CLI_USAGE.md version header

### Documentation
- Added demo-project/README.md with step-by-step demonstration guide
- Documented all 7 layer issues present in demo project

## [1.4.2] - 2025-12-05

### Changed
- **License migrated from Business Source License 1.1 to Apache License 2.0**
- NeuroLint CLI is now permanently free and open-source
- Updated all documentation to reflect Apache 2.0 licensing
- Updated package.json, README.md, CONTRIBUTING.md, LICENSE_NOTICES.md
- Added commitment: "This license will never change"
- Centralized CVE-2025-55182 version mappings into `shared-core/security-constants.js`
- Removed hardcoded version numbers from `cli.js` in favor of centralized constants
- Added helper functions for vulnerability detection and patched version retrieval
- Improved maintainability for future security patch updates

### Added
- New `shared-core/security-constants.js` module with:
  - `CVE_2025_55182` constant object with all version mappings
  - `isVulnerableReactVersion()` - detects vulnerable React versions
  - `getPatchedReactVersion()` - returns correct patched version
  - `isVulnerableNextVersion()` - detects vulnerable Next.js versions  
  - `getPatchedNextVersion()` - returns correct patched version
  - `formatPatchedVersionsList()` - formats version lists for display
- Edge case tests for security vulnerability detection

### Fixed
- Security command now uses centralized constants instead of inline version arrays

### Why Apache 2.0?
- Maximum developer trust and adoption
- Enterprise-friendly with explicit patent grant
- Compatible with React/Next.js ecosystem (all use permissive licenses)
- No restrictions on commercial use
- Enables partnerships and integrations

## [1.4.1] - 2025-12-03

### Added

#### CVE-2025-55182 Security Fix Command
- New `security:cve-2025-55182` command for patching critical React Server Components RCE vulnerability
- Automatically detects vulnerable React versions (19.0.0, 19.1.0, 19.1.1, 19.2.0)
- Detects vulnerable Next.js versions (15.x-16.x with App Router)
- Detects vulnerable react-server-dom-webpack, react-server-dom-parcel, react-server-dom-turbopack packages
- Supports `--dry-run` mode to preview changes before applying
- Supports `--fix` mode to automatically update package.json
- Creates automatic backup before applying changes
- Adds package.json overrides for peer dependency conflicts
- Clear messaging about React 18/SPAs not being affected

### Changed
- Updated Next.js patched version matrix: 15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7, 16.0.7, 16.1.0, 16.2.1
- Updated README.md with NOT Affected clarification (React 18, SPAs, Pages Router)
- Updated CLI_USAGE.md with security command documentation
- Landing page blog post updated with React 18/SPA clarification

### Security
- **CRITICAL:** Addresses CVE-2025-55182 (CVSS 10.0) - Remote Code Execution in React Server Components
- Disclosed: December 3, 2025
- Patched versions: React 19.0.1, 19.1.2, 19.2.1

## [1.4.0] - 2025-12-01

### Added
- VS Code extension icon now properly displays on marketplace
- Updated all version references across documentation

### Changed
- Version bump to 1.4.0 for marketplace release
- Synchronized CLI and VS Code extension versions

## [1.3.9] - 2025-11-25

### Changed
- Version bump to 1.3.9 for Reddit and Product Hunt launch
- Prepared repository for public launch

### Meta
- Migrated project to Replit environment
- Updated Node.js to version 20 for compatibility
- Verified all 297 tests passing
- Landing page fully functional

## [1.3.0] - 2025-11-21

### Added

#### Next.js 16 Migration
- Full support for Next.js 16 with comprehensive migration tooling
- Automatic `middleware.ts` → `proxy.ts` migration
- PPR to Cache Components conversion
- Async Request APIs: Updates `cookies()` and `headers()` to use `await`
- Async Params: Converts `({ params })` → `async (props) => { const params = await props.params }`
- Caching APIs: Adds `'use cache'` directives and integrates `cacheLife`/`updateTag()`
- Runtime Configuration: Auto-adds `export const runtime = "nodejs"` to proxy files
- New command: `neurolint migrate-nextjs-16`

#### React 19 Dependency Checker
- New `check-deps` command with intelligent dependency analysis
- Scans `package.json` for React 19 incompatibilities
- Detects issues with Radix UI, Ant Design, next-auth, react-is
- Auto-generates `.npmrc` with `legacy-peer-deps` when needed
- Adds `overrides` to `package.json` for stubborn dependencies
- `--fix` flag for automatic resolution

#### Turbopack Migration Assistant
- New `check-turbopack` command for Webpack → Turbopack migration
- Analyzes Webpack-specific configurations in `next.config.js`
- Identifies incompatible loaders and plugins
- Detects Babel configurations requiring SWC migration
- Recommends Turbopack filesystem caching for performance

#### React Compiler Detector
- New `check-compiler` command for optimization opportunities
- Detects manual `useMemo`, `useCallback`, `React.memo` patterns
- Identifies `useRef` for previous value tracking
- Calculates potential bundle size savings
- Recommends React Compiler when 3+ opportunities found

#### Router Complexity Assessor
- New `assess-router` command for complexity analysis
- Complexity scoring (0-100 scale)
- Detects App Router, Pages Router, middleware, API routes
- Identifies Server/Client Components and SSR/SSG usage
- Recommends optimal setup (plain React vs minimal/full Next.js)
- Provides simplification opportunities

#### React 19.2 Feature Detector
- New `detect-react192` command for modern React adoption
- View Transitions: Finds manual animation code that could use View Transitions API
- useEffectEvent: Identifies `useEffect` callbacks that could benefit from `useEffectEvent`
- Activity Components: Detects `display: none` patterns that could use Activity components

### Changed
- Version bumped from 1.3.4 to 1.4.0
- Updated documentation with Next.js 16 features

### Fixed
- Critical bug fixes in AST parsing and regex handling
- Fixed critical bug in findLineNumber regex handling in React Compiler Detector

### Tests
- 100+ new tests added (297 total, all passing)
- Comprehensive coverage for all migration and analysis tools
- Integration tests with real-world fixtures

## [1.3.4] - 2025-11-20

### Changed
- Professional appearance update: Removed all emojis from documentation and CLI output
- Replaced emojis with professional bracket notation: [SUCCESS], [FAILED], [!], [+], [i], [*]
- Enterprise-friendly output for professional environments
- Version bumped from 1.0.0 to 1.3.4 (matching npm)

### Documentation
- Removed all emojis from README.md, CLI_USAGE.md, CONTRIBUTING.md
- Removed all emojis from CLI output (cli.js)
- Created NPM_PUBLISH_GUIDE.md with comprehensive publishing instructions

### Tests
- All 249 tests still passing

## [1.3.3] - 2025-11-19

### Changed
- License migrated from MIT to Business Source License 1.1 (later changed to Apache 2.0)
- Change Date: 2029-11-22 (no longer applicable)
- Change License: GPL-3.0-or-later after change date (no longer applicable)

### Added
- LICENSE_NOTICES.md documenting all 329 third-party dependencies (direct + transitive)
- BSL headers to all npm-distributed files:
  - Core CLI files: cli.js, server.js, fix-master.js, ast-transformer.js
  - Backup system: backup-manager.js, backup-manager-production.js, backup-error-handler.js
  - Utilities: validator.js, selector.js, simple-ora.js
  - All scripts/ directory transformation files (7 fix layers + 4 migration tools)
  - All shared-core/ modules (analytics.js, config-manager.js, rule-engine.js)
  - All API endpoints: api/analyze.js, api/status.js, api/lib/*, api/result/*, api/stream/*

### Documentation
- Updated package.json with "SEE LICENSE IN LICENSE"
- Updated README.md with BSL references
- Updated CONTRIBUTING.md with BSL information

### Security
- Prevents competitors from cloning and selling NeuroLint as competing SaaS
- Allows internal company use, contributions, and modifications
- Enables enterprise licensing model while maintaining transparency

## [1.0.0] - 2025-11-19

### Added
- Initial public release of NeuroLint CLI
- 7-layer progressive architecture for code transformation
- Layer 1: Configuration Modernization (tsconfig.json, next.config.js, package.json)
- Layer 2: Pattern Standardization (HTML entities, console.log, unused imports)
- Layer 3: Accessibility & Components (React keys, WCAG 2.1 AA compliance)
- Layer 4: SSR/Hydration Safety (localStorage guards, window/document protection)
- Layer 5: Next.js App Router Optimization ('use client', Server Components)
- Layer 6: Testing & Error Handling (error boundaries, test generation)
- Layer 7: Adaptive Pattern Learning (custom rules, project conventions)

### Features
- React 19 migration tools
- Next.js 15.5 migration support
- Biome migration from ESLint/Prettier
- Project simplification tools
- Comprehensive backup system
- AST-based transformations (deterministic, no AI)
- Zero-config operation
- Dry-run mode for safe previews

### Commands
- `neurolint analyze` - Scan for issues
- `neurolint fix` - Apply automatic fixes
- `neurolint validate` - Validate without changes
- `neurolint migrate-react19` - React 19 migration
- `neurolint migrate-biome` - Biome migration
- `neurolint simplify` - Project simplification
- `neurolint stats` - Project statistics
- `neurolint backup` - Backup management
- `neurolint rules` - Custom rule management

### Tests
- 170 tests total, all passing
- CLI tests with exact exit code assertions
- Integration tests with real fixtures
- Error handling tests with specific error message validation
- Backup manager tests including error scenarios
- AST transformer and validator comprehensive test coverage
- Performance tests for large codebases

### Documentation
- Comprehensive README.md with examples and use cases
- Complete CLI_USAGE.md guide
- CONTRIBUTING.md guidelines
- CODE_OF_CONDUCT.md
- Standard repository files (LICENSE, package.json)

### Repository
- GitHub repository: https://github.com/Alcatecablee/Neurolint
- npm package: @neurolint/cli
- Business Source License 1.1
- Ready for community contributions

## [Unreleased]

### Planned
- Web dashboard for visual code transformation
- VS Code extension
- GitHub Action for automated fixes
- Team collaboration features
- Advanced analytics and reporting
- Custom rule marketplace

---

For more information, visit [github.com/Alcatecablee/Neurolint](https://github.com/Alcatecablee/Neurolint)
