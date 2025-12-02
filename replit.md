# NeuroLint CLI

## Overview

NeuroLint CLI is a deterministic, rule-based code transformation tool for TypeScript, JavaScript, React, and Next.js projects. It automates fixes for common code issues like ESLint errors, hydration bugs, and missing React keys using a progressive 7-layer architecture. NeuroLint provides intelligent, predictable code fixes without relying on AI/LLM, ensuring stability and reliability. It is positioned for public release and aims to be the go-to solution for maintaining high code quality in modern web development. All its powerful fixing layers are free to use under the Apache License 2.0.

**Version:** 1.4.0 (December 2025)
**npm Package:** @neurolint/cli
**Repository:** https://github.com/Alcatecablee/Neurolint

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Principle: 5-Step Fail-Safe Orchestration

NeuroLint's critical differentiator is its 5-step fail-safe orchestration system that prevents corrupted code from ever reaching production:

1. **AST-First Transformation** - Attempts precise code transformation using Abstract Syntax Tree parsing
2. **First Validation** - Validates the AST transformation for syntax correctness
3. **Regex Fallback** - Falls back to regex-based transformation if AST fails
4. **Second Validation** - Re-validates the regex transformation
5. **Accept Only If Valid** - Changes only applied if they pass validation, otherwise reverts

### File Structure

```
/
├── cli.js                      # Main CLI entry point (4757 lines)
├── fix-master.js               # Layer orchestration engine (1915 lines)
├── ast-transformer.js          # AST-based transformation engine (1743 lines)
├── validator.js                # Transformation validation
├── backup-manager.js           # Centralized backup management
├── backup-manager-production.js # Production-grade backup with encryption
├── backup-error-handler.js     # Error handling for backups
├── selector.js                 # Layer selection utilities
├── simple-ora.js               # CLI spinner replacement
│
├── scripts/                    # Layer transformation scripts
│   ├── fix-layer-1-config.js   # Configuration fixes
│   ├── fix-layer-2-patterns.js # Pattern fixes
│   ├── fix-layer-3-components.js # Component fixes
│   ├── fix-layer-4-hydration.js # Hydration/SSR fixes
│   ├── fix-layer-5-nextjs.js   # Next.js fixes
│   ├── fix-layer-6-testing.js  # Testing fixes
│   ├── fix-layer-7-adaptive.js # Adaptive learning
│   ├── migrate-nextjs-16.js    # Next.js 16 migration
│   ├── react19-dependency-checker.js
│   ├── turbopack-migration-assistant.js
│   ├── react-compiler-detector.js
│   ├── router-complexity-assessor.js
│   └── react192-feature-detector.js
│
├── shared-core/                # Unified interface for CLI/VS Code/Web
│   ├── index.js               # Main shared core module
│   ├── rule-engine.js         # Rule management
│   ├── config-manager.js      # Configuration management
│   └── analytics.js           # Usage analytics
│
├── landing/                    # React + Vite landing page
│   ├── src/
│   │   ├── main.jsx           # Entry point with routing
│   │   ├── Index.tsx          # Main page component
│   │   ├── Blog.tsx           # Blog list page
│   │   ├── BlogPost.tsx       # Individual blog post page
│   │   ├── LandingHero.tsx    # Hero section
│   │   ├── LandingHeader.tsx  # Header/navigation
│   │   ├── LandingFooter.tsx  # Footer
│   │   ├── LandingFeatures.tsx # Features section
│   │   ├── FAQSection.tsx     # FAQ
│   │   ├── QuickStart.tsx     # Getting started
│   │   └── components/
│   │       ├── InstallCTA.tsx
│   │       ├── LayersDocSection.tsx
│   │       └── ModalDemo.tsx
│   ├── public/                # Static assets
│   └── index.html
│
├── vscode-extension/          # VS Code extension
│   ├── src/
│   │   ├── extension.ts       # Extension entry
│   │   ├── providers/         # VS Code providers
│   │   │   ├── CodeActionProvider.ts
│   │   │   ├── DiagnosticProvider.ts
│   │   │   ├── HoverProvider.ts
│   │   │   └── TreeDataProvider.ts
│   │   ├── ui/
│   │   │   ├── StatusBar.ts
│   │   │   └── Webview.ts
│   │   └── utils/
│   │       ├── SharedCoreAdapter.ts
│   │       └── ConfigurationManager.ts
│   └── releases/              # VSIX packages
│
├── __tests__/                 # Jest test suite (297 tests)
├── demo-project/              # Demo project for testing
├── test-edge-cases/           # Edge case test files
└── test-scripts/              # Test utilities
```

