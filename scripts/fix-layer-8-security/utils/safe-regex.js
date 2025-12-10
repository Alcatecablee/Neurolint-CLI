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


'use strict';

const REGEX_TIMEOUT_MS = 100;
const MAX_INPUT_LENGTH = 1024 * 1024;
const MAX_PATTERN_COMPLEXITY = 500;

function isPatternSafe(patternStr) {
  const dangerousPatterns = [
    /\(\.\*\)\+/,
    /\(\.\+\)\+/,
    /\(\.\*\)\*/,
    /\(\.\+\)\*/,
    /\([\s\S]*?\)\{0,\d{4,}\}/,
    /\[\\s\\S\]\{0,\d{4,}\}/,
    /\(\?:[^)]+\)\+\+/,
    /\(\?:[^)]+\)\*\*/,
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(patternStr)) {
      return { safe: false, reason: 'Contains catastrophic backtracking pattern' };
    }
  }

  const nestedQuantifiers = /\([^)]*[+*]\)[+*]/;
  if (nestedQuantifiers.test(patternStr)) {
    return { safe: false, reason: 'Contains nested quantifiers' };
  }

  if (patternStr.length > MAX_PATTERN_COMPLEXITY) {
    return { safe: false, reason: 'Pattern too complex' };
  }

  return { safe: true };
}

function simplifyPatternForSafety(pattern) {
  let source = typeof pattern === 'string' ? pattern : pattern.source;
  let flags = typeof pattern === 'string' ? 'gi' : pattern.flags;

  source = source
    .replace(/\[\\s\\S\]\{0,1000\}/g, '[\\s\\S]{0,150}')
    .replace(/\[\\s\\S\]\{0,500\}/g, '[\\s\\S]{0,150}')
    .replace(/\[\\s\\S\]\{0,300\}/g, '[\\s\\S]{0,100}')
    .replace(/\[\\s\\S\]\{0,200\}/g, '[\\s\\S]{0,100}');

  source = source
    .replace(/\(\.\*\)\+/g, '(.*?)')
    .replace(/\(\.\+\)\+/g, '(.+?)')
    .replace(/\(\.\*\)\*/g, '(.*?)')
    .replace(/\(\.\+\)\*/g, '(.+?)');

  return new RegExp(source, flags);
}

function chunkInput(input, maxChunkSize = 50000) {
  if (input.length <= maxChunkSize) {
    return [input];
  }

  const chunks = [];
  const overlap = 500;

  for (let i = 0; i < input.length; i += maxChunkSize - overlap) {
    chunks.push(input.substring(i, i + maxChunkSize));
  }

  return chunks;
}

class SafeRegex {
  constructor(pattern, flags = '') {
    const source = typeof pattern === 'string' ? pattern : pattern.source;
    const patternFlags = typeof pattern === 'string' ? flags : (pattern.flags || flags);

    const safetyCheck = isPatternSafe(source);
    if (!safetyCheck.safe) {
      const simplified = simplifyPatternForSafety(pattern);
      this.pattern = simplified.source;
      this.flags = simplified.flags;
      this.wasSimplified = true;
      this.simplificationReason = safetyCheck.reason;
    } else {
      this.pattern = source;
      this.flags = patternFlags;
      this.wasSimplified = false;
    }

    this.regex = new RegExp(this.pattern, this.flags);
    this.execCount = 0;
    this.maxExecCount = 1000;
  }

  static fromRegExp(regex) {
    return new SafeRegex(regex.source, regex.flags);
  }

  exec(input, options = {}) {
    const maxLength = options.maxInputLength || MAX_INPUT_LENGTH;

    if (input.length > maxLength) {
      return { match: null, truncated: true, originalLength: input.length };
    }

    this.execCount++;
    if (this.execCount > this.maxExecCount) {
      return { match: null, limitReached: true };
    }

    const startTime = Date.now();

    try {
      const match = this.regex.exec(input);
      const elapsed = Date.now() - startTime;

      return { match, elapsed, wasSimplified: this.wasSimplified };
    } catch (error) {
      return { match: null, error: error.message };
    }
  }

  test(input, options = {}) {
    const result = this.exec(input, options);
    return result.match !== null;
  }

  matchAll(input, options = {}) {
    const maxLength = options.maxInputLength || MAX_INPUT_LENGTH;
    const maxMatches = options.maxMatches || 100;
    const chunkSize = options.chunkSize || 50000;

    if (input.length > maxLength) {
      return { matches: [], truncated: true, originalLength: input.length };
    }

    const matches = [];
    const startTime = Date.now();
    const maxTotalTime = options.timeout || REGEX_TIMEOUT_MS * 10;

    const chunks = chunkInput(input, chunkSize);
    let globalOffset = 0;

    for (const chunk of chunks) {
      if (Date.now() - startTime > maxTotalTime) {
        return { matches, timedOut: true, elapsed: Date.now() - startTime };
      }

      const globalFlags = this.flags.includes('g') ? this.flags : this.flags + 'g';
      const globalRegex = new RegExp(this.pattern, globalFlags);

      let match;
      let iterCount = 0;
      const maxIterations = 1000;

      while ((match = globalRegex.exec(chunk)) !== null) {
        iterCount++;
        if (iterCount > maxIterations) {
          break;
        }

        if (matches.length >= maxMatches) {
          return { matches, limitReached: true };
        }

        matches.push({
          text: match[0],
          index: globalOffset + match.index,
          groups: match.slice(1)
        });

        if (match.index === globalRegex.lastIndex) {
          globalRegex.lastIndex++;
        }
      }

      globalOffset += chunk.length - 500;
    }

    return { 
      matches: this.deduplicateMatches(matches), 
      elapsed: Date.now() - startTime,
      wasSimplified: this.wasSimplified
    };
  }

  deduplicateMatches(matches) {
    const seen = new Set();
    return matches.filter(m => {
      const key = `${m.index}:${m.text}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  reset() {
    this.execCount = 0;
    this.regex.lastIndex = 0;
  }
}

function executeWithTimeout(regex, input, timeoutMs = REGEX_TIMEOUT_MS) {
  const safeRegex = SafeRegex.fromRegExp(regex);
  return safeRegex.matchAll(input, { timeout: timeoutMs });
}

function prevalidatePattern(pattern) {
  const source = typeof pattern === 'string' ? pattern : pattern.source;
  return isPatternSafe(source);
}

module.exports = {
  SafeRegex,
  executeWithTimeout,
  prevalidatePattern,
  simplifyPatternForSafety,
  isPatternSafe,
  chunkInput,
  REGEX_TIMEOUT_MS,
  MAX_INPUT_LENGTH,
  MAX_PATTERN_COMPLEXITY
};
