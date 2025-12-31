# ISSUE #3 Implementation Roadmap
## Layer 7: Generalized AST-Based Pattern Extraction

**Status**: In Progress  
**Priority**: MEDIUM (Enhancement)  
**Estimated Effort**: High  
**Started**: December 31, 2025

---

## 🎯 Objective

Transform Layer 7's pattern extraction from **hardcoded specific patterns** to a **generalized AST-based system** that can automatically learn from arbitrary code transformations across all layers.

---

## 📊 Current State Analysis

### Existing Implementation
- **File**: `scripts/fix-layer-7-adaptive.js`
- **Function**: `extractPatterns()` (lines 328-418)
- **Coverage**: 
  - ✅ Layer 5: 'use client' directive detection
  - ✅ Layer 4: typeof window checks
  - ✅ Layer 6: ErrorBoundary & React.memo
  - ✅ Layer 2: Console removal
  - ✅ Layer 8: Security patterns
  - ❌ Layer 1: Config transformations (NOT COVERED)
  - ❌ Layer 3: Component transformations (NOT COVERED)

### Problems
1. **Hardcoded Logic**: All patterns manually coded for specific cases
2. **No AST Diffing**: String-based pattern matching only
3. **Limited Scope**: Cannot learn from arbitrary transformations
4. **Incomplete Coverage**: Missing Layer 1 and Layer 3
5. **Not Scalable**: Adding new patterns requires code changes

---

## 🏗️ Architecture Design

### New Modules Structure

```
scripts/
├── fix-layer-7-adaptive.js (ENHANCED)
├── pattern-extraction/
│   ├── ast-diff-engine.js         (NEW - Core AST diffing)
│   ├── pattern-classifier.js      (NEW - Pattern type detection)
│   ├── layer-1-extractor.js       (NEW - Config pattern extraction)
│   ├── layer-3-extractor.js       (NEW - Component pattern extraction)
│   └── generalized-extractor.js   (NEW - Generic AST-based extraction)
└── ast-transformer.js (EXISTING - Reuse if needed)
```

### Data Flow

```
Before Code → AST Parser → AST Diff Engine → Pattern Classifier
     ↓                                              ↓
After Code  → AST Parser → Transformation Analysis → Extracted Patterns
                                                     ↓
                                              RuleStore (existing)
```

---

## 📋 Implementation Phases

### **PHASE 1: Core AST Diff Engine** ⏳

**Goal**: Build foundation for AST-based pattern extraction

**Files to Create**:
- `scripts/pattern-extraction/ast-diff-engine.js`
- `scripts/pattern-extraction/pattern-classifier.js`

**Key Components**:

#### 1.1 AST Diff Engine
```javascript
class ASTDiffEngine {
  // Parse code into AST (support JS, JSX, TS, TSX)
  parse(code, options)
  
  // Compare two ASTs and find differences
  diff(beforeAST, afterAST)
  
  // Identify transformation types (add, remove, modify, replace)
  classifyDifferences(diffs)
  
  // Extract patterns from differences
  extractTransformationPatterns(diffs)
}
```

**Features**:
- Use `@babel/parser` for AST parsing
- Support multiple file types (JS, JSX, TS, TSX)
- Detect node additions, removals, modifications
- Handle both statement-level and expression-level changes
- Preserve location information for debugging

#### 1.2 Pattern Classifier
```javascript
class PatternClassifier {
  // Determine pattern category from AST diff
  classifyPattern(diff, layerId)
  
  // Generate regex pattern from AST transformation
  generateRegexPattern(diff)
  
  // Create replacement function/string from transformation
  generateReplacement(diff)
  
  // Calculate pattern confidence based on complexity
  calculateConfidence(pattern)
}
```

**Pattern Categories**:
- Import additions/removals
- Component conversions
- Attribute additions
- Code wrapping patterns
- Expression transformations
- Config value changes

**Deliverables**:
- ✅ Functional AST diff engine
- ✅ Pattern classifier with confidence scoring
- ✅ Support for JS/JSX/TS/TSX
- ✅ Unit tests for core functionality

---

### **PHASE 2: Layer 1 Config Pattern Extraction** 🔧

**Goal**: Learn from config file transformations (tsconfig, next.config, package.json)

**Files to Create**:
- `scripts/pattern-extraction/layer-1-extractor.js`

**Key Components**:

