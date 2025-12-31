/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Pattern Extraction Module - Entry Point
 * Provides unified interface for all pattern extractors
 */

const ASTDiffEngine = require('./ast-diff-engine');
const PatternClassifier = require('./pattern-classifier');
const Layer1Extractor = require('./layer-1-extractor');
const Layer3Extractor = require('./layer-3-extractor');
const GeneralizedExtractor = require('./generalized-extractor');

module.exports = {
  ASTDiffEngine,
  PatternClassifier,
  Layer1Extractor,
  Layer3Extractor,
  GeneralizedExtractor
};
