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


const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEMO_PROJECT = path.join(__dirname, '..', 'demo-project');
const OUTPUT_FILE = path.join(__dirname, '..', 'landing', 'public', 'demo.cast');

const header = {
  version: 2,
  width: 100,
  height: 30,
  timestamp: Math.floor(Date.now() / 1000),
  title: "NeuroLint CLI - CVE-2025-55182 Security Fix Demo",
  env: { SHELL: "/bin/bash", TERM: "xterm-256color" }
};

const events = [];
let currentTime = 0;

function addOutput(text, delay = 0.05) {
  currentTime += delay;
  events.push([currentTime, "o", text]);
}

function addTyping(text, charDelay = 0.04) {
  for (const char of text) {
    currentTime += charDelay;
    events.push([currentTime, "o", char]);
  }
}

function addLine(text, delay = 0.02) {
  addOutput(text + "\r\n", delay);
}

function addPrompt() {
  addOutput("\u001b[32m$\u001b[0m ", 0.3);
}

function typeCommand(cmd) {
  addPrompt();
  addTyping(cmd);
  addOutput("\r\n", 0.1);
}

async function runCommand(cmd, args, cwd) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { cwd, env: { ...process.env, FORCE_COLOR: '1' } });
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });
    proc.on('close', () => resolve(output));
  });
}

async function generateDemo() {
  console.log('[+] Generating demo recording...');

  addOutput("\u001b[2J\u001b[H", 0);
  addLine("\u001b[1;36m========================================\u001b[0m", 0.1);
  addLine("\u001b[1;36m   NeuroLint CLI - Security Demo\u001b[0m", 0.05);
  addLine("\u001b[1;36m========================================\u001b[0m", 0.05);
  addLine("", 0.5);

  addLine("\u001b[1;33m[1/4] Checking package.json for vulnerable dependencies...\u001b[0m", 0.3);
  addLine("", 0.2);

  typeCommand("cat package.json | grep -A6 dependencies");
  currentTime += 0.3;

  const pkgJson = JSON.parse(fs.readFileSync(path.join(DEMO_PROJECT, 'package.json'), 'utf8'));
  addLine('  "dependencies": {', 0.05);
  addLine(`    "next": "${pkgJson.dependencies.next}",`, 0.03);
  addLine(`    "react": "${pkgJson.dependencies.react}",`, 0.03);
  addLine(`    "react-dom": "${pkgJson.dependencies['react-dom']}"`, 0.03);
  addLine('  },', 0.03);
  addLine("", 0.5);

  addLine("\u001b[1;33m[2/4] Scanning for CVE-2025-55182 vulnerability...\u001b[0m", 0.3);
  addLine("", 0.2);

  typeCommand("npx @neurolint/cli security:cve-2025-55182 . --dry-run");
  currentTime += 0.5;

  const dryRunOutput = await runCommand('node', [path.join(__dirname, '..', 'cli.js'), 'security:cve-2025-55182', DEMO_PROJECT, '--dry-run']);
  for (const line of dryRunOutput.split('\n')) {
    if (line.trim()) {
      addLine(line, 0.04);
    }
  }
  addLine("", 0.8);

  addLine("\u001b[1;33m[3/4] Applying security fix...\u001b[0m", 0.3);
  addLine("", 0.2);

  typeCommand("npx @neurolint/cli security:cve-2025-55182 . --fix");
  currentTime += 0.5;

  const fixOutput = await runCommand('node', [path.join(__dirname, '..', 'cli.js'), 'security:cve-2025-55182', DEMO_PROJECT, '--fix']);
  for (const line of fixOutput.split('\n')) {
    if (line.trim()) {
      addLine(line, 0.04);
    }
  }
  addLine("", 0.8);

  addLine("\u001b[1;33m[4/4] Verifying fix was applied...\u001b[0m", 0.3);
  addLine("", 0.2);

  typeCommand("cat package.json | grep -A6 dependencies");
  currentTime += 0.3;

  const updatedPkgJson = JSON.parse(fs.readFileSync(path.join(DEMO_PROJECT, 'package.json'), 'utf8'));
  addLine('  "dependencies": {', 0.05);
  addLine(`    "next": "\u001b[32m${updatedPkgJson.dependencies.next}\u001b[0m",`, 0.03);
  addLine(`    "react": "\u001b[32m${updatedPkgJson.dependencies.react}\u001b[0m",`, 0.03);
  addLine(`    "react-dom": "\u001b[32m${updatedPkgJson.dependencies['react-dom']}\u001b[0m"`, 0.03);
  addLine('  },', 0.03);
  addLine("", 0.5);

  addLine("\u001b[1;32m========================================\u001b[0m", 0.1);
  addLine("\u001b[1;32m   Security vulnerability PATCHED!\u001b[0m", 0.05);
  addLine("\u001b[1;32m========================================\u001b[0m", 0.05);
  addLine("", 1);

  const castContent = JSON.stringify(header) + '\n' + events.map(e => JSON.stringify(e)).join('\n');

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, castContent);
  console.log(`[OK] Demo recording saved to: ${OUTPUT_FILE}`);
  console.log(`[i] Duration: ${currentTime.toFixed(2)}s, Events: ${events.length}`);
}

generateDemo().catch(console.error);
