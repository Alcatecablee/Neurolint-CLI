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
