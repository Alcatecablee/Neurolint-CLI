# NeuroLint CLI

## Overview

NeuroLint CLI is a deterministic, rule-based code transformation tool for TypeScript, JavaScript, React, and Next.js projects. It automates fixes for common code issues like ESLint errors, hydration bugs, and missing React keys using a progressive 7-layer architecture. NeuroLint aims to provide intelligent, predictable code fixes without relying on AI/LLM, ensuring stability and reliability. It is positioned for public release and aims to be the go-to solution for maintaining high code quality in modern web development. All its powerful fixing layers are free to use under the Apache License 2.0.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

NeuroLint employs a 7-layer progressive and safe architecture for code transformation, ensuring deterministic, predictable fixes through rule-based transformations, Abstract Syntax Tree (AST) parsing, and pattern recognition. The CLI uses `cli.js` as its entry point, `fix-master.js` for orchestrating fix layers, and supporting modules for AST transformation, backup management, validation, and selection. Core functionalities like analytics, configuration, and the rule engine are in `shared-core/`. The system includes a comprehensive Jest test suite.

The landing page is a static React + Vite application featuring an interactive demo, a professional video player-style CLI demonstration, and documentation of the 7 layers. CLI output replaces emojis with bracketed status indicators like `[SUCCESS]`.

**Key Features & Implementations:**

-   **7-Layer Fixing System:**
    1.  **Configuration:** Optimizes `tsconfig.json`, `next.config.js`, `package.json`.
    2.  **Patterns:** AST-first transformations with regex fallback, handles HTML entities, context-aware `console.log` removal, preserves NeuroLint comments, unused import removal, and syntax validation.
    3.  **Components:** AST-first transformations with regex fallback, handles all parameter patterns, supports paired and self-closing tags, addresses React keys, accessibility, and prop types.
    4.  **Hydration:** AST-first transformations with regex fallback, implements SSR/hydration guards for global objects, and automatic event listener cleanup.
    5.  **Next.js:** Detects React hooks and adds `"use client"` directive, converts `ReactDOM.render()` to `createRoot().render()`, handles `ReactDOM.hydrate()`, and manages `react-dom/client` imports.
    6.  **Testing:** Enhances testing with error boundaries and test generation.
    7.  **Adaptive:** Supports pattern learning and custom rule generation.
-   **Next.js 16 Migration Tools:** Auto-conversion for directives, async parameter conversion, `await` for `cookies()`/`headers()`, and `updateTag()` suggestions.
-   **React 19 Compatibility Tools:** Dependency checker for `package.json` incompatibilities, automated fixes, and `package.json` override suggestions.
-   **Turbopack Migration Assistant:** Detects Webpack configurations, identifies incompatibilities, and suggests SWC migration.
-   **React Compiler Detector:** Identifies manual memoization and recommends React Compiler.
-   **Router Complexity Assessor:** Analyzes route complexity and provides architectural recommendations.
-   **React 19.2 Feature Detector:** Identifies opportunities for `View Transitions`, `useEffectEvent`, and `Activity components`.

## External Dependencies

-   **npm:** Used for publishing and distributing the `@neurolint/cli` package.
-   **Jest:** Employed for comprehensive automated testing.
-   **React, Next.js, TypeScript, JavaScript:** The primary target technologies for code transformation and analysis.
-   **Apache License 2.0:** The open-source license for the CLI, enabling broad adoption.