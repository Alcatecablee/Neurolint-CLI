/**
 * NeuroLint - Backup Encryption Utility
 * Provides AES-256-GCM encryption for production backups
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

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const KEY_ROTATION_DAYS = 90;

class BackupEncryption {
  constructor(options = {}) {
    this.algorithm = ALGORITHM;
    this.keyPath = options.keyPath || path.join(process.cwd(), '.neurolint', 'encryption-key');
    this.compressionEnabled = options.compression !== false;
    this.key = null;
    this.keyCreatedAt = null;
    this.salt = null;
    this.stats = {
      encryptionCount: 0,
      decryptionCount: 0,
      lastEncryption: null,
      lastDecryption: null
    };
  }

  async initialize(passphrase) {
    if (!passphrase) {
      passphrase = await this.loadOrCreatePassphrase();
    }
    
    await this.deriveKey(passphrase);
    return { success: true, keyAge: this.getKeyAge() };
  }

  async loadOrCreatePassphrase() {
    try {
      const keyData = await fs.readFile(this.keyPath, 'utf8');
      const parsed = JSON.parse(keyData);
      this.salt = Buffer.from(parsed.salt, 'hex');
      this.keyCreatedAt = new Date(parsed.createdAt);
      return parsed.passphrase;
    } catch (error) {
      const passphrase = crypto.randomBytes(32).toString('hex');
      this.salt = crypto.randomBytes(SALT_LENGTH);
      this.keyCreatedAt = new Date();
      
      const keyDir = path.dirname(this.keyPath);
      await fs.mkdir(keyDir, { recursive: true });
      
      await fs.writeFile(this.keyPath, JSON.stringify({
        passphrase,
        salt: this.salt.toString('hex'),
        createdAt: this.keyCreatedAt.toISOString(),
        algorithm: this.algorithm,
        version: 1
      }), 'utf8');
      
      await fs.chmod(this.keyPath, 0o600);
      
      return passphrase;
    }
  }

  async deriveKey(passphrase) {
    if (!this.salt) {
      this.salt = crypto.randomBytes(SALT_LENGTH);
    }
    
    this.key = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        passphrase,
        this.salt,
        PBKDF2_ITERATIONS,
        KEY_LENGTH,
        'sha512',
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });
  }

  async encrypt(data) {
    if (!this.key) {
      await this.initialize();
    }

    let processedData = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    
    if (this.compressionEnabled) {
      processedData = await gzip(processedData);
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });

    const encrypted = Buffer.concat([
      cipher.update(processedData),
      cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    const header = Buffer.alloc(1);
    header.writeUInt8(this.compressionEnabled ? 1 : 0, 0);

    const result = Buffer.concat([
      header,
      iv,
      authTag,
      encrypted
    ]);

    this.stats.encryptionCount++;
    this.stats.lastEncryption = new Date();

    return {
      success: true,
      data: result,
      size: {
        original: processedData.length,
        encrypted: result.length
      }
    };
  }

  async decrypt(encryptedData) {
    if (!this.key) {
      await this.initialize();
    }

    const buffer = Buffer.isBuffer(encryptedData) 
      ? encryptedData 
      : Buffer.from(encryptedData, 'base64');

    const header = buffer.slice(0, 1);
    const wasCompressed = header.readUInt8(0) === 1;
    
    const iv = buffer.slice(1, 1 + IV_LENGTH);
    const authTag = buffer.slice(1 + IV_LENGTH, 1 + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.slice(1 + IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv, {
      authTagLength: AUTH_TAG_LENGTH
    });
    decipher.setAuthTag(authTag);

    let decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    if (wasCompressed) {
      decrypted = await gunzip(decrypted);
    }

    this.stats.decryptionCount++;
    this.stats.lastDecryption = new Date();

    return {
      success: true,
      data: decrypted.toString('utf8'),
      size: {
        encrypted: buffer.length,
        decrypted: decrypted.length
      }
    };
  }

  async encryptFile(inputPath, outputPath) {
    const content = await fs.readFile(inputPath);
    const encrypted = await this.encrypt(content);
    
    if (encrypted.success) {
      await fs.writeFile(outputPath, encrypted.data);
      return {
        success: true,
        inputPath,
        outputPath,
        originalSize: content.length,
        encryptedSize: encrypted.data.length
      };
    }
    
    return { success: false, error: 'Encryption failed' };
  }

  async decryptFile(inputPath, outputPath) {
    const encryptedContent = await fs.readFile(inputPath);
    const decrypted = await this.decrypt(encryptedContent);
    
    if (decrypted.success) {
      await fs.writeFile(outputPath, decrypted.data);
      return {
        success: true,
        inputPath,
        outputPath,
        encryptedSize: encryptedContent.length,
        decryptedSize: decrypted.data.length
      };
    }
    
    return { success: false, error: 'Decryption failed' };
  }

  getKeyAge() {
    if (!this.keyCreatedAt) return null;
    const now = new Date();
    const diffMs = now - this.keyCreatedAt;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  isRotationDue() {
    const age = this.getKeyAge();
    return age !== null && age >= KEY_ROTATION_DAYS;
  }

  async rotateKeys(newPassphrase) {
    const oldKey = this.key;
    const oldSalt = this.salt;
    
    this.salt = crypto.randomBytes(SALT_LENGTH);
    this.keyCreatedAt = new Date();
    
    if (!newPassphrase) {
      newPassphrase = crypto.randomBytes(32).toString('hex');
    }
    
    await this.deriveKey(newPassphrase);
    
    await fs.writeFile(this.keyPath, JSON.stringify({
      passphrase: newPassphrase,
      salt: this.salt.toString('hex'),
      createdAt: this.keyCreatedAt.toISOString(),
      algorithm: this.algorithm,
      version: 1,
      previousRotation: new Date().toISOString()
    }), 'utf8');
    
    await fs.chmod(this.keyPath, 0o600);

    return {
      success: true,
      previousKeyAge: this.getKeyAge(),
      newKeyCreated: this.keyCreatedAt.toISOString(),
      nextRotationDue: new Date(this.keyCreatedAt.getTime() + KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  getEncryptionStats() {
    return {
      algorithm: this.algorithm,
      keyAge: this.getKeyAge(),
      keyRotationDue: this.isRotationDue(),
      keyRotationDays: KEY_ROTATION_DAYS,
      compressionEnabled: this.compressionEnabled,
      ...this.stats
    };
  }

  async verifyIntegrity(encryptedData) {
    try {
      await this.decrypt(encryptedData);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async secureDelete(filePath) {
    try {
      const stat = await fs.stat(filePath);
      const randomData = crypto.randomBytes(stat.size);
      
      await fs.writeFile(filePath, randomData);
      await fs.writeFile(filePath, Buffer.alloc(stat.size, 0));
      await fs.unlink(filePath);
      
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = { BackupEncryption };
