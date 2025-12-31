#!/usr/bin/env node

/**
 * Test for Issue #4: Cross-Session Learning
 * Verifies that Layer 7 can learn from transformations across different sessions
 */

const fs = require('fs').promises;
const path = require('path');
const { executeLayers } = require('./fix-master');
const { RuleStore, crossSessionManager } = require('./scripts/fix-layer-7-adaptive');

async function testCrossSessionLearning() {
  console.log('🧪 Testing Issue #4: Cross-Session Learning\n');
  
  const testDir = path.join(__dirname, '.neurolint-test-issue4');
  const testFile = path.join(testDir, 'test.js');
  
  try {
    // Clean up any previous test data
    await fs.rm(testDir, { recursive: true, force: true });
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a test file with console.log statements
    const testCode = `
function hello() {
  console.log('Hello world');
  return 'Hello';
}

function goodbye() {
  console.log('Goodbye world');
  return 'Goodbye';
}
`;
    
    await fs.writeFile(testFile, testCode);
    
    console.log('Step 1: Run Layer 2 (console removal) alone');
    console.log('This should log the transformation to .neurolint/transformation-log.json\n');
    
    // Session 1: Run Layer 2 only
    const session1 = await executeLayers(testCode, [2], {
      filePath: testFile,
      dryRun: false,
      verbose: true
    });
    
    console.log(`✓ Session 1 complete: ${session1.successfulLayers} layer(s) executed`);
    console.log(`  Changes made: ${session1.results.find(r => r.layer === 2)?.changeCount || 0}\n`);
    
    // Check if transformation was logged
    const logPath = path.join(process.cwd(), '.neurolint', 'transformation-log.json');
    let logExists = false;
    try {
      await fs.access(logPath);
      logExists = true;
      const logData = await fs.readFile(logPath, 'utf8');
      const log = JSON.parse(logData);
      console.log(`✓ Transformation log exists: ${log.entries?.length || 0} entries\n`);
    } catch (error) {
      console.log('✗ Transformation log not found\n');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Step 2: Create a new file with similar patterns');
    const newTestFile = path.join(testDir, 'test2.js');
    const newTestCode = `
function greet() {
  console.log('Greetings');
  return 'Hi';
}
`;
    
    await fs.writeFile(newTestFile, newTestCode);
    
    console.log('Step 3: Run Layer 7 (adaptive learning) alone on new file');
    console.log('Layer 7 should load patterns from transformation log and apply them\n');
    
    // Session 2: Run Layer 7 only (should learn from logged transformation)
    const ruleStore = new RuleStore();
    await ruleStore.load();
    
    const initialRuleCount = ruleStore.rules.length;
    console.log(`Initial learned rules: ${initialRuleCount}`);
    
    // Load cross-session patterns
    const crossSessionPatterns = await crossSessionManager.loadCrossSessionPatterns(ruleStore);
    console.log(`✓ Loaded ${crossSessionPatterns.length} patterns from cross-session history`);
    
    const finalRuleCount = ruleStore.rules.length;
    console.log(`Final learned rules: ${finalRuleCount}\n`);
    
    // Session 2: Run Layer 7
    const session2 = await executeLayers(newTestCode, [7], {
      filePath: newTestFile,
      dryRun: false,
      verbose: true
    });
    
    console.log(`✓ Session 2 complete: ${session2.successfulLayers} layer(s) executed`);
    
    // Check if patterns were applied
    const layer7Result = session2.results.find(r => r.layer === 7);
    const changesApplied = layer7Result?.changeCount || 0;
    
    console.log(`  Patterns applied: ${changesApplied}\n`);
    
    // Verify results
    let passed = 0;
    let failed = 0;
    
    console.log('📊 Test Results:');
    console.log('─────────────────────────────────────────────────');
    
    // Test 1: Transformation logging works
    if (logExists) {
      console.log('✅ Test 1: Transformation logging works');
      passed++;
    } else {
      console.log('❌ Test 1: Transformation logging failed');
      failed++;
    }
    
    // Test 2: Cross-session patterns loaded
    if (crossSessionPatterns.length > 0) {
      console.log('✅ Test 2: Cross-session pattern loading works');
      passed++;
    } else {
      console.log('❌ Test 2: No patterns loaded from cross-session history');
      failed++;
    }
    
    // Test 3: Rules increased
    if (finalRuleCount > initialRuleCount) {
      console.log('✅ Test 3: Rule store updated with cross-session patterns');
      passed++;
    } else {
      console.log('❌ Test 3: Rule store not updated');
      failed++;
    }
    
    // Test 4: Layer 7 executed successfully
    if (session2.success) {
      console.log('✅ Test 4: Layer 7 executed successfully in isolation');
      passed++;
    } else {
      console.log('❌ Test 4: Layer 7 failed to execute');
      failed++;
    }
    
    console.log('─────────────────────────────────────────────────');
    console.log(`\n📈 Summary: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
      console.log('\n🎉 SUCCESS: Issue #4 (Cross-Session Learning) is WORKING!\n');
      console.log('✅ Layer 7 can now learn from individual layer runs across sessions');
      console.log('✅ Transformation history is persisted');
      console.log('✅ Patterns are extracted from historical transformations');
    } else {
      console.log('\n⚠️  Some tests failed. Review the implementation.\n');
    }
    
    // Cleanup
    await fs.rm(testDir, { recursive: true, force: true });
    
    return failed === 0;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Run test
testCrossSessionLearning().then(success => {
  process.exit(success ? 0 : 1);
});
