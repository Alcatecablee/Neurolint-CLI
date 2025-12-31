/**
 * NeuroLint - Smart Layer Selector
 * Analyzes code and recommends appropriate fix layers
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

class SmartLayerSelector {
  static analyzeAndRecommend(code, filePath) {
    const issues = [];
    const ext = require('path').extname(filePath);
    
    // Layer 1: Configuration files
    if (filePath.endsWith('tsconfig.json') || filePath.endsWith('next.config.js')) {
      issues.push({ layer: 1, reason: 'Configuration file detected' });
    }

    // Layer 2: Pattern issues
    if (code.includes('&quot;') || code.includes('console.log(')) {
      issues.push({ layer: 2, reason: 'Pattern issues detected' });
    }

    // Layer 3: Component issues
    if ((ext === '.tsx' || ext === '.jsx') && code.includes('.map(') && !code.includes('key={')) {
      issues.push({ layer: 3, reason: 'Missing React keys' });
    }

    // Layer 4: Hydration issues
    if (code.includes('localStorage') && !code.includes('typeof window')) {
      issues.push({ layer: 4, reason: 'Hydration safety needed' });
    }

    return {
      detectedIssues: issues,
      recommendedLayers: [...new Set(issues.map(i => i.layer))].sort(),
      reasons: issues.map(i => i.reason)
    };
  }
}

module.exports = SmartLayerSelector;
