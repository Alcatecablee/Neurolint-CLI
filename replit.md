# NeuroLint CLI - Replit Project

## Overview

This is the NeuroLint CLI project - a deterministic code transformation tool for React, Next.js, and TypeScript projects. The project includes:

- **CLI Tool**: Command-line interface for code analysis and transformation
- **Landing Page**: React/Vite frontend showcasing the tool's features
- **Core Engine**: AST-based transformation utilities

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

**December 7, 2025** - Layer 8 Security Forensics - Full Incident Response
- Added `security:incident-response` command for comprehensive security analysis
- New modules: SARIF Reporter (GitHub Security tab), HTML Reporter (visual reports)
- New analyzers: Behavioral Analyzer (AST-based detection), Dependency Differ (package integrity)
- Timeline Reconstructor for git history forensics and suspicious commit detection
- Incident response phases: code-scan, timeline, dependencies, behavioral
- Risk assessment with severity counts and actionable recommendations
- 114 comprehensive tests in `__tests__/layer-8-security.test.js`
- All tests passing

**December 7, 2025** - Layer 8 Security Forensics Implementation Complete
- Implemented complete Layer 8: Security Forensics with 25 IoC signature detectors
- New commands: `security:scan-compromise`, `security:create-baseline`, `security:compare-baseline`
- Detection categories: code-injection, backdoor, data-exfiltration, crypto-mining, obfuscation, supply-chain, rsc-specific
- Scan modes: quick, standard, deep, paranoid
- Baseline system for integrity monitoring with SHA256 hashing
- CLI and JSON reporters with severity breakdowns and remediation guidance
- Architecture follows "never break code" principle - Layer 8 is READ-ONLY by default

**December 7, 2025** - Layer 8 Security Forensics Specification
- Created comprehensive design document for Layer 8: Security Forensics (`docs/LAYER-8-SECURITY-FORENSICS.md`)
- Layer 8 adds post-exploitation detection, compromise scanning, and incident response capabilities
- Extends existing security patching (CVE-2025-55182) with forensic analysis
- Architecture designed to integrate with Layer 7 (Adaptive) for security pattern learning

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
