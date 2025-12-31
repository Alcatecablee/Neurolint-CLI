# Pattern Extraction Module

## Overview

This module provides **generalized AST-based pattern extraction** for NeuroLint's Layer 7 (Adaptive Pattern Learning). It replaces hardcoded pattern extraction with a flexible, extensible system that can learn from arbitrary code transformations.

## Architecture

### Core Components

#### 1. **ASTDiffEngine** (`ast-diff-engine.js`)
- Parses JavaScript/TypeScript/JSX code into Abstract Syntax Trees (AST)
- Compares two ASTs to identify structural differences
- Classifies differences into additions, removals, and modifications
- Extracts transformation patterns from AST diffs

**Key Methods:**
- `parse(code, options)` - Parse code into AST
- `diff(beforeAST, afterAST)` - Compare two ASTs
- `classifyDifferences(diffs)` - Categorize differences
- `extractTransformationPatterns(diffs)` - Extract learnable patterns

#### 2. **PatternClassifier** (`pattern-classifier.js`)
- Classifies patterns into categories (import, jsx, config, security, etc.)
- Calculates confidence scores for patterns
- Generates regex patterns from transformations
- Validates pattern quality

**Key Methods:**
- `classifyPattern(diff, layerId)` - Determine pattern category
- `calculateConfidence(pattern, diff)` - Score pattern confidence
- `generateRegexPattern(diff)` - Create regex from diff
- `validatePattern(pattern)` - Validate pattern quality

#### 3. **Layer1Extractor** (`layer-1-extractor.js`)
- Specialized extractor for config file transformations
- Handles `tsconfig.json`, `next.config.js`, `package.json`
- Detects TypeScript strictness changes
- Learns Next.js configuration patterns
- Tracks dependency and script updates

**Supported Patterns:**
- TypeScript compiler option changes
- Next.js experimental feature additions
- Package.json script additions
- Dependency version updates

#### 4. **Layer3Extractor** (`layer-3-extractor.js`)
- Specialized extractor for React component transformations
- Handles JSX/TSX component changes
- Detects component conversions (HTML → React)
- Learns accessibility improvements
- Tracks React 19 migration patterns

**Supported Patterns:**
- HTML element → React component conversions
- Key prop additions in `.map()`
- Aria-label and accessibility attributes
- forwardRef → direct ref prop (React 19)
- Import additions for new components

#### 5. **GeneralizedExtractor** (`generalized-extractor.js`)
- Generic extractor for arbitrary transformations
- Works with any code transformation
- Detects transformation types automatically
- Provides fallback for unrecognized patterns

**Transformation Types:**
- Code wrapping
- Argument addition
- Property addition
- Conditional wrapping
- Expression replacement
- Code addition/removal

## Usage

### Basic Usage

```javascript
const { Layer1Extractor, Layer3Extractor, GeneralizedExtractor } = require('./pattern-extraction');

// Extract config patterns (Layer 1)
const layer1 = new Layer1Extractor();
const configPatterns = await layer1.extractPatterns(beforeConfig, afterConfig);

// Extract component patterns (Layer 3)
const layer3 = new Layer3Extractor();
const componentPatterns = await layer3.extractPatterns(beforeCode, afterCode);

// Extract generic patterns
const generalized = new GeneralizedExtractor();
const genericPatterns = await generalized.extractGenericPatterns(before, after, layerId);
```

### Integration with Layer 7

The pattern extraction module is automatically integrated into Layer 7's `extractPatterns()` function:

```javascript
// In fix-layer-7-adaptive.js
const patterns = await extractPatterns(beforeCode, afterCode, layerId);
// Automatically routes to appropriate extractor based on file type and layer
```

## Pattern Format

All extractors return patterns in a standardized format:

```javascript
{
  description: 'Human-readable description',
  pattern: /regex-pattern/g,              // Regex to match
  replacement: 'replacement string',      // Or function
  confidence: 0.85,                       // Confidence score (0-1)
  frequency: 1,                           // How often seen
  layer: 3,                              // Which layer created it
  category: 'jsx-component',             // Pattern category
  requiredImport: {                      // Optional: required imports
    module: '@/components/ui/button',
    specifier: 'Button'
  }
}
```

## File Type Detection

The system automatically detects file types:

- **Config**: `tsconfig.json`, `next.config.js`, `package.json`
- **JSX**: React component files with JSX syntax
- **TSX**: TypeScript + JSX files
- **TS**: Pure TypeScript files
- **JS**: Pure JavaScript files

