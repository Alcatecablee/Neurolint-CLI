# Layer 8: Security Forensics

## Specification Document v1.0

**Status**: Draft  
**Author**: NeuroLint Team  
**Created**: December 2025  
**Related CVE**: CVE-2025-55182 (CVSS 10.0)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Architecture Overview](#architecture-overview)
4. [Layer Integration](#layer-integration)
5. [Module Structure](#module-structure)
6. [Detection Capabilities](#detection-capabilities)
7. [CLI Commands](#cli-commands)
8. [Configuration](#configuration)
9. [Output Formats](#output-formats)
10. [Performance Considerations](#performance-considerations)
11. [Security Considerations](#security-considerations)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Testing Strategy](#testing-strategy)
14. [Future Enhancements](#future-enhancements)

---

## Executive Summary

Layer 8 Security Forensics extends NeuroLint beyond code quality and patching into **post-exploitation detection and incident response**. While the existing `security:cve-2025-55182` command patches vulnerabilities, Layer 8 answers the critical question:

> "Am I already compromised?"

This layer leverages NeuroLint's existing AST analysis, file scanning, and pattern matching infrastructure to detect indicators of compromise (IoCs), generate forensic evidence, and provide actionable remediation guidance.

### Key Capabilities

- **Compromise Detection**: Scan for backdoors, webshells, crypto miners, and persistence mechanisms
- **Integrity Verification**: Baseline comparison to detect tampered files
- **Forensic Evidence**: Generate exportable incident reports for SOC teams
- **Adaptive Learning**: Feed security findings to Layer 7 for pattern evolution

---

## Problem Statement

### The Gap in Current Security Tooling

Eduardo Borges (Security Researcher) revealed the true endgame of CVE-2025-55182:

> "You can patch your next/react, but the intruder is already inside. Gangs (aka 'initial access brokers') have been scanning for this since day 0. They automate the break-in, set up backdoors, and wait to sell your root access to the highest bidder."

**Current NeuroLint capability**:
```bash
npx @neurolint/cli security:cve-2025-55182 . --fix
```

This patches the vulnerability but does NOT detect:
- Pre-existing compromise from earlier exploitation
- Backdoors planted before patching
- Dormant payloads waiting for activation
- Data exfiltration mechanisms
- Crypto miners or botnet agents

### Target Users

| User Type | Need |
|-----------|------|
| **Developers** | Quick check: "Is my project clean?" |
| **DevSecOps** | CI/CD integration for security gates |
| **Incident Responders** | Forensic evidence for investigation |
| **Compliance Teams** | Audit trails and security reports |
| **Enterprise Security** | Fleet-wide scanning and monitoring |

---

## Architecture Overview

### Layer Position in NeuroLint Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          NEUROLINT LAYER PIPELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Layer 1      Layer 2      Layer 3       Layer 4      Layer 5      Layer 6 │
│  ┌──────┐    ┌────────┐   ┌──────────┐  ┌─────────┐  ┌───────┐   ┌───────┐ │
│  │Config│ -> │Patterns│ ->│Components│->│Hydration│->│Next.js│ ->│Testing│ │
│  └──────┘    └────────┘   └──────────┘  └─────────┘  └───────┘   └───────┘ │
│                                                                      │      │
│                                                                      ▼      │
│                           ┌──────────────────────────────────────────────┐  │
│                           │  Layer 7: Adaptive (Learning)                │  │
│                           │  - Pattern recognition                       │  │
│                           │  - Learns from Layer 8 security findings     │  │
│                           └──────────────────────────────────────────────┘  │
│                                                                      │      │
│                                                                      ▼      │
│                           ┌──────────────────────────────────────────────┐  │
│                           │  Layer 8: Security Forensics (NEW)           │  │
│                           │  - Compromise detection                      │  │
│                           │  - Integrity verification                    │  │
│                           │  - Forensic evidence generation              │  │
│                           │  - Final security gate                       │  │
│                           └──────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
                    ┌─────────────────┐
                    │  Source Files   │
                    └────────┬────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │     File Scanner (getFiles)  │
              │  - Glob pattern matching     │
              │  - Concurrent file reading   │
              └──────────────┬───────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
    │  Signature  │  │  Behavioral │  │   Dependency    │
    │  Analyzer   │  │  Analyzer   │  │    Differ       │
    └──────┬──────┘  └──────┬──────┘  └────────┬────────┘
           │                │                  │
           └────────────────┼──────────────────┘
                            │
                            ▼
              ┌──────────────────────────────┐
              │    Forensics Aggregator      │
              │  - Timeline reconstruction   │
              │  - File integrity check      │
              │  - Baseline comparison       │
              └──────────────┬───────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
    │   SARIF     │  │    JSON     │  │   CLI Summary   │
    │  Reporter   │  │  Reporter   │  │   + Remediation │
    └─────────────┘  └─────────────┘  └─────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   Layer 7 Adaptive Feedback  │
              │  (securityFindings[] event)  │
              └──────────────────────────────┘
```

---

## Layer Integration

### Interaction with Existing Layers

| Layer | Interaction with Layer 8 |
|-------|--------------------------|
| **Layer 1 (Config)** | Shares config file parsing; Layer 8 checks for config tampering |
| **Layer 2 (Patterns)** | Extends pattern detection for security-specific patterns |
| **Layer 3 (Components)** | Layer 8 scans for injected malicious components |
| **Layer 4 (Hydration)** | Detects suspicious hydration exploits |
| **Layer 5 (Next.js)** | Scans API routes, server actions for unauthorized code |
| **Layer 6 (Testing)** | Layer 8 can be tested with IoC fixture projects |
| **Layer 7 (Adaptive)** | Consumes `securityFindings[]` to learn new patterns |

### Layer 7 ↔ Layer 8 Communication

```javascript
// Layer 8 emits findings
const securityFindings = [
  {
    id: 'IOC-2025-001',
    type: 'backdoor',
    severity: 'critical',
    file: 'src/api/hidden.js',
    pattern: 'eval(atob(...))',
    confidence: 0.95,
    timestamp: '2025-12-07T10:30:00Z'
  }
];

// Layer 7 consumes for adaptive learning
layer7.ingestSecurityFindings(securityFindings);
// Layer 7 can now recognize similar patterns in future scans
```

**Key Principle**: Layer 8 owns detection and evidence. Layer 7 observes and learns. No cyclic dependencies.

---

## Module Structure

### Directory Layout

```
scripts/fix-layer-8-security/
├── index.js                         # Main layer entry point
├── constants.js                     # IoC signatures, severity levels
│
├── detectors/
│   ├── index.js                     # Detector orchestrator
│   ├── signature-analyzer.js        # Known malicious patterns
│   ├── behavioral-analyzer.js       # Suspicious code behavior
│   ├── dependency-differ.js         # Package integrity checker
│   ├── rsc-scanner.js               # React Server Component specific
│   └── network-analyzer.js          # Suspicious network calls
│
├── forensics/
│   ├── index.js                     # Forensics orchestrator
│   ├── timeline-reconstructor.js    # Git history analysis
│   ├── file-integrity.js            # Hash baselines, drift detection
│   ├── baseline-manager.js          # Create/compare baselines
│   └── evidence-collector.js        # Bundle evidence for export
│
├── reporters/
│   ├── index.js                     # Reporter orchestrator
│   ├── sarif-reporter.js            # SARIF format (GitHub, Azure DevOps)
│   ├── json-reporter.js             # Machine-readable JSON
│   ├── cli-reporter.js              # Human-readable CLI output
│   └── html-reporter.js             # Standalone HTML report
│
├── quarantine/
│   ├── index.js                     # Quarantine orchestrator
│   ├── backup-tagger.js             # Mark suspicious files
│   ├── isolation-handler.js         # Move files to quarantine
│   └── remediation-guide.js         # Generate fix recommendations
│
└── utils/
    ├── hash-utils.js                # SHA-256 hashing utilities
    ├── pattern-compiler.js          # Compile IoC patterns
    └── severity-calculator.js       # Calculate finding severity
```

### Layer Contract

Layer 8 must implement the standard NeuroLint layer interface:

```javascript
// scripts/fix-layer-8-security/index.js
module.exports = {
  name: 'security-forensics',
  layer: 8,
  
  // Standard layer interface
  async analyze(code, options) {
    // Returns analysis results with securityFindings[]
  },
  
  async transform(code, options) {
    // For remediation (quarantine, neutralization)
  },
  
  // Security-specific methods
  async scanCompromise(targetPath, options) {
    // Quick compromise scan
  },
  
  async incidentResponse(targetPath, options) {
    // Deep forensic scan
  },
  
  async createBaseline(targetPath, options) {
    // Generate integrity baseline
  },
  
  async compareBaseline(targetPath, baselinePath, options) {
    // Compare against baseline
  }
};
```

---

## Detection Capabilities

### Indicator Categories

#### 1. Code-Level Indicators

| Indicator | Pattern | Severity | Detection Method |
|-----------|---------|----------|------------------|
| **Obfuscated eval** | `eval(atob(...))`, `eval(Buffer.from(...))` | Critical | Regex + AST |
| **Dynamic function creation** | `new Function(...)`, `Function.constructor` | High | AST analysis |
| **Encoded payloads** | Base64 strings > 100 chars in code | Medium | Pattern matching |
| **Suspicious requires** | `require('child_process')`, `require('net')` | High | AST imports |
| **Crypto operations** | Unexpected `crypto` usage, mining patterns | High | AST + behavioral |
| **Shell execution** | `exec()`, `spawn()`, `execSync()` | Critical | AST analysis |

#### 2. React/Next.js Specific Indicators

| Indicator | Pattern | Severity | Detection Method |
|-----------|---------|----------|------------------|
| **Rogue Server Actions** | New `'use server'` files not in baseline | Critical | File diff |
| **Injected API routes** | Unexpected files in `/api/`, `/app/api/` | Critical | Directory scan |
| **Malicious RSC payloads** | Suspicious server component exports | High | AST analysis |
| **Modified next.config.js** | Unauthorized config changes | High | Baseline compare |
| **Webpack/Turbopack hooks** | Injected build plugins | Critical | Config analysis |

#### 3. Dependency Indicators

| Indicator | Pattern | Severity | Detection Method |
|-----------|---------|----------|------------------|
| **Package.json tampering** | New scripts, postinstall hooks | Critical | Baseline compare |
| **Lock file mismatch** | package-lock.json differs from registry | High | Hash verification |
| **Typosquatting packages** | Similar names to popular packages | Medium | Dictionary check |
| **Unexpected dependencies** | New deps not in baseline | Medium | Diff analysis |

#### 4. Infrastructure Indicators

| Indicator | Pattern | Severity | Detection Method |
|-----------|---------|----------|------------------|
| **Hidden files** | Dotfiles in unexpected locations | Medium | File scan |
| **Webshells** | PHP/script files in JS project | Critical | Extension scan |
| **Cron/systemd persistence** | Scheduled task modifications | Critical | System scan |
| **SSH key injection** | New authorized_keys entries | Critical | System scan |
| **Environment tampering** | Modified .env files | High | Baseline compare |

### Signature Database Schema

```javascript
// constants.js
const IOC_SIGNATURES = {
  version: '1.0.0',
  lastUpdated: '2025-12-07',
  
  signatures: [
    {
      id: 'NEUROLINT-IOC-001',
      name: 'Obfuscated Eval Execution',
      category: 'code-injection',
      severity: 'critical',
      pattern: /eval\s*\(\s*(atob|Buffer\.from|decodeURIComponent)\s*\(/,
      type: 'regex',
      description: 'Detects eval() with encoding functions, commonly used for payload obfuscation',
      references: ['CVE-2025-55182'],
      remediation: 'Remove the eval statement and investigate its source'
    },
    {
      id: 'NEUROLINT-IOC-002',
      name: 'Dynamic Function Constructor',
      category: 'code-injection',
      severity: 'high',
      ast: {
        type: 'NewExpression',
        callee: { name: 'Function' }
      },
      type: 'ast',
      description: 'Detects dynamic function creation which can execute arbitrary code',
      remediation: 'Replace with static function definitions'
    },
    // ... more signatures
  ]
};
```

---

## CLI Commands

### Command Structure

```bash
# Namespace: security
neurolint security:<command> [path] [options]
```

### Available Commands

#### 1. Quick Compromise Scan

```bash
neurolint security:scan-compromise . [options]
```

**Purpose**: Fast scan for obvious indicators of compromise.

**Options**:
| Option | Description | Default |
|--------|-------------|---------|
| `--verbose`, `-v` | Detailed output | `false` |
| `--json` | Output as JSON | `false` |
| `--fail-on` | Exit code threshold: `critical`, `high`, `medium`, `low` | `critical` |
| `--exclude` | Glob patterns to exclude | Standard excludes |
| `--include` | Glob patterns to include | `**/*.{js,ts,jsx,tsx,json}` |

**Output Example**:
```
NeuroLint Security Forensics v1.0.0
Scanning for indicators of compromise...

✓ Scanned 247 files in 1.2s

┌─────────────────────────────────────────────────────────────────┐
│  SECURITY SCAN RESULTS                                          │
├─────────────────────────────────────────────────────────────────┤
│  Status: ⚠️  WARNINGS DETECTED                                  │
│                                                                 │
│  Critical: 0                                                    │
│  High: 2                                                        │
│  Medium: 3                                                      │
│  Low: 5                                                         │
└─────────────────────────────────────────────────────────────────┘

HIGH SEVERITY FINDINGS:

  [IOC-002] Dynamic Function Constructor
  File: src/utils/loader.js:45
  Pattern: new Function('return ' + data)
  Remediation: Replace with static function definitions

  [IOC-017] Suspicious Network Call
  File: src/api/sync.js:23
  Pattern: fetch('http://unknown-domain.xyz/beacon')
  Remediation: Verify this endpoint is legitimate

Run with --verbose for full details, or --json for machine-readable output.
```

#### 2. Deep Incident Response Scan

```bash
neurolint security:incident-response . [options]
```

**Purpose**: Comprehensive forensic analysis for incident response.

**Options**:
| Option | Description | Default |
|--------|-------------|---------|
| `--deep-scan` | Enable all detection methods | `true` |
| `--timeline` | Reconstruct git history timeline | `true` |
| `--baseline` | Path to baseline for comparison | `.neurolint/security-baseline.json` |
| `--output` | Output directory for reports | `.neurolint/incident-report/` |
| `--format` | Report formats: `sarif`, `json`, `html`, `all` | `all` |
| `--quarantine` | Auto-quarantine suspicious files | `false` |

**Output**: Generates comprehensive incident report package.

#### 3. Create Security Baseline

```bash
neurolint security:create-baseline . [options]
```

**Purpose**: Create integrity baseline for future comparison.

**Options**:
| Option | Description | Default |
|--------|-------------|---------|
| `--output`, `-o` | Baseline output path | `.neurolint/security-baseline.json` |
| `--include-deps` | Hash node_modules | `false` |
| `--sign` | Cryptographically sign baseline | `false` |

**Baseline Schema**:
```json
{
  "version": "1.0.0",
  "created": "2025-12-07T10:30:00Z",
  "projectRoot": "/path/to/project",
  "files": {
    "src/index.js": {
      "hash": "sha256:abc123...",
      "size": 1234,
      "modified": "2025-12-01T08:00:00Z"
    }
  },
  "dependencies": {
    "package.json": "sha256:def456...",
    "package-lock.json": "sha256:ghi789..."
  },
  "config": {
    "next.config.js": "sha256:jkl012...",
    "tsconfig.json": "sha256:mno345..."
  }
}
```

#### 4. Compare Against Baseline

```bash
neurolint security:compare-baseline . --baseline ./baseline.json
```

**Purpose**: Detect drift from known-good state.

---

## Configuration

### .neurolintrc Configuration

```json
{
  "layers": [1, 2, 3, 4, 5, 6, 7, 8],
  
  "security": {
    "enabled": true,
    "layer8": {
      "enabled": true,
      "mode": "standard",
      
      "detectors": {
        "signature": true,
        "behavioral": true,
        "dependency": true,
        "rsc": true,
        "network": true
      },
      
      "forensics": {
        "timeline": true,
        "fileIntegrity": true,
        "baselinePath": ".neurolint/security-baseline.json"
      },
      
      "thresholds": {
        "failOn": "critical",
        "warnOn": "medium"
      },
      
      "exclude": [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.test.{js,ts}"
      ],
      
      "customSignatures": "./custom-iocs.json",
      
      "reporting": {
        "formats": ["cli", "json", "sarif"],
        "outputDir": ".neurolint/security-reports"
      },
      
      "quarantine": {
        "enabled": false,
        "autoQuarantine": false,
        "quarantineDir": ".neurolint/quarantine"
      },
      
      "performance": {
        "maxConcurrent": 50,
        "timeout": 30000,
        "cacheEnabled": true,
        "cachePath": ".neurolint/security-cache"
      }
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEUROLINT_SECURITY_ENABLED` | Enable Layer 8 | `true` |
| `NEUROLINT_SECURITY_MODE` | `standard`, `deep`, `paranoid` | `standard` |
| `NEUROLINT_SECURITY_FAIL_ON` | Severity threshold for exit code | `critical` |
| `NEUROLINT_SECURITY_CACHE` | Cache directory | `.neurolint/security-cache` |

---

## Output Formats

### 1. SARIF (Static Analysis Results Interchange Format)

Standard format for security tools, supported by GitHub, Azure DevOps, VS Code.

```json
{
  "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
  "version": "2.1.0",
  "runs": [{
    "tool": {
      "driver": {
        "name": "NeuroLint Security Forensics",
        "version": "1.0.0",
        "rules": [{
          "id": "NEUROLINT-IOC-001",
          "name": "ObfuscatedEvalExecution",
          "shortDescription": { "text": "Obfuscated eval() execution detected" },
          "defaultConfiguration": { "level": "error" }
        }]
      }
    },
    "results": [{
      "ruleId": "NEUROLINT-IOC-001",
      "level": "error",
      "message": { "text": "Detected eval(atob(...)) pattern" },
      "locations": [{
        "physicalLocation": {
          "artifactLocation": { "uri": "src/utils/loader.js" },
          "region": { "startLine": 45, "startColumn": 5 }
        }
      }]
    }]
  }]
}
```

### 2. JSON Report

```json
{
  "scanId": "scan-2025-12-07-103000",
  "timestamp": "2025-12-07T10:30:00Z",
  "duration": 1234,
  "status": "warnings",
  "summary": {
    "filesScanned": 247,
    "findingsTotal": 10,
    "findingsBySeverity": {
      "critical": 0,
      "high": 2,
      "medium": 3,
      "low": 5
    }
  },
  "findings": [{
    "id": "finding-001",
    "iocId": "NEUROLINT-IOC-002",
    "severity": "high",
    "category": "code-injection",
    "file": "src/utils/loader.js",
    "line": 45,
    "column": 5,
    "codeSnippet": "new Function('return ' + data)",
    "description": "Dynamic function creation which can execute arbitrary code",
    "remediation": "Replace with static function definitions",
    "confidence": 0.95
  }],
  "baseline": {
    "compared": true,
    "drift": {
      "newFiles": 2,
      "modifiedFiles": 5,
      "deletedFiles": 0
    }
  }
}
```

### 3. HTML Report

Standalone HTML file with:
- Executive summary
- Finding details with code snippets
- Timeline visualization
- Remediation checklist
- Export to PDF option

---

## Performance Considerations

### Execution Modes

| Mode | Description | Performance Target |
|------|-------------|-------------------|
| **Quick** | Signature-only scan | < 5s for 500 files |
| **Standard** | Signatures + behavioral | < 15s for 500 files |
| **Deep** | Full forensic analysis | < 60s for 500 files |
| **Paranoid** | Everything + dependency hashing | < 5m for 500 files |

### Optimization Strategies

1. **Lazy Loading**: Only load detectors when needed
2. **Parallel Processing**: Use worker threads for large directories
3. **Caching**: Store file hashes, AST parses in `.neurolint/security-cache`
4. **Early Exit**: Stop on first critical finding (optional)
5. **Incremental Scanning**: Only scan changed files (baseline comparison)

### Resource Budgets

```javascript
const PERFORMANCE_BUDGETS = {
  maxMemoryMB: 512,
  maxCpuPercent: 80,
  maxConcurrentFiles: 50,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  scanTimeout: 30000 // 30s per file
};
```

---

## Security Considerations

### Safe Handling of Malicious Code

1. **No Execution**: Never execute or eval scanned code
2. **Sandboxed Parsing**: AST parsing in isolated context
3. **Memory Limits**: Cap memory usage during analysis
4. **Output Sanitization**: Escape all code snippets in reports

### Credential Safety

1. **No Logging Secrets**: Never log environment variables or credentials
2. **Baseline Exclusion**: Exclude `.env*` files from baselines by default
3. **Report Redaction**: Auto-redact potential secrets in reports

### Supply Chain Security

1. **Signed Releases**: Cryptographically sign NeuroLint releases
2. **Dependency Auditing**: Regular audit of Layer 8 dependencies
3. **Minimal Dependencies**: Keep external deps to minimum

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Create `scripts/fix-layer-8-security/` directory structure
- [ ] Implement `index.js` layer interface
- [ ] Add Layer 8 to `LAYER_NAMES` in `cli.js`
- [ ] Implement basic signature analyzer with 20 core patterns
- [ ] Add `security:scan-compromise` CLI command
- [ ] Basic CLI output reporter

### Phase 2: Core Detection (Week 3-4)

- [ ] Implement behavioral analyzer (AST-based)
- [ ] Implement dependency differ
- [ ] Add React/Next.js specific detectors
- [ ] Implement network call analyzer
- [ ] Expand signature database to 50+ patterns
- [ ] Add JSON reporter

### Phase 3: Forensics (Week 5-6)

- [ ] Implement baseline manager (create/compare)
- [ ] Implement file integrity checker
- [ ] Add timeline reconstructor (git history)
- [ ] Implement evidence collector
- [ ] Add `security:create-baseline` command
- [ ] Add `security:compare-baseline` command

### Phase 4: Reporting & Integration (Week 7-8)

- [ ] Implement SARIF reporter
- [ ] Implement HTML reporter
- [ ] Add Layer 7 integration (securityFindings event)
- [ ] Add quarantine functionality
- [ ] Add `security:incident-response` command
- [ ] Performance optimization pass

### Phase 5: Polish & Documentation (Week 9-10)

- [ ] Comprehensive test suite with IoC fixtures
- [ ] Documentation and examples
- [ ] Performance benchmarks
- [ ] CI/CD integration examples
- [ ] Security audit of Layer 8 code
- [ ] Release v1.0.0

---

## Testing Strategy

### Test Categories

1. **Unit Tests**: Individual detector functions
2. **Integration Tests**: Full scan pipeline
3. **Fixture Tests**: Known IoC samples (sanitized)
4. **Performance Tests**: Benchmark against target budgets
5. **Regression Tests**: Ensure no false positives on clean code

### IoC Fixture Projects

Create sanitized test projects with known IoCs:

```
test-fixtures/
├── clean-project/          # No IoCs (false positive testing)
├── basic-iocs/             # Simple, obvious IoCs
├── obfuscated-iocs/        # Encoded/obfuscated payloads
├── react-specific/         # RSC/Next.js specific IoCs
├── dependency-attacks/     # Supply chain attack patterns
└── edge-cases/             # Unusual but legitimate patterns
```

### Validation Criteria

| Metric | Target |
|--------|--------|
| **Detection Rate** | > 95% for known IoC patterns |
| **False Positive Rate** | < 1% on clean projects |
| **Scan Speed** | < 15s for 500 files (standard mode) |
| **Memory Usage** | < 512MB peak |

---

## Future Enhancements

### Version 1.1

- [ ] Real-time file watcher mode
- [ ] Custom signature authoring UI
- [ ] Integration with threat intel feeds
- [ ] Slack/Teams/Discord notifications

### Version 1.2

- [ ] Cloud deployment scanning (Vercel, Netlify, AWS)
- [ ] CI/CD GitHub Action
- [ ] VS Code extension integration
- [ ] Machine learning-based anomaly detection

### Version 2.0

- [ ] Distributed scanning for monorepos
- [ ] Enterprise fleet management
- [ ] SOC integration APIs (SIEM, SOAR)
- [ ] Automated remediation playbooks

---

## Appendix A: Complete IoC Signature List

[To be populated during implementation]

## Appendix B: MITRE ATT&CK Mapping

[Map IoC categories to MITRE ATT&CK framework]

## Appendix C: Compliance Mapping

[Map capabilities to SOC2, PCI-DSS, HIPAA requirements]

---

## References

- [CVE-2025-55182 Advisory](https://github.com/advisories)
- [React Security Best Practices](https://react.dev/security)
- [SARIF Specification](https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)

---

*Document Version: 1.0.0*  
*Last Updated: December 2025*
