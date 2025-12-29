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
 * Layer 8: Security Forensics - Hash Utilities
 * 
 * Provides cryptographic hashing utilities for file integrity verification.
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class HashUtils {
  static HASH_ALGORITHM = 'sha256';
  
  static hashString(content) {
    return crypto
      .createHash(this.HASH_ALGORITHM)
      .update(content, 'utf8')
      .digest('hex');
  }
  
  static async hashFile(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return crypto
        .createHash(this.HASH_ALGORITHM)
        .update(content)
        .digest('hex');
    } catch (error) {
      return null;
    }
  }
  
  static async hashDirectory(dirPath, options = {}) {
    const { include = ['**/*'], exclude = [], onProgress } = options;
    const hashes = {};
    let fileCount = 0;
    let lastUpdate = Date.now();
    
    async function walkDir(currentPath) {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relativePath = path.relative(dirPath, fullPath);
          
          const shouldExclude = exclude.some(pattern => {
            if (pattern.includes('*')) {
              const regex = new RegExp(pattern.replace(/\*/g, '.*'));
              return regex.test(relativePath);
            }
            return relativePath.includes(pattern);
          });
          
          if (shouldExclude) continue;
          
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            const hash = await HashUtils.hashFile(fullPath);
            if (hash) {
              hashes[relativePath] = hash;
              fileCount++;
              if (onProgress && Date.now() - lastUpdate > 500) {
                onProgress({ filesScanned: fileCount, currentFile: relativePath });
                lastUpdate = Date.now();
              }
            }
          }
        }
      } catch (error) {
      }
    }
    
    await walkDir(dirPath);
    if (onProgress) {
      onProgress({ filesScanned: fileCount, currentFile: null, done: true });
    }
    return hashes;
  }
  
  static compareHashes(baseline, current) {
    const added = [];
    const removed = [];
    const modified = [];
    const unchanged = [];
    
    const allPaths = new Set([
      ...Object.keys(baseline),
      ...Object.keys(current)
    ]);
    
    for (const filePath of allPaths) {
      const baselineHash = baseline[filePath];
      const currentHash = current[filePath];
      
      if (!baselineHash && currentHash) {
        added.push(filePath);
      } else if (baselineHash && !currentHash) {
        removed.push(filePath);
      } else if (baselineHash !== currentHash) {
        modified.push(filePath);
      } else {
        unchanged.push(filePath);
      }
    }
    
    return {
      added,
      removed,
      modified,
      unchanged,
      hasChanges: added.length > 0 || removed.length > 0 || modified.length > 0
    };
  }
}

module.exports = HashUtils;
