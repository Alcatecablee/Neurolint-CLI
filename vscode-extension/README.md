# NeuroLint VS Code Extension

> Deterministic code fixing for TypeScript, JavaScript, React, and Next.js

[![Version](https://img.shields.io/badge/version-1.4.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=neurolint.neurolint-vscode)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![VS Code Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue.svg)](https://marketplace.visualstudio.com/items?itemName=neurolint.neurolint-vscode)

**The only tool that actually FIXES your code** — deterministic, rule-based transformations (NOT AI) that automatically resolve 50+ code issues across 7 progressive layers directly in VS Code.

---

## The Problem

Modern React and Next.js development suffers from repetitive, time-consuming code quality issues:

- **Hydration errors** — `window is not defined`, localStorage accessed during SSR
- **Missing accessibility** — Images without alt text, buttons without aria-labels
- **Framework migrations** — React 19 and Next.js 16 breaking changes require manual fixes
- **Outdated configurations** — TypeScript and Next.js configs causing build failures
- **Inconsistent patterns** — Teams waste hours in code review on style issues

## The Solution

NeuroLint uses deterministic, rule-based transformations — NOT artificial intelligence.

- **AST Parsing** — Understands code structure through Abstract Syntax Trees
- **Pattern Recognition** — Identifies anti-patterns using predefined rules
- **Repeatable Results** — Same input always produces same output
- **No Hallucinations** — No LLM guessing or unpredictable rewrites
- **Auditable** — Every transformation is documented and traceable

---

## Quick Demo

**Before** (Legacy React component):
```tsx
function Button({ children, onClick }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}
```

**After** (Modern, accessible component):
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

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "NeuroLint"
4. Click "Install"

### Manual Installation

1. Download the `.vsix` file from [releases](./releases/)
2. Open VS Code
3. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Via Command Line

```bash
code --install-extension neurolint.neurolint-vscode
```

---

## Commands

Access commands via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

### Core Analysis & Fixes

| Command | Description |
|---------|-------------|
| `NeuroLint: Analyze Current File` | Scan current file for issues |
| `NeuroLint: Analyze Workspace` | Scan entire workspace for issues |
| `NeuroLint: Fix Current File` | Apply automatic fixes to current file |
| `NeuroLint: Fix Workspace` | Apply fixes to entire workspace |
| `NeuroLint: Validate Code` | Validate code without making changes |
| `NeuroLint: Show Statistics` | Display project statistics |

### Migration Tools

| Command | Description |
|---------|-------------|
| `NeuroLint: Migrate to React 19` | Migrate project to React 19 compatibility |
| `NeuroLint: Migrate to Next.js 16` | Migrate project to Next.js 16 |
| `NeuroLint: Migrate to Biome` | Migrate from ESLint/Prettier to Biome |

### Analysis Tools

| Command | Description |
|---------|-------------|
| `NeuroLint: Check React 19 Dependencies` | Check for React 19 incompatibilities |
| `NeuroLint: Check Turbopack Compatibility` | Analyze Turbopack migration readiness |
| `NeuroLint: Detect React Compiler Opportunities` | Find React Compiler optimization candidates |
| `NeuroLint: Assess Router Complexity` | Analyze Next.js router complexity |
| `NeuroLint: Detect React 19.2 Features` | Find React 19.2 adoption opportunities |
| `NeuroLint: Simplify Code` | Reduce project complexity |
| `NeuroLint: Show Layer Documentation` | View layer descriptions |

---

## The 7-Layer Architecture

Each layer builds on the previous, ensuring safe and comprehensive transformations:

| Layer | Name | What It Fixes |
|-------|------|---------------|
| 1 | Configuration | tsconfig.json, next.config.js, package.json modernization |
| 2 | Patterns | HTML entity corruption, console.log, unused imports |
| 3 | Components | React keys, WCAG 2.1 AA accessibility, props |
| 4 | Hydration | SSR guards, client-only API protection |
| 5 | Next.js | 'use client' directives, Server Components, imports |
| 6 | Testing | Error boundaries, test file generation |
| 7 | Adaptive | Custom patterns, project-specific conventions |

---

## Configuration

Configure NeuroLint in VS Code settings (`settings.json`):

```json
{
  "neurolint.apiUrl": "https://app.neurolint.dev/api",
  "neurolint.enabledLayers": [1, 2, 3, 4, 5, 6, 7],
  "neurolint.autoFix": false,
  "neurolint.showInlineHints": true,
  "neurolint.diagnosticsLevel": "warning",
  "neurolint.timeout": 30000
}
```

### Configuration Options

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `neurolint.apiUrl` | string | `https://app.neurolint.dev/api` | NeuroLint API URL |
| `neurolint.enabledLayers` | array | `[1,2,3,4,5,6,7]` | Which analysis layers to enable |
| `neurolint.autoFix` | boolean | `false` | Automatically fix issues on save |
| `neurolint.showInlineHints` | boolean | `true` | Show inline hints for issues |
| `neurolint.diagnosticsLevel` | string | `"warning"` | Minimum level: `error`, `warning`, `info` |
| `neurolint.timeout` | number | `30000` | Analysis timeout in milliseconds |

---

## Features

### Real-time Diagnostics
- Live issue detection as you type
- Inline hints showing problems directly in code
- Quick fix actions from the lightbulb menu

### Code Actions
- Apply fixes from the Problems panel
- One-click fixes via Quick Actions
- Batch fix entire files or workspaces

### Progress Reporting
- Status bar shows analysis state
- Progress indicators for long operations
- Output channel for detailed logs

### Safety Features
- Automatic validation before applying changes
- Backup support through CLI integration
- Dry-run mode available via CLI

---

## Supported File Types

- TypeScript: `.ts`, `.tsx`
- JavaScript: `.js`, `.jsx`

---

## Integration with CLI

For advanced features like backups, CI/CD integration, and batch processing, install the NeuroLint CLI:

```bash
npm install -g @neurolint/cli
```

The VS Code extension and CLI share the same transformation engine, ensuring consistent results.

---

## Troubleshooting

### Extension Not Working

1. Check the output panel: `View > Output > NeuroLint`
2. Verify network connectivity to the API
3. Ensure you're editing a supported file type

### Analysis Taking Too Long

1. Reduce enabled layers in settings
2. Increase timeout if needed
3. Check network latency

### No Diagnostics Appearing

1. Verify `neurolint.showInlineHints` is enabled
2. Check `neurolint.diagnosticsLevel` setting
3. Ensure the file type is supported

---

## Support

- **Issues:** [github.com/Alcatecablee/Neurolint/issues](https://github.com/Alcatecablee/Neurolint/issues)
- **Documentation:** [neurolint.dev/docs](https://neurolint.dev/docs)
- **Email:** clivemakazhu@gmail.com

---

## License

Apache License 2.0

NeuroLint is free and open-source software licensed under Apache 2.0.

- Free forever with no restrictions
- Commercial use allowed
- Modify and distribute as needed
- Includes explicit patent grant

[Read the full license](./LICENSE)

---

**NeuroLint** — Deterministic code fixing. No AI. No surprises.
