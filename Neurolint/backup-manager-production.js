/**
 * NeuroLint - Production Backup Manager
 * Enhanced backup system for production environments with AES-256-GCM encryption
 * 
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

'use strict';

const BackupManager = require('./backup-manager');
const { BackupEncryption } = require('./backup-encryption');
const path = require('path');
const fs = require('fs').promises;

class ProductionBackupManager extends BackupManager {
  constructor(options = {}) {
    super(options);
    this.environment = options.environment || 'production';
    this.loggerConfig = options.loggerConfig || {};
    
    this.encryption = new BackupEncryption({
      keyPath: options.keyPath || path.join(process.cwd(), '.neurolint', 'encryption-key'),
      compression: options.compression !== false
    });
    
    this.encryptionEnabled = options.encryption !== false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return { success: true };
    
    try {
      if (this.encryptionEnabled) {
        await this.encryption.initialize();
      }
      this.initialized = true;
      
      if (this.loggerConfig.enableConsole) {
        console.log(`[BACKUP] Production backup manager initialized with ${this.encryptionEnabled ? 'encryption enabled' : 'encryption disabled'}`);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createBackup(filePath, label) {
    await this.initialize();
    
    if (this.loggerConfig.enableConsole) {
      console.log(`[BACKUP] Creating ${this.encryptionEnabled ? 'encrypted ' : ''}backup for ${filePath}`);
    }
    
    const baseResult = await super.createBackup(filePath, label);
    
    if (!baseResult.success || !this.encryptionEnabled) {
      return baseResult;
    }
    
    try {
      const backupContent = await fs.readFile(baseResult.backupPath, 'utf8');
      const encryptResult = await this.encryption.encrypt(backupContent);
      
      if (!encryptResult.success) {
        if (this.loggerConfig.enableConsole) {
          console.warn(`[BACKUP] Encryption failed, keeping unencrypted backup`);
        }
        return baseResult;
      }
      
      const encryptedPath = baseResult.backupPath + '.enc';
      await fs.writeFile(encryptedPath, encryptResult.data);
      
      await fs.unlink(baseResult.backupPath);
      
      if (this.loggerConfig.enableConsole) {
        console.log(`[BACKUP] Created encrypted backup: ${path.basename(encryptedPath)}`);
        console.log(`[BACKUP] Compression ratio: ${Math.round((encryptResult.size.encrypted / encryptResult.size.original) * 100)}%`);
      }
      
      return {
        success: true,
        backupPath: encryptedPath,
        encrypted: true,
        originalSize: encryptResult.size.original,
        encryptedSize: encryptResult.size.encrypted
      };
      
    } catch (error) {
      if (this.loggerConfig.enableConsole) {
        console.error(`[BACKUP] Encryption error: ${error.message}`);
      }
      return baseResult;
    }
  }

  async restoreFromBackup(backupPath, targetPath) {
    await this.initialize();
    
    if (this.loggerConfig.enableConsole) {
      console.log(`[BACKUP] Restoring from ${path.basename(backupPath)}`);
    }
    
    const isEncrypted = backupPath.endsWith('.enc');
    
    if (!isEncrypted || !this.encryptionEnabled) {
      return super.restoreFromBackup(backupPath, targetPath);
    }
    
    try {
      const encryptedContent = await fs.readFile(backupPath);
      const decryptResult = await this.encryption.decrypt(encryptedContent);
      
      if (!decryptResult.success) {
        return { success: false, error: 'Decryption failed' };
      }
      
      await fs.writeFile(targetPath, decryptResult.data);
      
      if (this.loggerConfig.enableConsole) {
        console.log(`[BACKUP] Restored decrypted content to ${path.basename(targetPath)}`);
      }
      
      return {
        success: true,
        restoredPath: targetPath,
        backupInfo: {
          path: backupPath,
          content: decryptResult.data,
          wasEncrypted: true
        }
      };
      
    } catch (error) {
      if (this.loggerConfig.enableConsole) {
        console.error(`[BACKUP] Restore error: ${error.message}`);
      }
      return { success: false, error: error.message };
    }
  }

  async listBackups(options = {}) {
    const backups = await super.listBackups(options);
    
    if (!Array.isArray(backups)) {
      return backups;
    }
    
    return backups.map(backup => ({
      ...backup,
      encrypted: backup.path?.endsWith('.enc') || false
    }));
  }

  async rotateEncryptionKeys() {
    if (!this.encryptionEnabled) {
      return { success: false, error: 'Encryption is not enabled' };
    }
    
    await this.initialize();
    
    if (this.loggerConfig.enableConsole) {
      console.log(`[BACKUP] Rotating encryption keys...`);
    }
    
    const result = await this.encryption.rotateKeys();
    
    if (result.success && this.loggerConfig.enableConsole) {
      console.log(`[BACKUP] Key rotation complete. Next rotation due: ${result.nextRotationDue}`);
    }
    
    return result;
  }

  async verifyBackupIntegrity(backupPath) {
    await this.initialize();
    
    try {
      const encryptedContent = await fs.readFile(backupPath);
      
      if (backupPath.endsWith('.enc') && this.encryptionEnabled) {
        return await this.encryption.verifyIntegrity(encryptedContent);
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  getEncryptionStats() {
    if (!this.encryptionEnabled) {
      return { enabled: false };
    }
    
    return {
      enabled: true,
      ...this.encryption.getEncryptionStats()
    };
  }

  async secureDeleteBackup(backupPath) {
    if (this.encryptionEnabled) {
      return await this.encryption.secureDelete(backupPath);
    }
    
    try {
      await fs.unlink(backupPath);
      return { success: true, path: backupPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = { ProductionBackupManager };
