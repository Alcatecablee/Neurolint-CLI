# NeuroLint CLI

## Overview
NeuroLint is a deterministic, rule-based code transformation tool for React, Next.js, and TypeScript projects. It leverages Abstract Syntax Tree (AST) parsing and predefined transformation rules to automatically fix common development issues with high reliability. The tool features an 8-layer progressive architecture designed to resolve a wide range of problems, from configuration errors and hydration issues to critical security vulnerabilities and framework migration challenges.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### 8-Layer Transformation Architecture
The core engine processes code through a progressive 8-layer system, each targeting specific issue categories:
- **Layer 1 - Configuration:** Fixes `tsconfig.json`, `package.json`, and `next.config.js` settings, including Next.js compiler options.
- **Layer 2 - Pattern Fixes:** Addresses common code patterns like console statements, HTML entities, `var` to `const/let` conversion, and unused imports.
- **Layer 3 - Component Fixes:** Enhances accessibility and React best practices by adding `key` props, `alt` attributes, and ARIA labels.
- **Layer 4 - Hydration Guards:** Implements SSR-safe checks for browser-specific API calls (`window`, `document`).
- **Layer 5 - Next.js Optimization:** Migrates deprecated Next.js features, adds `'use client'` directives, and handles React 19 breaking changes.
- **Layer 6 - Testing Infrastructure:** Provides error boundary suggestions and guidance for test scaffolding.
- **Layer 7 - Adaptive Learning:** Learns and stores custom transformation rules based on production patterns with confidence scoring.
- **Layer 8 - Security Forensics:** Detects Indicators of Compromise (IoC) and AST-based behavioral patterns to identify security vulnerabilities, including critical RSC CVEs (CVE-2025-55182, CVE-2025-55183, CVE-2025-55184).

### AST Transformation Engine
The engine uses Babel for parsing, traversing, and generating code, ensuring TypeScript/JSX support. It follows a Parse → Transform → Validate → Backup → Apply design pattern. All transformations are validated, with automatic backups and fallbacks if validation fails. Production-grade error handling includes an error aggregator, circuit breaker pattern, and ReDoS protection.

### Framework Migration Systems
- **Next.js 16 Migrator:** Automates migration tasks such as renaming middleware files, updating experimental features, and handling new caching APIs.
- **React 19 Compatibility:** Updates deprecated `ReactDOM` methods (e.g., `render` to `createRoot().render`) and test utilities.
- **React Compiler Detector:** Identifies manual memoization patterns and suggests optimization opportunities for React Compiler adoption.

### Security Architecture
- **RSC CVE Detection Suite:** Comprehensive detection for CVE-2025-55182 (RCE), CVE-2025-55183 (Source Code Exposure), and CVE-2025-55184 (DoS). It also identifies partially patched versions and recommends fully patched ones (19.0.2, 19.1.3, 19.2.2).
- **Layer 8 IoC Detection:** Incorporates 90 signatures for various attack patterns, including code injection, DoS, data exfiltration, and RSC-specific exploits.
- **Behavioral Analyzer:** Utilizes 32 AST patterns to detect suspicious behaviors related to React 19 hooks and specific CVEs.

### CLI Command System
NeuroLint provides commands for analyzing (`analyze`), fixing (`fix`, `fix-all`), and migrating (`migrate-react19`, `migrate-nextjs-16`) code. It includes global flags like `--dry-run` for previewing changes and `--verbose` for detailed logging. A robust backup system automatically creates timestamped backups with SHA-256 checksums and manages retention.

## External Dependencies

### Code Transformation Stack
- `@babel/parser`: JavaScript/TypeScript/JSX parsing
- `@babel/traverse`: AST node traversal and manipulation
- `@babel/generator`: Code generation from modified AST
- `@babel/types`: AST node type definitions and utilities

### CLI & File System
- `glob`: Pattern-based file discovery
- `cli-cursor`, `restore-cursor`: Terminal cursor control
- `log-symbols`: Cross-platform terminal symbols
- `strip-ansi`: ANSI code removal
- `wcwidth`: Character width calculation

### Frontend (Landing Page)
- `React 19.2` + `React DOM`: UI framework
- `Vite 4.5`: Build tool and dev server
- `TailwindCSS 3.4`: Utility-first CSS framework
- `Lucide React`: Icon library
- `react-syntax-highlighter`: Code snippet display
- `next-themes`: Dark mode support
- `react-router-dom 7.9`: Client-side routing

### Analytics & Monitoring
- `@vercel/analytics`: Usage analytics
- `@vercel/speed-insights`: Performance monitoring

### Testing Infrastructure
- `Jest 30.2`: Test runner
- `@types/jest`: TypeScript definitions for testing

### Build & Development
- `@vitejs/plugin-react`: Vite React plugin
- `autoprefixer`: CSS vendor prefixing
- `postcss`: CSS transformation pipeline
- `TypeScript 5.3`: Type checking (noEmit mode only)