# NeuroLint Licensing Structure

This repository contains code under two different licenses:

## Apache 2.0 Licensed (Open Source)

The following directories are licensed under the Apache License 2.0:

- `/cli.js` - Command-line interface
- `/src/` - Core transformation engine
- `/scripts/` - Fix layers and migration tools
- `/shared-core/` - Shared utilities
- `/api/` - API endpoints for CLI
- `/vscode-extension/` - VS Code extension
- `/landing/` - Landing page website
- `/tests/` - Test suites

You are free to use, modify, and distribute this code under the terms of
the Apache 2.0 license. See the root `LICENSE` file for details.

## Proprietary (All Rights Reserved)

The following directories are proprietary and NOT covered by Apache 2.0:

- `/app/` - SaaS application (dashboard, billing, team features)
- `/lib/` - SaaS-specific libraries
- `/components/` - SaaS UI components
- `/supabase/` - Database schemas and migrations

This code is the intellectual property of NeuroLint and may not be used,
copied, modified, or distributed without explicit permission.
See `app/LICENSE` for details.

## Summary

| Component | License | Can Use Commercially? |
|-----------|---------|----------------------|
| CLI | Apache 2.0 | Yes, freely |
| Core Engine | Apache 2.0 | Yes, freely |
| VS Code Extension | Apache 2.0 | Yes, freely |
| Migration Tools | Apache 2.0 | Yes, freely |
| SaaS Application | Proprietary | No, requires license |
| SaaS Components | Proprietary | No, requires license |

## Questions?

For licensing inquiries: clivemakazhu@gmail.com
