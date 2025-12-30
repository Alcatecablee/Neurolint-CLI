#!/usr/bin/env node

/**
 * NeuroLint GitHub Action Wrapper
 * Orchestrates NeuroLint execution with GitHub Actions integration
 * 
 * This script:
 * 1. Reads action inputs
 * 2. Builds NeuroLint command
 * 3. Executes NeuroLint
 * 4. Parses output and sets GitHub Actions outputs
 * 5. Returns proper exit codes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Read GitHub Actions inputs
function getInput(name) {
  const envVar = `INPUT_${name.toUpperCase().replace(/-/g, '_')}`;
  return process.env[envVar] || '';
}

function setOutput(name, value) {
  // Use new GitHub Actions output format via environment file
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `${name}=${value}\n`);
  } else {
    // Fallback for local testing
    console.log(`::set-output name=${name}::${value}`);
  }
}

function setFailed(message) {
  console.error(`::error::${message}`);
  process.exit(1);
}

async function main() {
  try {
    // Parse inputs
    const layers = getInput('layers') || 'all';
    const targetPath = getInput('path') || '.';
    const dryRun = getInput('dry-run') === 'true';
    const verbose = getInput('verbose') === 'true';
    const failOnChanges = getInput('fail-on-changes') === 'true';
    const includePatterns = getInput('include') || '**/*.{ts,tsx,js,jsx,json}';
    const excludePatterns = getInput('exclude') || 'node_modules,dist,.next,coverage,build';

    console.log(`🔍 NeuroLint GitHub Action`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Layers: ${layers}`);
    console.log(`Path: ${targetPath}`);
    console.log(`Dry-run: ${dryRun}`);
    console.log(`Verbose: ${verbose}`);
    console.log(`Fail on changes: ${failOnChanges}`);
    console.log(`Include patterns: ${includePatterns}`);
    console.log(`Exclude patterns: ${excludePatterns}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Build NeuroLint command
    let command = 'npx --yes @neurolint/cli fix';
    
    // Add path
    command += ` "${targetPath}"`;

    // Add layers
    if (layers && layers !== 'all' && layers !== '') {
      command += ` --layers ${layers}`;
    } else if (layers === 'all') {
      command += ` --all-layers`;
    }

    // Add options
    if (dryRun) {
      command += ` --dry-run`;
    }
    if (verbose) {
      command += ` --verbose`;
    }

    // Add file patterns
    if (includePatterns) {
      command += ` --include "${includePatterns}"`;
    }
    if (excludePatterns) {
      const excludeList = excludePatterns.split(',').map(p => `**/${p.trim()}/**`).join(',');
      command += ` --exclude "${excludeList}"`;
    }

    console.log(`📋 Executing: ${command}\n`);

    // Execute NeuroLint
    let output = '';
    let exitCode = 0;

    try {
      output = execSync(command, {
        encoding: 'utf8',
        stdio: 'inherit',
        cwd: process.cwd()
      });
    } catch (error) {
      exitCode = error.status || 1;
      output = error.stdout ? error.stdout.toString() : error.message;
      console.error(`\n⚠️ NeuroLint execution error (exit code: ${exitCode})`);
      console.error(output);
    }

    // Parse results
    const results = parseResults(output);

    // Set GitHub Actions outputs
    setOutput('summary', results.summary);
    setOutput('changes-count', results.changesCount.toString());
    setOutput('affected-files', results.affectedFiles.join('\n'));
    setOutput('layers-run', results.layersRun);

    // Log summary
    console.log(`\n✅ NeuroLint Execution Summary`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Summary: ${results.summary}`);
    console.log(`Changes: ${results.changesCount}`);
    console.log(`Files affected: ${results.affectedFiles.length}`);
    console.log(`Layers run: ${results.layersRun}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // Fail if requested and changes detected
    if (failOnChanges && results.changesCount > 0) {
      setFailed(`❌ Changes detected (fail-on-changes enabled). ${results.changesCount} changes found.`);
    }

    // Exit with NeuroLint's exit code (only fail on actual errors, not on findings)
    if (exitCode !== 0 && exitCode !== 1) {
      process.exit(exitCode);
    }

  } catch (error) {
    setFailed(`❌ Action failed: ${error.message}`);
  }
}

/**
 * Parse NeuroLint output to extract results
 */
function parseResults(output) {
  const results = {
    summary: 'Execution completed',
    changesCount: 0,
    affectedFiles: [],
    layersRun: 'all'
  };

  if (!output) {
    return results;
  }

  // Try to extract change count from output
  const changeMatch = output.match(/(\d+)\s+changes?/i);
  if (changeMatch) {
    results.changesCount = parseInt(changeMatch[1]);
  }

  // Try to extract file count
  const filesMatch = output.match(/(\d+)\s+files?/i);
  if (filesMatch) {
    results.changesCount = Math.max(results.changesCount, parseInt(filesMatch[1]));
  }

  // Extract summary message
  const summaryMatch = output.match(/summary[:\s]+([^\n]+)/i);
  if (summaryMatch) {
    results.summary = summaryMatch[1].trim();
  }

  // Extract which files were affected (basic parsing)
  const fileMatches = output.match(/modified:\s*(.+)/gi);
  if (fileMatches) {
    results.affectedFiles = fileMatches.map(m => m.replace(/modified:\s*/i, '').trim());
  }

  return results;
}

// Run the action
main();
