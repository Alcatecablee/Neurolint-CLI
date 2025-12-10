'use strict';

const { COLORS, SYMBOLS, isColorSupported } = require('../../../shared-core/cli-output');

class ErrorAggregator {
  constructor(options = {}) {
    this.errors = [];
    this.warnings = [];
    this.maxErrors = options.maxErrors || 100;
    this.maxWarnings = options.maxWarnings || 100;
    this.verbose = options.verbose || false;
    this.throwOnCritical = options.throwOnCritical || false;
    this.useColors = options.colors !== false && isColorSupported();
  }

  _formatMessage(type, message) {
    const prefix = type === 'critical' ? SYMBOLS.error : 
                   type === 'error' ? SYMBOLS.error : 
                   type === 'warning' ? SYMBOLS.warning : SYMBOLS.info;
    
    if (this.useColors) {
      const color = type === 'critical' || type === 'error' ? COLORS.red :
                    type === 'warning' ? COLORS.yellow : COLORS.cyan;
      return `${color}${prefix}${COLORS.reset} [ErrorAggregator] ${message}`;
    }
    return `${prefix} [ErrorAggregator] ${message}`;
  }

  addError(error, context = {}) {
    if (this.errors.length >= this.maxErrors) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context,
      type: 'error'
    };

    this.errors.push(entry);

    if (this.verbose) {
      const formatted = this._formatMessage('error', `Error: ${entry.message}`);
      process.stderr.write(formatted + '\n');
      if (Object.keys(context).length > 0) {
        process.stderr.write(`  Context: ${JSON.stringify(context)}\n`);
      }
    }
  }

  addWarning(message, context = {}) {
    if (this.warnings.length >= this.maxWarnings) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      message: String(message),
      context,
      type: 'warning'
    };

    this.warnings.push(entry);

    if (this.verbose) {
      const formatted = this._formatMessage('warning', `Warning: ${entry.message}`);
      process.stderr.write(formatted + '\n');
      if (Object.keys(context).length > 0) {
        process.stderr.write(`  Context: ${JSON.stringify(context)}\n`);
      }
    }
  }

  addCritical(error, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context,
      type: 'critical'
    };

    this.errors.push(entry);

    if (this.verbose) {
      const formatted = this._formatMessage('critical', `CRITICAL: ${entry.message}`);
      process.stderr.write(formatted + '\n');
      if (Object.keys(context).length > 0) {
        process.stderr.write(`  Context: ${JSON.stringify(context)}\n`);
      }
    }

    if (this.throwOnCritical) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  hasWarnings() {
    return this.warnings.length > 0;
  }

  getErrorCount() {
    return this.errors.length;
  }

  getWarningCount() {
    return this.warnings.length;
  }

  getErrors() {
    return [...this.errors];
  }

  getWarnings() {
    return [...this.warnings];
  }

  getSummary() {
    const errorsByContext = {};
    for (const error of this.errors) {
      const key = error.context.phase || error.context.file || 'unknown';
      errorsByContext[key] = (errorsByContext[key] || 0) + 1;
    }

    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      criticalErrors: this.errors.filter(e => e.type === 'critical').length,
      errorsByContext,
      truncated: this.errors.length >= this.maxErrors || this.warnings.length >= this.maxWarnings
    };
  }

  clear() {
    this.errors = [];
    this.warnings = [];
  }

  toJSON() {
    return {
      errors: this.errors,
      warnings: this.warnings,
      summary: this.getSummary()
    };
  }
}

module.exports = ErrorAggregator;