## Pattern Categories

### Layer 1 Categories
- `tsconfig-strict` - TypeScript strictness settings
- `tsconfig-jsx` - JSX transform settings
- `tsconfig-target` - Compilation target
- `nextjs-turbopack` - Turbopack configuration
- `nextjs-images` - Image optimization
- `package-scripts` - NPM scripts
- `package-deps` - Dependencies

### Layer 3 Categories
- `component-conversion` - HTML → React components
- `jsx-key-prop` - Key prop additions
- `accessibility` - Aria-label, alt text
- `react19-forwardRef` - forwardRef migrations
- `react19-refs` - String refs → callback refs
- `component-props` - Prop additions

### Generic Categories
- `import` - Import statements
- `export` - Export statements
- `jsx-component` - JSX elements
- `function` - Function modifications
- `expression` - Expression changes
- `security` - Security-related changes

## Confidence Scoring

Patterns are scored based on:

1. **Category Weight** - Different categories have different base confidence
   - Critical: 0.95 (jsx-key, security)
   - High: 0.85-0.90 (jsx-component, accessibility)
   - Medium: 0.75-0.80 (config, imports)
   - Low: 0.60-0.70 (generic)

2. **Transformation Type** - Certain transformations are more reliable
   - Additions: +0.10 boost
   - Removals: +0.10 boost
   - Modifications: No boost

3. **Complexity** - Complex patterns get penalized
   - Complexity > 5: -0.10
   - Complexity > 10: -0.15

4. **Code Length** - Shorter, focused patterns get boosted
   - Length < 50 chars: +0.05

Minimum confidence is **0.50**, maximum is **0.95**.

## Pattern Validation

All patterns must pass validation:

- Must have description (≥5 characters)
- Must have pattern or code
- Must have valid confidence (0.5-1.0)
- Must have category
- Pattern should not be overly broad

## Backward Compatibility

The new system maintains full backward compatibility:

- Legacy hardcoded patterns are preserved in `extractLegacyPatterns()`
- Existing learned rules remain valid
- RuleStore format unchanged
- If AST extraction fails, falls back to legacy patterns

## Debug Mode

Enable debug logging:

```bash
export NEUROLINT_DEBUG=true
neurolint fix . --layers=7
```

Debug output includes:
- Pattern extraction counts
- Extractor failures
- AST parsing errors
- Pattern validation failures

## Performance

The system is optimized for performance:

- AST parsing is cached when possible
- Only substantial changes trigger pattern extraction
- Patterns are deduplicated to reduce storage
- Complexity analysis prevents expensive patterns

**Typical Performance:**
- Config files: <10ms
- Small components (<100 lines): <50ms
- Large files (>1000 lines): <200ms

## Extending the System

### Adding a New Layer Extractor

1. Create `layer-X-extractor.js`:
```javascript
class LayerXExtractor {
  async extractPatterns(before, after) {
    // Your extraction logic
    return patterns;
  }
}
```

2. Import in `fix-layer-7-adaptive.js`:
```javascript
const LayerXExtractor = require('./pattern-extraction/layer-X-extractor');
```

3. Add to `extractPatterns()` function:
```javascript
if (layerId === X) {
  const extractor = new LayerXExtractor();
  const patterns = await extractor.extractPatterns(before, after);
  // ...
}
```

## Testing

Run tests:
```bash
npm test -- __tests__/fix-layer-7-adaptive.test.js
```

Test individual extractors:
```javascript
const { Layer1Extractor } = require('./pattern-extraction');
const extractor = new Layer1Extractor();
const patterns = await extractor.extractPatterns(before, after);
console.log(patterns);
```

## Troubleshooting

### AST Parsing Fails
- Check for syntax errors in code
- Try with simpler parser options
- Falls back to regex-based extraction

### No Patterns Extracted
- Ensure before ≠ after
- Check if changes are substantial (>5%)
- Enable debug mode to see details

### Pattern Confidence Too Low
- Review pattern complexity
- Check pattern category assignment
- Verify transformation type detection

## Future Enhancements

- Cross-file pattern detection
- Machine learning confidence adjustment
- Pattern effectiveness tracking
- Community pattern marketplace
- Semantic code analysis (beyond structural)

## License

Licensed under Apache License 2.0
Copyright (c) 2025 NeuroLint