### 7-Layer Progressive Architecture

Each layer builds on the previous, ensuring safe and comprehensive transformations:

| Layer | Name | What It Fixes |
|-------|------|---------------|
| 1 | Configuration | tsconfig.json, next.config.js, package.json modernization |
| 2 | Patterns | HTML entities, console.log removal, unused imports, var→const/let |
| 3 | Components | React keys, accessibility (aria-label, alt), button types |
| 4 | Hydration | SSR guards for localStorage, window, document |
| 5 | Next.js | 'use client' directives, Server Components, imports |
| 6 | Testing | Error boundaries, test file generation |
| 7 | Adaptive | Learns patterns from previous fixes and reapplies them to new files |

## Key Commands

### Core Commands
```bash
neurolint analyze [path]          # Scan for issues
neurolint fix [path]              # Apply automatic fixes
neurolint validate [path]         # Validate without changes
neurolint layers                  # List transformation layers
neurolint stats [path]            # Project statistics
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

### Utility Commands
```bash
neurolint backup                 # Manage backups
neurolint rules                  # Custom rule management
neurolint restore                # Restore from backup
neurolint clean                  # Clean old backups
neurolint init-config            # Initialize configuration
neurolint health                 # System health check
```

### Command Flags
- `--verbose` — Detailed output
- `--dry-run` — Preview changes without applying
- `--backup` — Create backup before modifications
- `--layers=1,2,3` — Apply specific layers
- `--all-layers` — Apply all 7 layers
- `--fix` — Auto-fix issues (for check commands)
- `--production` — Use production-grade backups with encryption

## Implementation Details

### AST Transformer (ast-transformer.js)
- Uses @babel/parser, @babel/traverse, @babel/generator, @babel/types
- Parses code into AST with TypeScript and JSX support
- Provides visitors for each transformation pattern
- Falls back to regex if AST parsing fails

### Validator (validator.js)
- Validates code transformations before applying
- Checks for matching braces and basic syntax
- Static methods: validateCode(), validateFile(), validateTransformation()

### Backup Manager (backup-manager.js)
- Creates timestamped backups with MD5 hashes
- Supports atomic file writes with temp files
- Automatic cleanup of old backups
- Restore from backup with integrity verification

### Shared Core (shared-core/index.js)
- NeuroLintCore class provides unified interface
- SmartLayerSelector for intelligent layer recommendations
- Analytics tracking for usage patterns
- Platform-specific configuration (CLI, VS Code, Web)

## Landing Page

The landing page is a React + Vite application (port 5000) featuring:
- Professional hero section with typewriter effect
- Interactive CLI demo using asciinema-player
- 7-layer documentation section
- FAQ section
- Quick start installation guide
- Responsive design with Tailwind CSS

## VS Code Extension

The extension (version 1.4.0) provides:
- Real-time diagnostics as you type
- Quick fixes via Code Actions
- Hover information for detected issues
- Status bar with project health
- Tree view for issue navigation
- Webview for detailed reports

## External Dependencies

- **@babel/\*** — AST parsing and code generation
- **Jest** — Testing framework (297 tests passing)
- **Vite** — Landing page build tool
- **React 19** — Landing page UI
- **Tailwind CSS** — Styling
- **asciinema-player** — CLI demo player
- **lucide-react** — Icons

## Development

### Running the Landing Page
```bash
npm run dev        # Start Vite dev server on port 5000
npm run build      # Build for production
npm run preview    # Preview production build
```

### Running Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:verbose        # Verbose output
```

### CLI Development
```bash
node cli.js analyze .       # Test analyze command
node cli.js fix . --dry-run # Test fix command
```

## License

Apache License 2.0 - Free forever, commercial use allowed, patent protection included.