#### 2.1 Config Change Detection
```javascript
class Layer1Extractor {
  // Extract patterns from TypeScript config changes
  extractTSConfigPatterns(before, after)
  
  // Extract patterns from Next.js config changes
  extractNextConfigPatterns(before, after)
  
  // Extract patterns from package.json changes
  extractPackageJsonPatterns(before, after)
  
  // Detect config property additions/updates
  detectConfigChanges(beforeObj, afterObj, path)
  
  // Generate learnable patterns from config diffs
  generateConfigPattern(change)
}
```

**Pattern Examples**:
```javascript
// TypeScript strictness pattern
{
  description: "Enable TypeScript strict mode",
  pattern: /"strict"\s*:\s*false/,
  replacement: '"strict": true',
  confidence: 0.95,
  layer: 1,
  category: 'tsconfig-strict'
}

// Next.js Turbopack pattern
{
  description: "Add Turbopack configuration",
  pattern: /experimental\s*:\s*\{(?![^}]*turbo)/,
  replacement: (match) => match.replace('{', '{\n  turbo: { rules: {} },'),
  confidence: 0.85,
  layer: 1,
  category: 'nextjs-turbopack'
}

// Package script update pattern
{
  description: "Add type-check script",
  pattern: /"scripts"\s*:\s*\{([^}]*)\}/,
  replacement: (match, scripts) => {
    if (!scripts.includes('type-check')) {
      return match.replace('}', ',\n  "type-check": "tsc --noEmit"\n}');
    }
    return match;
  },
  confidence: 0.90,
  layer: 1,
  category: 'package-scripts'
}
```

**Challenges**:
- JSON config files require different parsing (not AST)
- Need to handle nested object structures
- Must preserve formatting preferences
- Some patterns are version-specific

**Solution**:
- Use JSON diff library for config files
- Detect deep changes in nested structures
- Generate patterns that maintain JSON validity
- Tag patterns with version requirements

**Deliverables**:
- ✅ Config file diff detection
- ✅ Pattern extraction for tsconfig.json
- ✅ Pattern extraction for next.config.js
- ✅ Pattern extraction for package.json
- ✅ Integration with RuleStore

---

### **PHASE 3: Layer 3 Component Pattern Extraction** ⚛️

**Goal**: Learn from React component transformations

**Files to Create**:
- `scripts/pattern-extraction/layer-3-extractor.js`

**Key Components**:

#### 3.1 Component Transformation Detection
```javascript
class Layer3Extractor {
  // Extract patterns from JSX transformations
  extractJSXPatterns(beforeAST, afterAST)
  
  // Detect HTML → React component conversions
  detectComponentConversions(diff)
  
  // Extract attribute addition patterns
  extractAttributePatterns(diff)
  
  // Detect import additions from transformations
  extractImportPatterns(diff)
  
  // Extract React 19 migration patterns
  extractReact19Patterns(diff)
  
  // Generate AST-based replacement rules
  generateComponentPattern(transformation)
}
```

**Pattern Examples**:

