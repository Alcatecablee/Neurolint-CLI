/**
 * NeuroLint - Centralized CLI Output Utility
 * 
 * Provides consistent output formatting with:
 * - TTY detection for colors
 * - NO_COLOR/CI environment support
 * - Proper stderr/stdout routing by severity
 * - Accessible symbols alongside colors
 * 
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0
 */

'use strict';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m'
};

const SYMBOLS = {
  success: '[OK]',
  error: '[ERROR]',
  warning: '[WARN]',
  info: '[INFO]',
  spinner: '[...]',
  arrow: '->',
  bullet: '*'
};

class CLIOutput {
  constructor(options = {}) {
    this.forceColor = options.forceColor || false;
    this.forceNoColor = options.forceNoColor || false;
  }

  isColorSupported() {
    if (this.forceNoColor) return false;
    if (this.forceColor) return true;
    
    if (process.env.NO_COLOR !== undefined) return false;
    if (process.env.FORCE_COLOR !== undefined) return true;
    if (process.env.CI) return false;
    
    return process.stdout.isTTY === true;
  }

  isTTY() {
    return process.stdout.isTTY === true;
  }

  colorize(color, text) {
    if (!this.isColorSupported()) return text;
    const colorCode = COLORS[color];
    if (!colorCode) return text;
    return `${colorCode}${text}${COLORS.reset}`;
  }

  formatSuccess(message) {
    const symbol = SYMBOLS.success;
    if (this.isColorSupported()) {
      return `${COLORS.green}${symbol}${COLORS.reset} ${message}`;
    }
    return `${symbol} ${message}`;
  }

  formatError(message) {
    const symbol = SYMBOLS.error;
    if (this.isColorSupported()) {
      return `${COLORS.red}${symbol}${COLORS.reset} ${message}`;
    }
    return `${symbol} ${message}`;
  }

  formatWarning(message) {
    const symbol = SYMBOLS.warning;
    if (this.isColorSupported()) {
      return `${COLORS.yellow}${symbol}${COLORS.reset} ${message}`;
    }
    return `${symbol} ${message}`;
  }

  formatInfo(message) {
    const symbol = SYMBOLS.info;
    if (this.isColorSupported()) {
      return `${COLORS.cyan}${symbol}${COLORS.reset} ${message}`;
    }
    return `${symbol} ${message}`;
  }

  formatHint(message) {
    const prefix = 'Hint:';
    if (this.isColorSupported()) {
      return `  ${COLORS.dim}${prefix}${COLORS.reset} ${message}`;
    }
    return `  ${prefix} ${message}`;
  }

  success(message) {
    process.stdout.write(this.formatSuccess(message) + '\n');
  }

  error(message, hint = null) {
    process.stderr.write(this.formatError(message) + '\n');
    if (hint) {
      process.stderr.write(this.formatHint(hint) + '\n');
    }
  }

  warning(message, hint = null) {
    process.stderr.write(this.formatWarning(message) + '\n');
    if (hint) {
      process.stderr.write(this.formatHint(hint) + '\n');
    }
  }

  info(message) {
    process.stdout.write(this.formatInfo(message) + '\n');
  }

  log(message) {
    process.stdout.write(message + '\n');
  }

  write(message, stream = 'stdout') {
    if (stream === 'stderr') {
      process.stderr.write(message);
    } else {
      process.stdout.write(message);
    }
  }
}

const defaultOutput = new CLIOutput();

module.exports = {
  CLIOutput,
  COLORS,
  SYMBOLS,
  
  isColorSupported: () => defaultOutput.isColorSupported(),
  isTTY: () => defaultOutput.isTTY(),
  colorize: (color, text) => defaultOutput.colorize(color, text),
  
  formatSuccess: (msg) => defaultOutput.formatSuccess(msg),
  formatError: (msg) => defaultOutput.formatError(msg),
  formatWarning: (msg) => defaultOutput.formatWarning(msg),
  formatInfo: (msg) => defaultOutput.formatInfo(msg),
  formatHint: (msg) => defaultOutput.formatHint(msg),
  
  success: (msg) => defaultOutput.success(msg),
  error: (msg, hint) => defaultOutput.error(msg, hint),
  warning: (msg, hint) => defaultOutput.warning(msg, hint),
  info: (msg) => defaultOutput.info(msg),
  log: (msg) => defaultOutput.log(msg),
  write: (msg, stream) => defaultOutput.write(msg, stream)
};
