# Changelog

All notable changes to the NeuroLint VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-12-01

### Added
- Extension icon now properly displays on VS Code Marketplace
- Added `icon` field to package.json configuration

### Changed
- Version sync with CLI release 1.4.0
- Updated all documentation version references

## [1.3.9] - 2025-11-25

### Changed
- Version sync with CLI release 1.3.9
- License migrated from Business Source License 1.1 to Apache License 2.0
- NeuroLint is now permanently free and open-source
- Updated all documentation to reflect Apache 2.0 licensing

## [1.2.7] - 2025-11-21

### Added
- Full Next.js 16 migration support via `NeuroLint: Migrate to Next.js 16` command
- React 19 dependency checker via `NeuroLint: Check React 19 Dependencies` command
- Turbopack migration assistant via `NeuroLint: Check Turbopack Compatibility` command
- React Compiler detector via `NeuroLint: Detect React Compiler Opportunities` command
- Router complexity assessor via `NeuroLint: Assess Router Complexity` command
- React 19.2 feature detector via `NeuroLint: Detect React 19.2 Features` command
- Code simplification via `NeuroLint: Simplify Code` command
- Layer documentation via `NeuroLint: Show Layer Documentation` command
- Statistics display via `NeuroLint: Show Statistics` command
- Code validation via `NeuroLint: Validate Code` command

### Changed
- Updated shared core adapter for CLI parity
- Enhanced code action provider with detailed fix descriptions
- Improved error handling with user-friendly messages
- Added progress indicators for long-running operations

## [1.2.0] - 2025-11-20

### Added
- Shared core adapter for CLI integration
- Configuration import/export functionality
- Tree data provider for explorer view
- Webview panel for analysis results

### Changed
- Professional appearance: removed emojis from output
- Enhanced diagnostic provider with better severity mapping
- Improved hover provider with documentation links

## [1.1.0] - 2025-11-19

### Added
- React 19 migration command
- Biome migration command
- Configuration management UI
- API key authentication flow

### Changed
- Updated API client with retry logic
- Enhanced status bar with loading states
- Improved output channel logging

## [1.0.0] - 2025-11-18

### Added
- Initial release
- Core analysis and fix commands
- Real-time diagnostics
- Code action provider with quick fixes
- Hover provider with documentation
- Status bar integration
- Output channel for logs
- Configuration settings

### Features
- 7-layer progressive analysis architecture
- TypeScript, JavaScript, JSX, TSX support
- VS Code settings integration
- API authentication

---

For more information, visit [github.com/Alcatecablee/Neurolint](https://github.com/Alcatecablee/Neurolint)
