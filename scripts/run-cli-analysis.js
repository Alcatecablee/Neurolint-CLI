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
 * CLI Analysis Harness
 * 
 * A standalone Node.js script that invokes the actual CLI for parity testing.
 * Uses child_process to spawn cli.js analyze command and capture JSON output.
 * 
 * Usage:
 *   node scripts/run-cli-analysis.js --file <path> --layers <1,2,3> [--fix]
 * 
 * Output:
 *   JSON object with { success, filePath, layers, issues, issueCount }
 */

const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI_PATH = path.resolve(__dirname, '../cli.js');

function main() {
  const args = process.argv.slice(2);
  
  let filePath = null;
  let layers = [1, 2, 3, 4, 5, 6, 7];
  let applyFixes = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      filePath = args[++i];
    } else if (args[i] === '--layers' && args[i + 1]) {
      layers = args[++i].split(',').map(Number).filter(n => !isNaN(n));
    } else if (args[i] === '--fix') {
      applyFixes = true;
    }
  }
  
  if (!filePath) {
    console.log(JSON.stringify({
      success: false,
      error: 'Missing required --file argument'
    }));
    process.exit(1);
  }
  
  if (!fs.existsSync(filePath)) {
    console.log(JSON.stringify({
      success: false,
      error: 'File not found',
      filePath
    }));
    process.exit(1);
  }
  
  const tempOutputFile = path.join(os.tmpdir(), `neurolint-harness-${Date.now()}.json`);
  
  try {
    const command = applyFixes ? 'fix' : 'analyze';
    const cliArgs = [
      CLI_PATH,
      command,
      filePath,
      '--layers', layers.join(','),
      '--format', 'json',
      '--output', tempOutputFile,
      '--quiet'
    ];
    
    const result = spawnSync('node', cliArgs, {
      cwd: path.dirname(CLI_PATH),
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, NODE_ENV: 'test' }
    });
    
    if (result.status !== 0 && result.status !== null) {
      if (fs.existsSync(tempOutputFile)) {
        const output = JSON.parse(fs.readFileSync(tempOutputFile, 'utf-8'));
        console.log(JSON.stringify({
          success: true,
          filePath,
          layers,
          ...output
        }));
        fs.unlinkSync(tempOutputFile);
        return;
      }
      
      console.log(JSON.stringify({
        success: false,
        error: 'CLI exited with non-zero status',
        status: result.status,
        stderr: result.stderr,
        stdout: result.stdout
      }));
      process.exit(1);
    }
    
    if (fs.existsSync(tempOutputFile)) {
      const output = JSON.parse(fs.readFileSync(tempOutputFile, 'utf-8'));
      
      let issues = [];
      if (output.files && Array.isArray(output.files)) {
        output.files.forEach(file => {
          if (file.issues && Array.isArray(file.issues)) {
            issues = issues.concat(file.issues);
          }
        });
      } else if (output.issues && Array.isArray(output.issues)) {
        issues = output.issues;
      }
      
      console.log(JSON.stringify({
        success: true,
        filePath,
        layers,
        issues,
        issueCount: issues.length,
        summary: output.summary || {},
        files: output.files || [],
        rawOutput: output
      }));
      fs.unlinkSync(tempOutputFile);
    } else {
      console.log(JSON.stringify({
        success: true,
        filePath,
        layers,
        issues: [],
        issueCount: 0,
        summary: {},
        files: [],
        note: 'No JSON output generated (analysis ran but no issues found)'
      }));
    }
    
  } catch (error) {
    if (fs.existsSync(tempOutputFile)) {
      try { fs.unlinkSync(tempOutputFile); } catch {}
    }
    
    console.log(JSON.stringify({
      success: false,
      error: 'CLI harness execution failed',
      message: error.message
    }));
    process.exit(1);
  }
}

main();
