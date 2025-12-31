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


const fs = require('fs');
const path = require('path');

module.exports = async function globalTeardown() {
  const baseDir = process.cwd();
  const backupDirs = [
    path.join(baseDir, '.neurolint-backups'),
    path.join(baseDir, '.neurolint'),
  ];

  backupDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`[OK] Cleaned up: ${dir}`);
      } catch (error) {
        console.warn(`⚠ Could not clean up ${dir}: ${error.message}`);
      }
    }
  });

  const tmpDirs = fs.readdirSync('/tmp');
  const testDirs = tmpDirs.filter(d => 
    d.startsWith('neurolint-') || 
    d.startsWith('backup-test-') || 
    d.startsWith('error-test-')
  );

  testDirs.forEach(dir => {
    const fullPath = path.join('/tmp', dir);
    try {
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      }
    } catch (error) {
    }
  });

  console.log('[OK] Test cleanup complete');
};
