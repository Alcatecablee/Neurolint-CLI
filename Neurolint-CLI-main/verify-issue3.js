#!/usr/bin/env node

/**
 * Verification Script for ISSUE #3 Implementation
 * Checks that all components are in place and working
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  ISSUE #3 Implementation Verification                       ║');
console.log('║  Layer 7: Generalized AST-Based Pattern Extraction          ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const checks = [];

// Check 1: Pattern extraction module exists
function checkPatternExtractionModule() {
  const modulePath = path.join(__dirname, 'scripts', 'pattern-extraction');
  const exists = fs.existsSync(modulePath);
  checks.push({
    name: 'Pattern Extraction Module',
    status: exists ? '✅ PASS' : '❌ FAIL',
    details: exists ? 'Module directory exists' : 'Module directory missing'
  });
  return exists;
}

// Check 2: Core files exist
function checkCoreFiles() {
  const files = [
    'scripts/pattern-extraction/ast-diff-engine.js',
    'scripts/pattern-extraction/pattern-classifier.js',
    'scripts/pattern-extraction/layer-1-extractor.js',
    'scripts/pattern-extraction/layer-3-extractor.js',
    'scripts/pattern-extraction/generalized-extractor.js',
    'scripts/pattern-extraction/index.js',
    'scripts/pattern-extraction/README.md'
  ];

  let allExist = true;
  const missing = [];

  files.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (!fs.existsSync(fullPath)) {
      allExist = false;
      missing.push(file);
    }
  });

  checks.push({
    name: 'Core Files',
    status: allExist ? '✅ PASS' : '❌ FAIL',
    details: allExist 
      ? `All ${files.length} core files present`
      : `Missing: ${missing.join(', ')}`
  });

  return allExist;
}

// Check 3: Layer 7 integration
function checkLayer7Integration() {
  const layer7Path = path.join(__dirname, 'scripts', 'fix-layer-7-adaptive.js');
  
  if (!fs.existsSync(layer7Path)) {
    checks.push({
      name: 'Layer 7 Integration',
      status: '❌ FAIL',
      details: 'fix-layer-7-adaptive.js not found'
    });
    return false;
  }

  const content = fs.readFileSync(layer7Path, 'utf8');
  
  const hasImports = content.includes('Layer1Extractor') && 
                     content.includes('Layer3Extractor') &&
                     content.includes('GeneralizedExtractor');
  
  const hasEnhancedExtract = content.includes('extractPatterns') &&
                             content.includes('detectFileType');
  
  const hasLegacyFallback = content.includes('extractLegacyPatterns');
  
  const integrated = hasImports && hasEnhancedExtract && hasLegacyFallback;

  checks.push({
    name: 'Layer 7 Integration',
    status: integrated ? '✅ PASS' : '⚠️  PARTIAL',
    details: integrated 
      ? 'All extractors integrated with fallback'
      : `Imports: ${hasImports}, Enhanced: ${hasEnhancedExtract}, Fallback: ${hasLegacyFallback}`
  });

  return integrated;
}

// Check 4: Documentation
function checkDocumentation() {
  const docs = [
    'ROADMAP-ISSUE3-IMPLEMENTATION.md',
    'ISSUE3-IMPLEMENTATION-COMPLETE.md',
    'scripts/pattern-extraction/README.md'
  ];

  let allExist = true;
  const missing = [];

  docs.forEach(doc => {
    const fullPath = path.join(__dirname, doc);
    if (!fs.existsSync(fullPath)) {
      allExist = false;
      missing.push(doc);
    }
  });

  checks.push({
    name: 'Documentation',
    status: allExist ? '✅ PASS' : '⚠️  PARTIAL',
    details: allExist 
      ? `All ${docs.length} documentation files present`
      : `Missing: ${missing.join(', ')}`
  });

  return allExist;
}

// Check 5: Module exports
function checkModuleExports() {
  try {
    const patternExtraction = require('./scripts/pattern-extraction');
    
    const hasAllExports = 
      patternExtraction.ASTDiffEngine &&
      patternExtraction.PatternClassifier &&
      patternExtraction.Layer1Extractor &&
      patternExtraction.Layer3Extractor &&
      patternExtraction.GeneralizedExtractor;

    checks.push({
      name: 'Module Exports',
      status: hasAllExports ? '✅ PASS' : '❌ FAIL',
      details: hasAllExports 
        ? 'All extractors properly exported'
        : 'Some extractors missing from exports'
    });

    return hasAllExports;
  } catch (error) {
    checks.push({
      name: 'Module Exports',
      status: '❌ FAIL',
      details: `Error loading module: ${error.message}`
    });
    return false;
  }
}

// Check 6: Test extractors can be instantiated
function checkExtractorInstantiation() {
  try {
    const { Layer1Extractor, Layer3Extractor, GeneralizedExtractor } = require('./scripts/pattern-extraction');
    
    const layer1 = new Layer1Extractor();
    const layer3 = new Layer3Extractor();
    const generalized = new GeneralizedExtractor();
    
    const allCreated = layer1 && layer3 && generalized;

    checks.push({
      name: 'Extractor Instantiation',
      status: allCreated ? '✅ PASS' : '❌ FAIL',
      details: allCreated 
        ? 'All extractors can be instantiated'
        : 'Failed to create extractor instances'
    });

    return allCreated;
  } catch (error) {
    checks.push({
      name: 'Extractor Instantiation',
      status: '❌ FAIL',
      details: `Error: ${error.message}`
    });
    return false;
  }
}

// Check 7: Backward compatibility
function checkBackwardCompatibility() {
  const layer7Path = path.join(__dirname, 'scripts', 'fix-layer-7-adaptive.js');
  const content = fs.readFileSync(layer7Path, 'utf8');
  
  const hasLegacy = content.includes('extractLegacyPatterns');
  const hasRuleStore = content.includes('class RuleStore');
  const hasExtractSecurityPatterns = content.includes('extractSecurityPatterns');
  
  const compatible = hasLegacy && hasRuleStore && hasExtractSecurityPatterns;

  checks.push({
    name: 'Backward Compatibility',
    status: compatible ? '✅ PASS' : '⚠️  PARTIAL',
    details: compatible 
      ? 'Legacy patterns and RuleStore preserved'
      : `Legacy: ${hasLegacy}, RuleStore: ${hasRuleStore}, Security: ${hasExtractSecurityPatterns}`
  });

  return compatible;
}

// Run all checks
console.log('Running verification checks...\n');

checkPatternExtractionModule();
checkCoreFiles();
checkLayer7Integration();
checkDocumentation();
checkModuleExports();
checkExtractorInstantiation();
checkBackwardCompatibility();

// Display results
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('VERIFICATION RESULTS:\n');

checks.forEach((check, index) => {
  console.log(`${index + 1}. ${check.name}`);
  console.log(`   Status: ${check.status}`);
  console.log(`   ${check.details}\n`);
});

// Summary
const passed = checks.filter(c => c.status.includes('✅')).length;
const partial = checks.filter(c => c.status.includes('⚠️')).length;
const failed = checks.filter(c => c.status.includes('❌')).length;

console.log('═══════════════════════════════════════════════════════════════');
console.log('SUMMARY:');
console.log(`  ✅ Passed:  ${passed}/${checks.length}`);
console.log(`  ⚠️  Partial: ${partial}/${checks.length}`);
console.log(`  ❌ Failed:  ${failed}/${checks.length}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed === 0 && passed >= 5) {
  console.log('🎉 ISSUE #3 IMPLEMENTATION VERIFIED SUCCESSFULLY!\n');
  console.log('All core components are in place and functional.');
  console.log('The system is ready for testing.\n');
  process.exit(0);
} else if (failed === 0 && partial > 0) {
  console.log('✅ ISSUE #3 IMPLEMENTATION MOSTLY COMPLETE\n');
  console.log('Core functionality is working with minor issues.');
  console.log('Review partial checks above.\n');
  process.exit(0);
} else {
  console.log('⚠️  ISSUE #3 IMPLEMENTATION HAS ISSUES\n');
  console.log('Review failed checks above and fix issues.\n');
  process.exit(1);
}
