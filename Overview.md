# NeuroLint CLI - Replit Project

## Overview

This is the NeuroLint CLI project - a deterministic code transformation tool for React, Next.js, and TypeScript projects with an **8-layer progressive architecture** including Security Forensics. The project includes:

- **CLI Tool**: Command-line interface for code analysis, transformation, and security forensics
- **Landing Page**: React/Vite frontend showcasing the tool's features
- **Core Engine**: AST-based transformation utilities
- **Layer 8 Security Forensics**: Post-exploitation detection and incident response capabilities

## Project Architecture

### Frontend (Landing Page)
- **Framework**: React 19.2 with Vite 4.5
- **Location**: `landing/` directory
- **Build Output**: `dist/` directory
- **Dev Server**: http://localhost:5000 (configured for Replit proxy)

### Backend/CLI
- **Core Files**: `cli.js`, `ast-transformer.js`, `backup-manager.js`, etc.
- **Scripts**: Transformation layers in `scripts/` directory
- **Shared Core**: Common utilities in `shared-core/`

## Recent Changes

**December 8, 2025** - Version 2.2.0 - React 19 Security Patterns

Added React 19-specific behavioral analysis patterns (BEHAV-023 to BEHAV-027):
- BEHAV-023: React 19 use() with User Input detection
- BEHAV-024: useActionState with Code Execution patterns  
- BEHAV-025: useOptimistic XSS Risk detection
- BEHAV-026: startTransition Data Leak patterns
- BEHAV-027: Server Cache Poisoning Risk detection

Test suite expanded to 132 tests (all passing), including AST-based detection with nested property traversal and 4 negative regression tests for benign patterns (static URLs, URL objects, database queries) to prevent false positives per "never break code" principle.

**December 8, 2025** - Version 2.1.0 - Layer 8 Security Hardening

Security improvements to Layer 8 Security Forensics:

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
- WebSocket attacks in RSC actions
- Service Worker registration exploitation
- PWA manifest injection
- Response caching manipulation
- Streaming response exploitation
- FormData injection attacks

**Other Improvements:**
- Windows path compatibility with normalizePath()
- PathPattern checking for IOC-024
- Rate limiting for large scans
- Base64 threshold increased to 500+ chars to reduce false positives

**December 7, 2025** - Version 1.5.0 - Layer 8 Security Forensics (Major Release)

NeuroLint now has an **8-layer progressive architecture**. Layer 8 adds comprehensive post-exploitation detection and incident response capabilities.

**Key Features:**
- 80 IoC (Indicator of Compromise) signatures across 11 detection categories
- RSC-specific and Next.js-specific attack detection (30 tailored signatures)
- Baseline integrity verification with SHA-256 hashing
- Timeline reconstruction via git history analysis
- 4 reporting formats: SARIF (GitHub Security), JSON, HTML, CLI

**New Commands:**
- `security:scan-compromise` - Fast IoC scan with modes: quick/standard/deep/paranoid
- `security:create-baseline` - Create integrity baseline for drift detection
- `security:compare-baseline` - Compare current state against baseline
- `security:incident-response` - Full forensic analysis for SOC teams

**Architecture:**
- Layer 8 follows "never break code" principle - READ-ONLY by default
- Integrates with Layer 7 (Adaptive) via `securityFindings[]` event
- SARIF 2.1.0 compliant for GitHub Security tab integration
- Exit codes with `--fail-on` for CI/CD gating

**Documentation:**
- Complete specification: `docs/LAYER-8-SECURITY-FORENSICS.md`
- 114+ comprehensive tests in `__tests__/layer-8-security.test.js`
- Test fixtures covering all IoC categories

**December 6, 2025** - Version 1.4.5 - Bug Fix
- Fixed `security:cve-2025-55182` backup creation bug where array was passed instead of string path
- Fixed backup result display showing `[object Object]` instead of actual backup path
- Improved error handling for backup failures with proper warning messages

**December 6, 2025** - Version 1.4.4 + New Demo Recording
- Updated README tests badge from 297 to 457 passing tests
- Created new asciinema demo recording (`landing/public/demo.cast`) showing real CLI output
- Demo shows CVE-2025-55182 security scan and fix on demo-project
- Added `scripts/generate-demo-cast.js` to regenerate demo recordings
- Demo project reset to vulnerable state for future demonstrations

**December 6, 2025** - Version 1.4.3 + Demo Showcase Project
- Created `demo-project/` with intentional issues across all 7 layers
- CVE-2025-55182 vulnerable dependencies for security patch demos
- Version bumped to 1.4.3, then 1.4.5

**December 3, 2025** - CVE-2025-55182 Constants Centralization (v1.4.2)
- Centralized all CVE-2025-55182 version mappings into `shared-core/security-constants.js`
- Added helper functions: `isVulnerableReactVersion()`, `getPatchedReactVersion()`, etc.
- Removed hardcoded version numbers from `cli.js` for improved maintainability
- Added edge case tests for security vulnerability detection
- Fixed vulnerability detection to handle semver operators correctly
- Version bumped to 1.4.2

**December 3, 2025** - CVE-2025-55182 Security Update (v1.4.1)
- Added `security:cve-2025-55182` command for patching critical React Server Components RCE vulnerability
- Updated CLI with complete Next.js patched version matrix (15.0.5, 15.1.9, 15.2.6, 15.3.6, 15.4.8, 15.5.7, 16.0.7, 16.1.0, 16.2.1)
- Added clarification that React 18 and SPAs are NOT affected
- Updated blog post, README, CLI_USAGE.md, and CHANGELOG with security information
- Version bumped to 1.4.1

**December 2, 2025** - Initial Replit setup
- Upgraded Node.js from v16 to v20 to meet project requirements
- Installed all npm dependencies successfully
- Configured Vite dev server with proper host settings for Replit proxy
- Set up workflow to run frontend on port 5000
- Configured static deployment with build command

## Development Setup

### Running the Project

```bash
npm run dev
```

The development server runs on port 5000 with host `0.0.0.0` and `allowedHosts: true` configured for Replit's proxy environment.

### Building for Production

```bash
npm run build
```

Builds the landing page to the `dist/` directory.

### Running Tests

```bash
npm test
```

## Configuration

### Vite Configuration
- Root directory: `landing/`
- Server port: 5000
- Host: 0.0.0.0 (allows Replit proxy)
- Allowed hosts: true (required for iframe preview)
- API proxy: configured for port 3001 (if needed)

### Deployment
- Type: Static site
- Build command: `npm run build`
- Public directory: `dist/`

## Dependencies

- **Node.js**: 20.x (required)
- **React**: 19.2
- **Vite**: 4.5.14
- **Babel**: For AST transformations
- **Jest**: For testing

## User Preferences

None documented yet.

## Notes

- The project uses Vite's built-in caching, so users may need to do a hard refresh to see updates
- The CLI tool is the main product; the landing page is for demonstration
- All transformations are deterministic and rule-based (not AI-powered)
