/**
 * NeuroLint - Simple ora replacement for CommonJS compatibility
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

const { COLORS, SYMBOLS, isColorSupported, isTTY } = require('./shared-core/cli-output');

class SimpleSpinner {
  constructor(text) {
    this.text = text;
    this.isSpinning = false;
  }

  _formatOutput(symbol, color, text) {
    if (isColorSupported()) {
      return `${COLORS[color]}${symbol}${COLORS.reset} ${text}\n`;
    }
    return `${symbol} ${text}\n`;
  }

  start() {
    this.isSpinning = true;
    const output = this._formatOutput(SYMBOLS.spinner, 'cyan', `${this.text}...`);
    process.stdout.write(output);
    return this;
  }

  succeed(text) {
    if (this.isSpinning) {
      const output = this._formatOutput(SYMBOLS.success, 'green', text || this.text);
      process.stdout.write(output);
      this.isSpinning = false;
    }
    return this;
  }

  fail(text) {
    if (this.isSpinning) {
      const output = this._formatOutput(SYMBOLS.error, 'red', text || this.text);
      process.stderr.write(output);
      this.isSpinning = false;
    }
    return this;
  }

  warn(text) {
    if (this.isSpinning) {
      const output = this._formatOutput(SYMBOLS.warning, 'yellow', text || this.text);
      process.stderr.write(output);
      this.isSpinning = false;
    }
    return this;
  }

  info(text) {
    if (this.isSpinning) {
      const output = this._formatOutput(SYMBOLS.info, 'cyan', text || this.text);
      process.stdout.write(output);
      this.isSpinning = false;
    }
    return this;
  }

  stop() {
    this.isSpinning = false;
    return this;
  }
}

module.exports = (text) => new SimpleSpinner(text);
