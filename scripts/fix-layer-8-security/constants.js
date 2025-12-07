/**
 * Layer 8: Security Forensics - Constants and IoC Signatures
 * 
 * This module contains the IoC (Indicators of Compromise) signature database
 * and severity definitions for the security forensics layer.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const LAYER_8_VERSION = '1.0.0';

const SEVERITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

const SEVERITY_WEIGHTS = {
  critical: 100,
  high: 75,
  medium: 50,
  low: 25,
  info: 10
};

const IOC_CATEGORIES = {
  CODE_INJECTION: 'code-injection',
  BACKDOOR: 'backdoor',
  DATA_EXFILTRATION: 'data-exfiltration',
  CRYPTO_MINING: 'crypto-mining',
  PERSISTENCE: 'persistence',
  OBFUSCATION: 'obfuscation',
  SUPPLY_CHAIN: 'supply-chain',
  RSC_SPECIFIC: 'rsc-specific',
  WEBSHELL: 'webshell',
  NETWORK: 'network'
};

const IOC_SIGNATURES = {
  version: LAYER_8_VERSION,
  lastUpdated: '2025-12-07',
  
  signatures: [
    {
      id: 'NEUROLINT-IOC-001',
      name: 'Obfuscated Eval with Base64',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /eval\s*\(\s*atob\s*\(/gi,
      type: 'regex',
      description: 'eval() with atob() decoding - commonly used for payload obfuscation',
      references: ['CVE-2025-55182', 'MITRE T1027'],
      remediation: 'Remove the eval statement and investigate its origin',
      falsePositiveHints: ['Test files with intentional eval for testing purposes']
    },
    {
      id: 'NEUROLINT-IOC-002',
      name: 'Obfuscated Eval with Buffer',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /eval\s*\(\s*Buffer\.from\s*\(/gi,
      type: 'regex',
      description: 'eval() with Buffer.from() - Node.js payload obfuscation',
      references: ['CVE-2025-55182'],
      remediation: 'Remove the eval statement and investigate its origin'
    },
    {
      id: 'NEUROLINT-IOC-003',
      name: 'Dynamic Function Constructor',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /new\s+Function\s*\(/gi,
      type: 'regex',
      description: 'Dynamic function creation can execute arbitrary code',
      references: ['MITRE T1059'],
      remediation: 'Replace with static function definitions'
    },
    {
      id: 'NEUROLINT-IOC-004',
      name: 'Function Constructor via Prototype',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /\[\s*['"]constructor['"]\s*\]\s*\(\s*['"]return/gi,
      type: 'regex',
      description: 'Accessing Function constructor via prototype chain - evasion technique',
      remediation: 'Remove this code pattern immediately'
    },
    {
      id: 'NEUROLINT-IOC-005',
      name: 'Child Process Spawn',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /require\s*\(\s*['"]child_process['"]\s*\)/gi,
      type: 'regex',
      description: 'child_process module can execute system commands',
      references: ['MITRE T1059.004'],
      remediation: 'Verify this is intentional and required for the application',
      contextRequired: true
    },
    {
      id: 'NEUROLINT-IOC-006',
      name: 'Shell Command Execution',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:exec|execSync|spawn|spawnSync)\s*\(\s*[`'"][^`'"]*(?:sh|bash|cmd|powershell)/gi,
      type: 'regex',
      description: 'Direct shell command execution detected',
      references: ['MITRE T1059.004'],
      remediation: 'Remove shell command execution or verify it is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-007',
      name: 'Base64 Encoded Long String',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /['"`][A-Za-z0-9+/=]{100,}['"`]/g,
      type: 'regex',
      description: 'Long Base64-like string that may contain encoded payload',
      remediation: 'Decode and inspect the string contents',
      contextRequired: true
    },
    {
      id: 'NEUROLINT-IOC-008',
      name: 'Hexadecimal Escape Sequences',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:\\x[0-9a-fA-F]{2}){10,}/g,
      type: 'regex',
      description: 'Multiple hex escape sequences - potential obfuscated code',
      remediation: 'Decode and inspect the content'
    },
    {
      id: 'NEUROLINT-IOC-009',
      name: 'Unicode Escape Obfuscation',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:\\u[0-9a-fA-F]{4}){10,}/g,
      type: 'regex',
      description: 'Multiple unicode escape sequences - potential obfuscated code',
      remediation: 'Decode and inspect the content'
    },
    {
      id: 'NEUROLINT-IOC-010',
      name: 'Suspicious Network Request to IP',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:fetch|axios|http\.request|https\.request)\s*\(\s*['"`]https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/gi,
      type: 'regex',
      description: 'Network request to raw IP address - potential data exfiltration',
      references: ['MITRE T1041'],
      remediation: 'Verify this endpoint is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-011',
      name: 'WebSocket to Unknown Domain',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /new\s+WebSocket\s*\(\s*['"`]wss?:\/\/(?!localhost|127\.0\.0\.1)/gi,
      type: 'regex',
      description: 'WebSocket connection to external domain',
      remediation: 'Verify this WebSocket endpoint is legitimate',
      contextRequired: true
    },
    {
      id: 'NEUROLINT-IOC-012',
      name: 'Crypto Mining Library Import',
      category: IOC_CATEGORIES.CRYPTO_MINING,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /require\s*\(\s*['"](?:coinhive|cryptonight|monero-miner|xmrig|stratum)/gi,
      type: 'regex',
      description: 'Cryptocurrency mining library detected',
      references: ['MITRE T1496'],
      remediation: 'Remove the crypto mining code immediately'
    },
    {
      id: 'NEUROLINT-IOC-013',
      name: 'Worker-based Mining Pattern',
      category: IOC_CATEGORIES.CRYPTO_MINING,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /new\s+Worker\s*\([^)]*(?:miner|hash|crypto|coin)/gi,
      type: 'regex',
      description: 'Web Worker with mining-related name',
      remediation: 'Verify this Worker is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-014',
      name: 'Postinstall Script Execution',
      category: IOC_CATEGORIES.SUPPLY_CHAIN,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /"(?:postinstall|preinstall|install)"\s*:\s*"[^"]*(?:curl|wget|node\s+-e|sh\s+-c)/gi,
      type: 'regex',
      fileTypes: ['package.json'],
      description: 'Suspicious postinstall script with network or shell commands',
      references: ['MITRE T1195.002'],
      remediation: 'Inspect the postinstall script carefully'
    },
    {
      id: 'NEUROLINT-IOC-015',
      name: 'Environment Variable Exfiltration',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:fetch|axios|http\.request)\s*\([^)]*process\.env/gi,
      type: 'regex',
      description: 'Sending environment variables over network - credential theft',
      references: ['MITRE T1552.001'],
      remediation: 'Remove this code immediately - likely credential theft'
    },
    {
      id: 'NEUROLINT-IOC-016',
      name: 'Rogue use server Directive',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"]\s*;?\s*(?:import|require)\s*\(\s*['"](?:child_process|fs|net|http)/gi,
      type: 'regex',
      description: 'Server action importing dangerous modules',
      references: ['CVE-2025-55182'],
      remediation: 'Verify this server action is legitimate',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-017',
      name: 'Dynamic Import with Variable',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /import\s*\(\s*[^'"`\s][^)]+\)/g,
      type: 'regex',
      description: 'Dynamic import with variable path - potential code injection',
      remediation: 'Use static import paths when possible',
      contextRequired: true
    },
    {
      id: 'NEUROLINT-IOC-018',
      name: 'Reverse Shell Pattern',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:net\.connect|socket\.connect)\s*\([^)]*\)\s*[^;]*(?:pipe|write)\s*\([^)]*(?:process|child)/gi,
      type: 'regex',
      description: 'Potential reverse shell - socket piping to process',
      references: ['MITRE T1059'],
      remediation: 'Remove this code immediately - likely backdoor'
    },
    {
      id: 'NEUROLINT-IOC-019',
      name: 'File System Write to System Paths',
      category: IOC_CATEGORIES.PERSISTENCE,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:fs\.writeFile|fs\.appendFile|writeFileSync)\s*\(\s*['"`](?:\/etc\/|\/usr\/|\/bin\/|C:\\Windows\\)/gi,
      type: 'regex',
      description: 'Writing to system directories - potential persistence mechanism',
      references: ['MITRE T1546'],
      remediation: 'Remove writes to system directories'
    },
    {
      id: 'NEUROLINT-IOC-020',
      name: 'Hidden Endpoint Pattern',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:app|router)\s*\.(?:get|post|all)\s*\(\s*['"`]\/(?:\.hidden|_internal|__backdoor|admin_secret)/gi,
      type: 'regex',
      description: 'Suspiciously named hidden API endpoint',
      remediation: 'Verify this endpoint is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-021',
      name: 'setTimeout/setInterval with String',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:setTimeout|setInterval)\s*\(\s*['"`][^'"`)]+['"]/gi,
      type: 'regex',
      description: 'setTimeout/setInterval with string argument - implicit eval',
      remediation: 'Use function reference instead of string'
    },
    {
      id: 'NEUROLINT-IOC-022',
      name: 'Document Write Pattern',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /document\.write\s*\(\s*(?:unescape|decodeURIComponent|atob)\s*\(/gi,
      type: 'regex',
      description: 'document.write with decoded content - XSS pattern',
      remediation: 'Avoid document.write with decoded content'
    },
    {
      id: 'NEUROLINT-IOC-023',
      name: 'Inline Script Injection',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /innerHTML\s*=\s*[^;]*<script/gi,
      type: 'regex',
      description: 'Script tag injection via innerHTML',
      remediation: 'Avoid innerHTML with script tags'
    },
    {
      id: 'NEUROLINT-IOC-024',
      name: 'SSH Key Pattern in Code',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/g,
      type: 'regex',
      description: 'Private SSH key embedded in code',
      remediation: 'Remove private key from source code immediately'
    },
    {
      id: 'NEUROLINT-IOC-025',
      name: 'AWS Credentials in Code',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
      type: 'regex',
      description: 'AWS access key ID found in code',
      remediation: 'Remove AWS credentials and rotate immediately'
    }
  ]
};

const DETECTION_MODES = {
  QUICK: 'quick',
  STANDARD: 'standard',
  DEEP: 'deep',
  PARANOID: 'paranoid'
};

const MODE_CONFIGURATIONS = {
  [DETECTION_MODES.QUICK]: {
    description: 'Fast signature-only scan',
    enabledDetectors: ['signature'],
    maxFileSize: 5 * 1024 * 1024,
    timeout: 10000
  },
  [DETECTION_MODES.STANDARD]: {
    description: 'Signatures + behavioral analysis',
    enabledDetectors: ['signature', 'behavioral'],
    maxFileSize: 10 * 1024 * 1024,
    timeout: 30000
  },
  [DETECTION_MODES.DEEP]: {
    description: 'Full forensic analysis',
    enabledDetectors: ['signature', 'behavioral', 'dependency', 'network'],
    maxFileSize: 50 * 1024 * 1024,
    timeout: 120000
  },
  [DETECTION_MODES.PARANOID]: {
    description: 'Everything including dependency hashing',
    enabledDetectors: ['signature', 'behavioral', 'dependency', 'network', 'integrity'],
    maxFileSize: 100 * 1024 * 1024,
    timeout: 600000
  }
};

const FILE_TYPE_ASSOCIATIONS = {
  '.js': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'CRYPTO_MINING'],
  '.jsx': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'RSC_SPECIFIC'],
  '.ts': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION'],
  '.tsx': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'RSC_SPECIFIC'],
  '.json': ['SUPPLY_CHAIN', 'PERSISTENCE'],
  '.mjs': ['CODE_INJECTION', 'BACKDOOR'],
  '.cjs': ['CODE_INJECTION', 'BACKDOOR']
};

const EXCLUDED_PATHS_DEFAULT = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/.git/**',
  '**/vendor/**',
  '**/*.min.js',
  '**/*.bundle.js'
];

module.exports = {
  LAYER_8_VERSION,
  SEVERITY_LEVELS,
  SEVERITY_WEIGHTS,
  IOC_CATEGORIES,
  IOC_SIGNATURES,
  DETECTION_MODES,
  MODE_CONFIGURATIONS,
  FILE_TYPE_ASSOCIATIONS,
  EXCLUDED_PATHS_DEFAULT
};
