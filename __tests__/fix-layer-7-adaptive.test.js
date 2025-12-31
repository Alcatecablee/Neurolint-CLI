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


const { transform, RuleStore, extractPatterns, extractSecurityPatterns } = require('../scripts/fix-layer-7-adaptive');
const fs = require('fs').promises;
const path = require('path');

describe('Layer 7: Adaptive Pattern Learning', () => {
  const testDir = path.join(process.cwd(), '.neurolint-test');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (e) {
    }
    try {
      const rulesPath = path.join(process.cwd(), '.neurolint', 'learned-rules.json');
      await fs.unlink(rulesPath);
    } catch (e) {
    }
  });

  describe('RuleStore', () => {
    let ruleStore;
    
    beforeEach(() => {
      ruleStore = new RuleStore();
    });

    test('should initialize with empty rules array', () => {
      expect(Array.isArray(ruleStore.rules)).toBe(true);
      expect(ruleStore.rules.length).toBe(0);
    });

    test('should load rules from storage', async () => {
      await ruleStore.load();
      expect(Array.isArray(ruleStore.rules)).toBe(true);
    });

    test('should save and load rules correctly', async () => {
      const testRule = {
        description: 'Test rule',
        pattern: /test/g,
        replacement: 'replacement',
        confidence: 0.8,
        frequency: 1
      };
      
      await ruleStore.addRule(testRule);
      
      const newStore = new RuleStore();
      await newStore.load();
      
      expect(newStore.rules.length).toBe(1);
      expect(newStore.rules[0].description).toBe('Test rule');
      expect(newStore.rules[0].pattern).toBeInstanceOf(RegExp);
    });

    test('should increment frequency for existing rule', async () => {
      const testRule = {
        description: 'Duplicate rule',
        pattern: /duplicate/g,
        replacement: 'replaced',
        confidence: 0.7,
        frequency: 1
      };
      
      await ruleStore.addRule(testRule);
      await ruleStore.addRule({ ...testRule });
      
      expect(ruleStore.rules.length).toBe(1);
      expect(ruleStore.rules[0].frequency).toBe(2);
      expect(ruleStore.rules[0].confidence).toBeGreaterThan(0.7);
    });

    test('should apply rules with sufficient confidence', async () => {
      const rule = {
        description: 'High confidence rule',
        pattern: /oldValue/g,
        replacement: 'newValue',
        confidence: 0.8,
        frequency: 1
      };
      
      await ruleStore.addRule(rule);
      
      const code = 'const x = oldValue;';
      const result = await ruleStore.applyRules(code);
      
      expect(result.transformedCode).toBe('const x = newValue;');
      expect(result.appliedRules).toContain('High confidence rule');
    });

    test('should skip rules with low confidence', async () => {
      const rule = {
        description: 'Low confidence rule',
        pattern: /skipMe/g,
        replacement: 'skipped',
        confidence: 0.5,
        frequency: 1
      };
      
      ruleStore.rules = [rule];
      
      const code = 'const x = skipMe;';
      const result = await ruleStore.applyRules(code);
      
      expect(result.transformedCode).toBe('const x = skipMe;');
      expect(result.appliedRules.length).toBe(0);
    });

    test('should delete rule by id', async () => {
      ruleStore.rules = [
        { description: 'Rule 1', pattern: /a/, replacement: 'b', confidence: 0.8, frequency: 1 },
        { description: 'Rule 2', pattern: /c/, replacement: 'd', confidence: 0.8, frequency: 1 }
      ];
      
      const deleted = await ruleStore.deleteRule(0);
      
      expect(deleted).toBe(true);
      expect(ruleStore.rules.length).toBe(1);
      expect(ruleStore.rules[0].description).toBe('Rule 2');
    });

    test('should return false for invalid delete id', async () => {
      ruleStore.rules = [{ description: 'Only rule', pattern: /x/, replacement: 'y', confidence: 0.8, frequency: 1 }];
      
      const deleted = await ruleStore.deleteRule(5);
      
      expect(deleted).toBe(false);
      expect(ruleStore.rules.length).toBe(1);
    });

    test('should reset all rules', async () => {
      ruleStore.rules = [
        { description: 'Rule 1', pattern: /a/, replacement: 'b', confidence: 0.8, frequency: 1 },
        { description: 'Rule 2', pattern: /c/, replacement: 'd', confidence: 0.8, frequency: 1 }
      ];
      
      await ruleStore.resetRules();
      
      expect(ruleStore.rules.length).toBe(0);
    });

    test('should edit rule by id', async () => {
      ruleStore.rules = [{ description: 'Original', pattern: /x/, replacement: 'y', confidence: 0.8, frequency: 1 }];
      
      const edited = await ruleStore.editRule(0, { description: 'Updated', confidence: 0.9 });
      
      expect(edited).toBe(true);
      expect(ruleStore.rules[0].description).toBe('Updated');
      expect(ruleStore.rules[0].confidence).toBe(0.9);
    });

    test('should handle non-array rules gracefully', async () => {
      ruleStore._rules = null;
      
      const result = await ruleStore.applyRules('test code');
      
      expect(result.transformedCode).toBe('test code');
      expect(result.appliedRules).toEqual([]);
    });

    test('should handle rule application errors gracefully', async () => {
      ruleStore.rules = [{
        description: 'Bad rule',
        pattern: { test: () => { throw new Error('Bad pattern'); } },
        replacement: 'fail',
        confidence: 0.8,
        frequency: 1
      }];
      
      const result = await ruleStore.applyRules('test code');
      expect(result.transformedCode).toBe('test code');
    });
  });

  describe('transform function', () => {
    test('should return success for valid code', async () => {
      const code = 'const x = 1;';
      const result = await transform(code, { dryRun: true });
      
      expect(result.success).toBe(true);
      expect(result.changeCount).toBe(0);
    });

    test('should handle empty code', async () => {
      const result = await transform('', { dryRun: true });
      
      expect(result.success).toBe(false);
      expect(result.error || result.results.some(r => r.error)).toBeTruthy();
    });

    test('should handle whitespace-only code', async () => {
      const result = await transform('   \n   ', { dryRun: true });
      
      expect(result.success).toBe(false);
    });

    test('should learn from previous layer results', async () => {
      const previousResults = [{
        success: true,
        changeCount: 1,
        layerId: 5,
        originalCode: 'import { useState } from "react";\nconst x = 1;',
        code: "'use client';\nimport { useState } from \"react\";\nconst x = 1;"
      }];
      
      const code = 'import { useState } from "react";\nfunction App() { const [x] = useState(0); }';
      const result = await transform(code, { 
        dryRun: true, 
        previousResults 
      });
      
      expect(result.success).toBe(true);
      expect(result.results.some(r => r.type === 'learn')).toBe(true);
    });

    test('should add suggestions without incrementing changeCount', async () => {
      const code = 'console.log("test"); const x = 1;';
      const result = await transform(code, { dryRun: true });
      
      const suggestions = result.changes.filter(c => c.type === 'AdaptiveSuggestion');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(result.changeCount).toBe(0);
    });

    test('should detect inline styles suggestion', async () => {
      const code = 'const Component = () => <div style={{ color: "red" }}>Test</div>;';
      const result = await transform(code, { dryRun: true });
      
      const suggestions = result.changes.filter(c => c.type === 'AdaptiveSuggestion');
      expect(suggestions.some(s => s.description.includes('Inline styles'))).toBe(true);
    });

    test('should not suggest console removal if already marked', async () => {
      const code = 'const x = 1; // [NeuroLint] already processed';
      const result = await transform(code, { dryRun: true });
      
      const suggestions = result.changes.filter(c => 
        c.type === 'AdaptiveSuggestion' && c.description.includes('Console')
      );
      expect(suggestions.length).toBe(0);
    });

    test('should normalize line endings', async () => {
      const code = 'const x = 1;\r\nconst y = 2;';
      const result = await transform(code, { dryRun: true });
      
      expect(result.code.includes('\r\n')).toBe(false);
    });
  });

  describe('extractPatterns function', () => {
    test('should return empty array for identical code', () => {
      const patterns = extractPatterns('const x = 1;', 'const x = 1;', 1);
      expect(patterns).toEqual([]);
    });

    test('should return empty array for null/undefined inputs', () => {
      expect(extractPatterns(null, 'code', 1)).toEqual([]);
      expect(extractPatterns('code', null, 1)).toEqual([]);
      expect(extractPatterns(undefined, 'code', 1)).toEqual([]);
    });

    test('should extract use client pattern for Layer 5 with React hooks', () => {
      const before = 'import { useState } from "react";\nfunction App() { useState(0); }';
      const after = "'use client';\nimport { useState } from \"react\";\nfunction App() { useState(0); }";
      
      const patterns = extractPatterns(before, after, 5);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some(p => p.description.includes('use client'))).toBe(true);
    });

    test('should NOT extract overly broad patterns', () => {
      const before = 'const x = 1;';
      const after = "'use client';\nconst x = 1;";
      
      const patterns = extractPatterns(before, after, 5);
      
      const hasOverlyBroadPattern = patterns.some(p => {
        if (p.pattern instanceof RegExp) {
          return p.pattern.toString() === '/^/' || p.pattern.toString() === '/^/m';
        }
        return false;
      });
      
      expect(hasOverlyBroadPattern).toBe(false);
    });

    test('should only extract use client for files with actual hooks', () => {
      const before = 'const x = 1;';
      const after = "'use client';\nconst x = 1;";
      
      const patterns = extractPatterns(before, after, 5);
      
      expect(patterns.length).toBe(0);
    });

    test('should extract ErrorBoundary pattern for Layer 6', () => {
      const before = 'function App() { return <div>Hello</div>; }';
      const after = 'function App() { return <ErrorBoundary><div>Hello</div></ErrorBoundary>; }';
      
      const patterns = extractPatterns(before, after, 6);
      
      expect(patterns.some(p => p.description.includes('ErrorBoundary'))).toBe(true);
    });

    test('should extract React.memo pattern for Layer 6', () => {
      const before = 'function App() { return <div>Hello</div>; }';
      const after = 'const Memoized = React.memo(App);\nfunction App() { return <div>Hello</div>; }';
      
      const patterns = extractPatterns(before, after, 6);
      
      expect(patterns.some(p => p.description.includes('Memoize'))).toBe(true);
    });

    test('should extract console removal pattern', () => {
      const before = 'console.log("test"); const x = 1;';
      const after = '// [NeuroLint] Removed console.log: ... const x = 1;';
      
      const patterns = extractPatterns(before, after, 2);
      
      expect(patterns.some(p => p.description.includes('console'))).toBe(true);
    });
  });

  describe('extractSecurityPatterns function', () => {
    test('should return empty array for null/empty input', () => {
      expect(extractSecurityPatterns(null)).toEqual([]);
      expect(extractSecurityPatterns([])).toEqual([]);
      expect(extractSecurityPatterns(undefined)).toEqual([]);
    });

    test('should skip low severity findings', () => {
      const findings = [{
        severity: 'low',
        signatureId: 'console-log',
        description: 'Console log detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      expect(patterns.length).toBe(0);
    });

    test('should extract eval pattern from critical finding', () => {
      const findings = [{
        severity: 'critical',
        signatureId: 'eval-usage',
        description: 'Dangerous eval() usage detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].securityRelated).toBe(true);
      expect(patterns[0].confidence).toBe(0.95);
    });

    test('should extract innerHTML pattern from high severity finding', () => {
      const findings = [{
        severity: 'high',
        signatureId: 'innerHTML-usage',
        description: 'innerHTML usage detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.some(p => p.pattern.toString().includes('innerHTML'))).toBe(true);
    });

    test('should extract dangerouslySetInnerHTML pattern', () => {
      const findings = [{
        severity: 'critical',
        signatureId: 'dangerouslySetInnerHTML',
        description: 'React dangerouslySetInnerHTML detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.some(p => p.description.includes('dangerouslySetInnerHTML'))).toBe(true);
    });

    test('should extract hardcoded credentials pattern', () => {
      const findings = [{
        severity: 'high',
        signatureId: 'hardcoded-secret',
        description: 'Hardcoded credentials detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('should extract command injection pattern', () => {
      const findings = [{
        severity: 'critical',
        signatureId: 'exec-usage',
        description: 'Command injection vulnerability'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.some(p => p.pattern.toString().includes('exec'))).toBe(true);
    });

    test('should extract SQL injection pattern', () => {
      const findings = [{
        severity: 'high',
        signatureId: 'sql-injection',
        description: 'SQL injection detected'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.length).toBeGreaterThan(0);
    });

    test('should create context-based pattern from finding match', () => {
      const findings = [{
        severity: 'high',
        signatureId: 'custom-vuln',
        description: 'Custom vulnerability',
        match: 'dangerousFunction()'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      expect(patterns.some(p => p.description.includes('context'))).toBe(true);
    });

    test('should skip context patterns that are too short', () => {
      const findings = [{
        severity: 'high',
        signatureId: 'short-context',
        description: 'Short context',
        match: 'ab'
      }];
      
      const patterns = extractSecurityPatterns(findings);
      
      const contextPatterns = patterns.filter(p => p.description.includes('context'));
      expect(contextPatterns.length).toBe(0);
    });

    test('should handle malformed findings gracefully', () => {
      const findings = [
        { severity: 'high' },
        null,
        undefined,
        { severity: 'critical', signatureId: null }
      ];
      
      expect(() => extractSecurityPatterns(findings)).not.toThrow();
    });
  });

  describe('Pattern Validation', () => {
    test('should not create patterns that match everything', () => {
      const before = 'any content here';
      const after = "'use client';\nany content here";
      
      const patterns = extractPatterns(before, after, 5);
      
      patterns.forEach(pattern => {
        if (pattern.pattern instanceof RegExp) {
          expect(pattern.pattern.test('')).toBe(false);
          
          const patternStr = pattern.pattern.toString();
          expect(patternStr).not.toBe('/^/');
          expect(patternStr).not.toBe('/^/m');
          expect(patternStr).not.toBe('/.*/');
        }
      });
    });

    test('extracted patterns should have reasonable specificity', () => {
      const before = 'import { useState } from "react";\nfunction App() { useState(0); }';
      const after = "'use client';\nimport { useState } from \"react\";\nfunction App() { useState(0); }";
      
      const patterns = extractPatterns(before, after, 5);
      
      patterns.forEach(pattern => {
        expect(pattern.confidence).toBeGreaterThanOrEqual(0.7);
        expect(pattern.confidence).toBeLessThanOrEqual(1);
        
        const patternStr = pattern.pattern.toString();
        expect(patternStr.length).toBeGreaterThan(5);
      });
    });
  });
});
