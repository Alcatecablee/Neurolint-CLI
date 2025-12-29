#!/usr/bin/env node

/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * Comprehensive Layer 3 Edge Case Validation Test
 * Tests all documented edge cases to ensure regex fallback works correctly
 */

const { transform } = require('../scripts/fix-layer-3-components');
const parser = require('@babel/parser');

// Test cases with expected behavior
const testCases = [
  {
    name: 'Simple parameter (no parens)',
    input: '{todos.map(todo => <Todo>{todo}</Todo>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true
  },
  {
    name: 'Simple parameter (with parens)',
    input: '{todos.map((todo) => <Todo>{todo}</Todo>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true
  },
  {
    name: 'Object destructuring',
    input: '{items.map(({ id }) => <Item>{id}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true
  },
  {
    name: 'Two parameters already present',
    input: '{items.map((item, i) => <Item>{item}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,
    noIndexAdd: true  // Should NOT add index param (already has one)
  },
  {
    name: 'Already has key prop',
    input: '{todos.map(todo => <Todo key={todo.id}>{todo}</Todo>)}',
    shouldTransform: false,  // Should not transform (already has key)
    expectKey: true,
    expectValid: true
  },
  {
    name: 'EDGE CASE: Default parameter',
    input: '{items.map((item = {}) => <Item>{item.name}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,  // CRITICAL: Must remain syntactically valid
    critical: true
  },
  {
    name: 'EDGE CASE: Empty callback',
    input: '{items.map(() => <Item>Static</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,  // CRITICAL: Must NOT become (, index)
    critical: true
  },
  {
    name: 'EDGE CASE: Default with destructuring',
    input: '{items.map(({ name = "unknown" }) => <Item>{name}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,
    critical: true
  },
  {
    name: 'EDGE CASE: Multiple defaults',
    input: '{items.map((item = {}, idx = 0) => <Item>{item}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,
    critical: true,
    noIndexAdd: true  // Already has second param
  },
  {
    name: 'EDGE CASE: Nested destructuring',
    input: '{items.map(({ data: { id } }) => <Item>{id}</Item>)}',
    shouldTransform: true,
    expectKey: true,
    expectValid: true,
    critical: true
  }
];

/**
 * Validate syntax using Babel parser
 */
function isValidSyntax(code) {
  try {
    parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      allowImportExportEverywhere: true,
      strictMode: false
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Run all tests and report results
 */
async function runTests() {
  console.log('[TEST] Layer 3 Edge Case Validation Test Suite\n');
  console.log('=' .repeat(80));
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (const testCase of testCases) {
    const { name, input, shouldTransform, expectKey, expectValid, critical, noIndexAdd } = testCase;
    
    try {
      // Wrap in minimal component for testing
      const testCode = `
import React from 'react';
const Todo = ({children}) => <div>{children}</div>;
const Item = ({children}) => <div>{children}</div>;
function Test() {
  const todos = [];
  const items = [];
  return <div>${input}</div>;
}
`;
      
      const result = await transform(testCode, { dryRun: true, verbose: false });
      
      // Validate syntax
      const syntaxValid = isValidSyntax(result.code);
      
      // Check if key prop was added
      const hasKey = result.code.includes('key={');
      
      // Check if index param was added (only if expected)
      const hasIndexParam = result.code.includes(', index)') || result.code.includes('(index)');
      
      // Determine test result
      let testPassed = true;
      const issues = [];
      
      if (expectValid && !syntaxValid) {
        testPassed = false;
        issues.push('[FAIL] SYNTAX ERROR: Produced invalid code');
      }
      
      if (expectKey && !hasKey) {
        testPassed = false;
        issues.push('[FAIL] Missing key prop');
      }
      
      if (noIndexAdd && hasIndexParam && shouldTransform) {
        testPassed = false;
        issues.push('[FAIL] Added index param when it already existed');
      }
      
      if (testPassed) {
        passed++;
        const marker = critical ? '[CRITICAL]' : '[PASS]';
        console.log(`${marker} PASS: ${name}`);
        if (critical) {
          console.log(`   ↳ Critical edge case handled correctly`);
        }
      } else {
        failed++;
        console.log(`[FAIL] FAIL: ${name}`);
        issues.forEach(issue => console.log(`   ↳ ${issue}`));
        failures.push({ name, issues, input, output: result.code });
      }
      
    } catch (error) {
      failed++;
      console.log(`[FAIL] FAIL: ${name}`);
      console.log(`   ↳ Error: ${error.message}`);
      failures.push({ name, issues: [error.message], input });
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\nTest Results: ${passed}/${testCases.length} passed`);
  
  if (failed > 0) {
    console.log(`\nWARNING: ${failed} tests failed:\n`);
    failures.forEach(({ name, issues, input, output }) => {
      console.log(`Failed Test: ${name}`);
      console.log(`Input:  ${input}`);
      if (output) {
        // Extract just the map part from output
        const mapMatch = output.match(/\{[^{]*\.map\([^}]*\}[^}]*\)\s*\}/);
        if (mapMatch) {
          console.log(`Output: ${mapMatch[0]}`);
        }
      }
      issues.forEach(issue => console.log(`  - ${issue}`));
      console.log('');
    });
    
    process.exit(1);
  } else {
    console.log('\nAll tests passed! Layer 3 handles all edge cases correctly.');
    process.exit(0);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
