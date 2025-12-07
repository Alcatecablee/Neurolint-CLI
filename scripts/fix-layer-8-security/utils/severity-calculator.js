/**
 * Layer 8: Security Forensics - Severity Calculator
 * 
 * Calculates overall severity scores and risk levels from findings.
 */

'use strict';

const { SEVERITY_LEVELS, SEVERITY_WEIGHTS } = require('../constants');

class SeverityCalculator {
  static calculateOverallSeverity(findings) {
    if (!findings || findings.length === 0) {
      return {
        level: 'clean',
        score: 0,
        breakdown: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0
        }
      };
    }
    
    const breakdown = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0
    };
    
    let totalScore = 0;
    
    for (const finding of findings) {
      const severity = finding.severity || 'info';
      breakdown[severity] = (breakdown[severity] || 0) + 1;
      totalScore += SEVERITY_WEIGHTS[severity] || 0;
    }
    
    let level;
    if (breakdown.critical > 0) {
      level = SEVERITY_LEVELS.CRITICAL;
    } else if (breakdown.high > 0) {
      level = SEVERITY_LEVELS.HIGH;
    } else if (breakdown.medium > 0) {
      level = SEVERITY_LEVELS.MEDIUM;
    } else if (breakdown.low > 0) {
      level = SEVERITY_LEVELS.LOW;
    } else {
      level = SEVERITY_LEVELS.INFO;
    }
    
    return {
      level,
      score: totalScore,
      breakdown,
      findingsCount: findings.length
    };
  }
  
  static shouldFailBuild(severity, threshold = 'critical') {
    const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
    const severityIndex = severityOrder.indexOf(severity.level);
    const thresholdIndex = severityOrder.indexOf(threshold);
    
    return severityIndex >= thresholdIndex;
  }
  
  static formatSeverityBadge(level) {
    const badges = {
      critical: '\x1b[41m\x1b[37m CRITICAL \x1b[0m',
      high: '\x1b[43m\x1b[30m HIGH \x1b[0m',
      medium: '\x1b[44m\x1b[37m MEDIUM \x1b[0m',
      low: '\x1b[46m\x1b[30m LOW \x1b[0m',
      info: '\x1b[47m\x1b[30m INFO \x1b[0m',
      clean: '\x1b[42m\x1b[30m CLEAN \x1b[0m'
    };
    
    return badges[level] || badges.info;
  }
}

module.exports = SeverityCalculator;
