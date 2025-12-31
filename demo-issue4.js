#!/usr/bin/env node

/**
 * Demo: Issue #4 Cross-Session Learning
 * Shows how Layer 7 learns from individual layer runs across sessions
 */

const fs = require('fs').promises;
const path = require('path');
const { executeLayers } = require('./fix-master');

async function demo() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  ISSUE #4: Cross-Session Learning Demo                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const demoDir = path.join(__dirname, '.demo-issue4');
  
  try {
    await fs.rm(demoDir, { recursive: true, force: true });
    await fs.rm(path.join(__dirname, '.neurolint'), { recursive: true, force: true });
    await fs.mkdir(demoDir, { recursive: true });

    // Demo file with various issues
    const demoCode = `
import React from 'react';

function MyComponent() {
  console.log('Component rendering');
  console.warn('This is a warning');
  
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

export default MyComponent;
`;

    const demoFile = path.join(demoDir, 'Component.jsx');
    await fs.writeFile(demoFile, demoCode);

    console.log('📝 Original file (Component.jsx):');
    console.log('─────────────────────────────────────────────────────');
    console.log(demoCode);
    console.log('─────────────────────────────────────────────────────\n');

    // SESSION 1: Run Layer 2 only
    console.log('🔧 SESSION 1: Running Layer 2 (Pattern Fixes) only');
    console.log('   This will remove console statements and LOG the transformation\n');
    
    await executeLayers(demoCode, [2], {
      filePath: demoFile,
      dryRun: false,
      verbose: false
    });

    const afterSession1 = await fs.readFile(demoFile, 'utf8');
    console.log('✅ Session 1 Complete - Transformation logged!\n');

    // Check transformation log
    const logPath = path.join(__dirname, '.neurolint', 'transformation-log.json');
    const logData = await fs.readFile(logPath, 'utf8');
    const log = JSON.parse(logData);
    console.log(`📊 Transformation Log: ${log.entries.length} entry stored\n`);

    // SESSION 2: Create new file with similar issues
    const newCode = `
function AnotherComponent() {
  console.log('Another component');
  console.error('Error message');
  return <div>Test</div>;
}
`;

    const newFile = path.join(demoDir, 'Another.jsx');
    await fs.writeFile(newFile, newCode);

    console.log('📝 New file (Another.jsx):');
    console.log('─────────────────────────────────────────────────────');
    console.log(newCode);
    console.log('─────────────────────────────────────────────────────\n');

    console.log('🧠 SESSION 2: Running Layer 7 (Adaptive Learning) only');
    console.log('   Layer 7 will LOAD patterns from Session 1 and apply them!\n');

    await executeLayers(newCode, [7], {
      filePath: newFile,
      dryRun: false,
      verbose: false
    });

    const afterSession2 = await fs.readFile(newFile, 'utf8');

    console.log('✅ Session 2 Complete - Patterns learned and applied!\n');

    console.log('📝 Result (Another.jsx after Layer 7):');
    console.log('─────────────────────────────────────────────────────');
    console.log(afterSession2);
    console.log('─────────────────────────────────────────────────────\n');

    // Show learned rules
    const rulesPath = path.join(__dirname, '.neurolint', 'learned-rules.json');
    try {
      const rulesData = await fs.readFile(rulesPath, 'utf8');
      const rules = JSON.parse(rulesData);
      console.log(`📚 Learned Rules: ${rules.length} patterns in RuleStore\n`);
    } catch (e) {
      console.log('📚 Learned Rules: (checking...)\n');
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  KEY TAKEAWAY                                              ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║  • Session 1: Layer 2 runs → logs transformation           ║');
    console.log('║  • Session 2: Layer 7 runs → reads log → learns patterns  ║');
    console.log('║  • Layer 7 now learns from ANY previous layer run!         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    // Cleanup
    await fs.rm(demoDir, { recursive: true, force: true });

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error.stack);
  }
}

demo();
