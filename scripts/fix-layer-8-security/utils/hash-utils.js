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
    const { include = ['**/*'], exclude = [] } = options;
    const hashes = {};
    
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
            }
          }
        }
      } catch (error) {
      }
    }
    
    await walkDir(dirPath);
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