```javascript
// HTML button → Button component
{
  description: "Convert HTML button to Button component",
  pattern: /<button(\s+[^>]*)>/gi,
  replacement: '<Button$1>',
  confidence: 0.90,
  layer: 3,
  category: 'component-conversion',
  requiredImport: { module: '@/components/ui/button', specifier: 'Button' }
}

// Key prop in .map()
{
  description: "Add key prop to mapped elements",
  pattern: /\.map\(\((\w+)(?:,\s*(\w+))?\)\s*=>\s*<(\w+)(?![^>]*\bkey=)([^>]*)>/g,
  replacement: (match, item, index, tag, attrs) => {
    const keyVar = index || 'index';
    const needsIndex = !index;
    const params = needsIndex ? `(${item}, index)` : `(${item}, ${index})`;
    return `.map(${params} => <${tag} key={${keyVar}}${attrs}>`;
  },
  confidence: 0.95,
  layer: 3,
  category: 'jsx-key-prop'
}

// aria-label addition
{
  description: "Add aria-label to interactive elements",
  pattern: /<(button|a|input)(?![^>]*aria-label)([^>]*)>/gi,
  replacement: (match, tag, attrs) => {
    const label = tag.charAt(0).toUpperCase() + tag.slice(1);
    return `<${tag} aria-label="${label}"${attrs}>`;
  },
  confidence: 0.85,
  layer: 3,
  category: 'accessibility'
}

// forwardRef → direct ref (React 19)
{
  description: "Convert forwardRef to direct ref prop (React 19)",
  pattern: /const\s+(\w+)\s*=\s*forwardRef\s*\(\s*\((\w+),\s*(\w+)\)\s*=>\s*{([\s\S]*?)}\s*\)/g,
  replacement: 'const $1 = ({ $3, ...$2 }) => {$4}',
  confidence: 0.90,
  layer: 3,
  category: 'react19-forwardRef'
}
```

**AST-Based Detection**:
- Identify JSXElement nodes that changed
- Detect JSXAttribute additions
- Track Import statement changes
- Recognize component wrapping patterns
- Detect function signature changes (forwardRef)

**Challenges**:
- JSX complexity (nested elements, spreads, expressions)
- Context-dependent transformations
- Multiple possible replacement strategies
- Must maintain code validity

**Solution**:
- Use AST traversal to understand context
- Generate multiple pattern candidates with confidence scores
- Validate patterns don't break existing code
- Store patterns with metadata (layer, category, dependencies)

**Deliverables**:
- ✅ JSX transformation detection
- ✅ Component conversion pattern extraction
- ✅ Attribute addition pattern extraction
- ✅ Import management pattern extraction
- ✅ React 19 migration pattern extraction
- ✅ Integration with existing AST transformer

---

### **PHASE 4: Generalized Extractor** 🚀

**Goal**: Create catch-all extractor for any arbitrary transformation

**Files to Create**:
- `scripts/pattern-extraction/generalized-extractor.js`

**Key Components**:

#### 4.1 Generic Pattern Learner
```javascript
class GeneralizedExtractor {
  // Learn from any code transformation
  extractGenericPatterns(beforeCode, afterCode, layerId)
  
  // Detect common transformation types
  detectTransformationType(diff)
  
  // Generate pattern from structural change
  generatePatternFromDiff(diff)
  
  // Validate pattern quality
  validatePattern(pattern, testCases)
  
  // Merge similar patterns
  consolidatePatterns(patterns)
}
```

**Transformation Types**:
1. **Code Wrapping**: `X` → `wrapper(X)`
2. **Argument Addition**: `fn(a)` → `fn(a, b)`
3. **Property Addition**: `{ x }` → `{ x, y }`
4. **Conditional Wrapping**: `X` → `condition ? X : fallback`
5. **Import Addition**: Add new import when pattern used
6. **Expression Replacement**: `oldExpr` → `newExpr`
7. **Statement Injection**: Add statements before/after existing

**Pattern Quality Metrics**:
```javascript
{
  specificity: 0.8,      // How specific is the pattern
  coverage: 0.9,         // How much of the change it captures
  safety: 0.95,          // Likelihood of not breaking code
  applicability: 0.7,    // How often it can be reused
  confidence: 0.85       // Overall confidence score
}
```

**Pattern Consolidation**:
- Detect duplicate/similar patterns
- Merge patterns with overlapping matches
- Increase frequency count for recurring patterns
- Boost confidence for validated patterns

**Deliverables**:
- ✅ Generic transformation detection
- ✅ Pattern generation for arbitrary changes
- ✅ Pattern quality validation
- ✅ Pattern consolidation algorithm
- ✅ Fallback for unrecognized transformations

---

### **PHASE 5: Integration & Enhancement** 🔗

**Goal**: Integrate new system with existing Layer 7 code

**Files to Modify**:
- `scripts/fix-layer-7-adaptive.js` (MAJOR REFACTOR)

**Changes Required**:

#### 5.1 Enhanced extractPatterns() Function

**Before** (lines 328-418):
```javascript
function extractPatterns(before, after, layerId) {
  const patterns = [];
  
  // Hardcoded if-else logic for specific layers
  if (layerId === 5 && after.includes("'use client'")) { ... }
  if (layerId === 6 && after.includes('ErrorBoundary')) { ... }
  // etc.
  
  return patterns;
}
```

**After** (NEW ARCHITECTURE):
```javascript
const ASTDiffEngine = require('./pattern-extraction/ast-diff-engine');
const Layer1Extractor = require('./pattern-extraction/layer-1-extractor');
const Layer3Extractor = require('./pattern-extraction/layer-3-extractor');
const GeneralizedExtractor = require('./pattern-extraction/generalized-extractor');

async function extractPatterns(before, after, layerId) {
  const patterns = [];
  
  try {
    // Determine file type
    const fileType = detectFileType(before, after);
    
    // Route to appropriate extractor
    if (fileType === 'config' && layerId === 1) {
      // Layer 1: Config files
      const extractor = new Layer1Extractor();
      const configPatterns = await extractor.extractPatterns(before, after);
      patterns.push(...configPatterns);
      
    } else if (fileType === 'jsx' && layerId === 3) {
      // Layer 3: Component files
      const extractor = new Layer3Extractor();
      const componentPatterns = await extractor.extractPatterns(before, after);
      patterns.push(...componentPatterns);
      
    } else if (fileType === 'js' || fileType === 'jsx' || fileType === 'ts') {
      // Use generalized AST-based extraction
      const astEngine = new ASTDiffEngine();
      const beforeAST = astEngine.parse(before);
      const afterAST = astEngine.parse(after);
      const diffs = astEngine.diff(beforeAST, afterAST);
      
      const generalizedExtractor = new GeneralizedExtractor();
      const genericPatterns = generalizedExtractor.extractGenericPatterns(
        diffs, 
        layerId
      );
      patterns.push(...genericPatterns);
    }
    
    // Keep existing hardcoded patterns as fallback
    const legacyPatterns = extractLegacyPatterns(before, after, layerId);
    patterns.push(...legacyPatterns);
    
    // Deduplicate and consolidate
    return consolidatePatterns(patterns);
    
  } catch (error) {
    // Fallback to legacy extraction
    return extractLegacyPatterns(before, after, layerId);
  }
}

// Move existing hardcoded logic to legacy function
function extractLegacyPatterns(before, after, layerId) {
  // Existing hardcoded logic here (lines 328-418)
  // Kept as fallback for safety
}
```

#### 5.2 Backward Compatibility

**Approach**: Hybrid System
- Keep existing hardcoded patterns as fallback
- New AST-based system runs first
- If AST extraction fails, use legacy patterns
- Existing learned rules remain valid
- RuleStore format unchanged (no breaking changes)

**Benefits**:
- Zero risk of breaking existing functionality
- Gradual migration path
- Easy rollback if issues arise
- Existing users unaffected

#### 5.3 Performance Optimization

**Considerations**:
- AST parsing is CPU-intensive
- Cache parsed ASTs when possible
- Limit pattern extraction to significant changes
- Skip extraction if before === after
- Use worker threads for large files (future)

**Implementation**:
```javascript
// Add memoization for AST parsing
const astCache = new Map();

function getCachedAST(code, hash) {
  if (astCache.has(hash)) {
    return astCache.get(hash);
  }
  const ast = parser.parse(code);
  astCache.set(hash, ast);
  return ast;
}

// Only extract patterns if substantial changes
function shouldExtractPatterns(before, after) {
  const changeRatio = calculateChangeRatio(before, after);
  return changeRatio > 0.05 && changeRatio < 0.95; // 5-95% changed
}
```

**Deliverables**:
- ✅ Refactored extractPatterns() function
- ✅ Integrated all extractors
- ✅ Backward compatibility maintained
- ✅ Performance optimizations
- ✅ Error handling and fallbacks
- ✅ Comprehensive logging

---

## 🎯 Success Criteria

### Functional Requirements
- [ ] Layer 1 patterns extracted from config changes
- [ ] Layer 3 patterns extracted from component transformations
- [ ] AST-based diffing works for JS/JSX/TS/TSX
- [ ] Patterns stored in existing RuleStore format
- [ ] Backward compatible with existing learned patterns
- [ ] Fallback to legacy patterns if AST fails

### Quality Requirements
- [ ] Pattern confidence scores are accurate
- [ ] No false positives in pattern matching
- [ ] Extracted patterns are reusable
- [ ] System handles syntax errors gracefully
- [ ] Performance acceptable (<500ms per file)

### Coverage Requirements
- [ ] All 8 layers have pattern extraction
- [ ] Config files (JSON, JS modules) supported
- [ ] Component files (JSX, TSX) supported
- [ ] Generic JS/TS transformations supported

---

## 📦 Dependencies

### Existing Dependencies (Already in package.json)
- `@babel/parser` ✅ - AST parsing
- `@babel/traverse` ✅ - AST traversal
- `@babel/types` ✅ - AST node types
- `@babel/generator` ✅ - Code generation from AST

### New Dependencies (if needed)
- `json-diff` - For config file comparison
- `fast-json-patch` - JSON patch operations
- `deep-diff` - Deep object comparison

---

## 🚀 Deployment Strategy

### Phase 1: Development (Current)
- Implement on feature branch
- Extensive local testing
- Code review

### Phase 2: Alpha Testing
- Enable for opt-in users
- Feature flag: `NEUROLINT_EXPERIMENTAL_AST=true`
- Collect feedback and metrics

### Phase 3: Beta Testing
- Enable by default with legacy fallback
- Monitor error rates
- Performance profiling

### Phase 4: Production Release
- Remove legacy fallback (optional)
- Update documentation
- Announce new capability

---

## 📊 Testing Strategy

### Unit Tests
- Test AST diff engine with various code samples
- Test pattern classifier accuracy
- Test each layer extractor independently
- Test pattern consolidation logic

### Integration Tests
- Test full pipeline with real transformations
- Test interaction with existing RuleStore
- Test backward compatibility with old patterns
- Test performance with large files

### Edge Cases
- Empty files
- Syntax errors in before/after code
- Very large files (>10k lines)
- Multiple simultaneous transformations
- Ambiguous transformations

---

## 🔄 Rollback Plan

If issues arise:
1. Disable via environment variable: `NEUROLINT_USE_LEGACY_EXTRACTION=true`
2. Revert to legacy extractPatterns function
3. Keep AST modules in codebase for future fix
4. Log failures for debugging

---

## 📈 Future Enhancements (Post-MVP)

### Machine Learning Integration
- Train ML model on pattern effectiveness
- Automatic confidence adjustment based on success rate
- Pattern recommendation system

### Advanced AST Features
- Semantic code analysis (not just structural)
- Type information integration (TypeScript)
- Cross-file pattern detection
- Pattern templates library

### Performance
- Worker thread parallelization
- Incremental AST parsing
- Pattern extraction streaming for large repos

### UI/CLI Enhancements
- Pattern management CLI commands
- Visual pattern browser
- Pattern export/import marketplace

---

## 📝 Implementation Checklist

### Phase 1: Core AST Diff Engine
- [ ] Create `ast-diff-engine.js` with AST parser
- [ ] Implement AST diff algorithm
- [ ] Create `pattern-classifier.js`
- [ ] Add confidence scoring system
- [ ] Create unit tests

### Phase 2: Layer 1 Extractor
- [ ] Create `layer-1-extractor.js`
- [ ] Implement tsconfig pattern extraction
- [ ] Implement next.config pattern extraction
- [ ] Implement package.json pattern extraction
- [ ] Test with real Layer 1 transformations

### Phase 3: Layer 3 Extractor
- [ ] Create `layer-3-extractor.js`
- [ ] Implement JSX transformation detection
- [ ] Implement component conversion extraction
- [ ] Implement attribute pattern extraction
- [ ] Implement React 19 pattern extraction
- [ ] Test with real Layer 3 transformations

### Phase 4: Generalized Extractor
- [ ] Create `generalized-extractor.js`
- [ ] Implement generic transformation detection
- [ ] Implement pattern quality validation
- [ ] Implement pattern consolidation
- [ ] Test with various transformation types

### Phase 5: Integration
- [ ] Refactor `extractPatterns()` in `fix-layer-7-adaptive.js`
- [ ] Integrate all extractors
- [ ] Add file type detection
- [ ] Implement error handling and fallbacks
- [ ] Add performance optimizations
- [ ] Add comprehensive logging
- [ ] Test end-to-end with all layers

### Phase 6: Validation
- [ ] Run existing test suite (all pass)
- [ ] Test with demo-project transformations
- [ ] Verify backward compatibility
- [ ] Performance benchmarking
- [ ] Memory usage profiling

---

## 🏁 Expected Outcomes

After completion, Layer 7 will:
- ✅ Extract patterns from **ALL 8 layers** (not just 5)
- ✅ Use **AST-based analysis** (not just string matching)
- ✅ Learn from **arbitrary transformations** (not hardcoded)
- ✅ Support **config files and JSX** (comprehensive coverage)
- ✅ Provide **confidence scores** for patterns
- ✅ Remain **backward compatible** with existing learned rules
- ✅ Be **production-ready** with fallbacks and error handling

---

**Document Version**: 1.0  
**Last Updated**: December 31, 2025  
**Next Review**: After Phase 5 completion
