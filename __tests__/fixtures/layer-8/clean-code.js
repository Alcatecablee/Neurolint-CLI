/**
 * Layer 8 Test Fixture: Clean Code (No IoC Patterns)
 * This file should NOT trigger any detectors
 */

const fs = require('fs').promises;
const path = require('path');

async function readConfig(configPath) {
  const fullPath = path.resolve(__dirname, configPath);
  const content = await fs.readFile(fullPath, 'utf8');
  return JSON.parse(content);
}

function calculateSum(numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US').format(date);
}

class UserService {
  constructor(db) {
    this.db = db;
  }
  
  async findById(id) {
    return this.db.query('SELECT * FROM users WHERE id = $1', [id]);
  }
  
  async create(userData) {
    const { name, email } = userData;
    return this.db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
  }
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  readConfig,
  calculateSum,
  formatDate,
  UserService,
  sanitizeInput
};
