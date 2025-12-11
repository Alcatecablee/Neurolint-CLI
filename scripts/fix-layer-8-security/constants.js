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


/**
 * Layer 8: Security Forensics - Constants and IoC Signatures
 * 
 * This module contains the IoC (Indicators of Compromise) signature database
 * and severity definitions for the security forensics layer.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 * 
 * Signature Coverage (90 IoC Signatures):
 * - CVE-2025-55182: React Server Components RCE (CRITICAL, CVSS 10.0)
 * - CVE-2025-55183: Source Code Exposure (MEDIUM, CVSS 5.3) - NEW Dec 11, 2025
 * - CVE-2025-55184: Denial of Service (HIGH, CVSS 7.5) - NEW Dec 11, 2025
 * - Next.js 13-16 specific attack patterns
 * - General supply-chain and persistence patterns
 * 
 * IMPORTANT: Versions 19.0.1, 19.1.2, 19.2.1 patched CVE-2025-55182 but are
 * STILL VULNERABLE to CVE-2025-55183 and CVE-2025-55184.
 * Fully patched versions: 19.0.2, 19.1.3, 19.2.2
 */

'use strict';

const LAYER_8_VERSION = '2.3.0';

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
  NEXTJS_SPECIFIC: 'nextjs-specific',
  WEBSHELL: 'webshell',
  NETWORK: 'network'
};

const IOC_SIGNATURES = {
  version: LAYER_8_VERSION,
  lastUpdated: '2025-12-11',
  
  signatures: [
    // ============================================================
    // CODE INJECTION SIGNATURES (IOC-001 to IOC-010)
    // ============================================================
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
      name: 'setTimeout/setInterval with String',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:setTimeout|setInterval)\s*\(\s*['"`][^'"`)]+['"]/gi,
      type: 'regex',
      description: 'setTimeout/setInterval with string argument - implicit eval',
      remediation: 'Use function reference instead of string'
    },
    {
      id: 'NEUROLINT-IOC-008',
      name: 'Document Write with Decode',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /document\.write\s*\(\s*(?:unescape|decodeURIComponent|atob)\s*\(/gi,
      type: 'regex',
      description: 'document.write with decoded content - XSS pattern',
      remediation: 'Avoid document.write with decoded content'
    },
    {
      id: 'NEUROLINT-IOC-009',
      name: 'Inline Script Injection via innerHTML',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /innerHTML\s*=\s*[^;]*<script/gi,
      type: 'regex',
      description: 'Script tag injection via innerHTML',
      remediation: 'Avoid innerHTML with script tags'
    },
    {
      id: 'NEUROLINT-IOC-010',
      name: 'Dynamic Import with Variable',
      category: IOC_CATEGORIES.CODE_INJECTION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /import\s*\(\s*[^'"`\s][^)]+\)/g,
      type: 'regex',
      description: 'Dynamic import with variable path - potential code injection',
      remediation: 'Use static import paths when possible',
      contextRequired: true
    },
    
    // ============================================================
    // OBFUSCATION SIGNATURES (IOC-011 to IOC-015)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-011',
      name: 'Base64 Encoded Long String',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /['"`][A-Za-z0-9+/=]{500,}['"`]/g,
      type: 'regex',
      description: 'Very long Base64-like string that may contain encoded payload',
      remediation: 'Decode and inspect the string contents',
      contextRequired: true,
      falsePositiveHints: ['JWT tokens', 'data URIs', 'source maps', 'legitimate encoded assets']
    },
    {
      id: 'NEUROLINT-IOC-012',
      name: 'Hexadecimal Escape Sequences',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:\\x[0-9a-fA-F]{2}){10,}/g,
      type: 'regex',
      description: 'Multiple hex escape sequences - potential obfuscated code',
      remediation: 'Decode and inspect the content'
    },
    {
      id: 'NEUROLINT-IOC-013',
      name: 'Unicode Escape Obfuscation',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:\\u[0-9a-fA-F]{4}){10,}/g,
      type: 'regex',
      description: 'Multiple unicode escape sequences - potential obfuscated code',
      remediation: 'Decode and inspect the content'
    },
    {
      id: 'NEUROLINT-IOC-014',
      name: 'Octal Escape Obfuscation',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:\\[0-7]{1,3}){10,}/g,
      type: 'regex',
      description: 'Multiple octal escape sequences - potential obfuscated code',
      remediation: 'Decode and inspect the content'
    },
    {
      id: 'NEUROLINT-IOC-015',
      name: 'JSFuck Style Obfuscation',
      category: IOC_CATEGORIES.OBFUSCATION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /\[\s*!\s*\[\s*\]\s*\+\s*\[\s*\]\s*\]/g,
      type: 'regex',
      description: 'JSFuck-style obfuscation pattern detected',
      references: ['MITRE T1027'],
      remediation: 'Decode and understand the obfuscated code'
    },

    // ============================================================
    // RSC-SPECIFIC SIGNATURES (IOC-016 to IOC-030) - CVE-2025-55182
    // ============================================================
    {
      id: 'NEUROLINT-IOC-016',
      name: 'Rogue use server with Dangerous Import',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"]\s*;?\s*(?:import|require)\s*\(\s*['"](?:child_process|fs|net|http)/gi,
      type: 'regex',
      description: 'Server action importing dangerous modules immediately after directive',
      references: ['CVE-2025-55182'],
      remediation: 'Verify this server action is legitimate and necessary',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-017',
      name: 'Server Action File System Access',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,500}(?:readFileSync|writeFileSync|readFile|writeFile)\s*\(/gi,
      type: 'regex',
      description: 'Server action with file system read/write operations',
      references: ['CVE-2025-55182'],
      remediation: 'Audit file system access patterns in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-018',
      name: 'Server Action Database Injection Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}(?:query|execute|raw)\s*\(\s*`[^`]*\$\{/gi,
      type: 'regex',
      description: 'Server action with raw SQL template injection vulnerability',
      references: ['CVE-2025-55182', 'OWASP SQL Injection'],
      remediation: 'Use parameterized queries instead of template strings',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-019',
      name: 'Server Action Eval Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,500}(?:eval|Function)\s*\(/gi,
      type: 'regex',
      description: 'Server action with eval or Function constructor - code execution',
      references: ['CVE-2025-55182'],
      remediation: 'Remove eval/Function usage from server actions immediately',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-020',
      name: 'Server Action Process Spawn',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}(?:spawn|exec|execSync|spawnSync)\s*\(/gi,
      type: 'regex',
      description: 'Server action spawning child processes - potential RCE',
      references: ['CVE-2025-55182', 'MITRE T1059'],
      remediation: 'Remove process spawning from server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-021',
      name: 'Server Action Environment Leakage',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,500}return[\s\S]{0,200}process\.env/gi,
      type: 'regex',
      description: 'Server action returning process.env - credential exposure',
      references: ['CVE-2025-55182'],
      remediation: 'Never return environment variables from server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-022',
      name: 'Malicious generateMetadata Export',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+(?:async\s+)?function\s+generateMetadata[\s\S]{0,500}(?:fetch|axios|http\.request)\s*\(\s*['"`]https?:\/\/\d/gi,
      type: 'regex',
      description: 'generateMetadata making requests to IP addresses',
      references: ['CVE-2025-55182'],
      remediation: 'Audit generateMetadata network requests',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-023',
      name: 'Malicious generateStaticParams Export',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+(?:async\s+)?function\s+generateStaticParams[\s\S]{0,500}(?:eval|Function|child_process)/gi,
      type: 'regex',
      description: 'generateStaticParams with code execution patterns',
      references: ['CVE-2025-55182'],
      remediation: 'Audit generateStaticParams for malicious code',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-024',
      name: 'use server in Unexpected Directory',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /['"]use server['"]/gi,
      type: 'regex',
      pathPattern: /(?:components|lib|utils|hooks|public|static)[\\/]/i,
      description: 'Server action directive in non-standard location',
      references: ['CVE-2025-55182'],
      remediation: 'Server actions should be in app/ or actions/ directories',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-025',
      name: 'Server Component Exfiltration Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}fetch\s*\([^)]*JSON\.stringify\s*\([^)]*(?:cookies|headers|session)/gi,
      type: 'regex',
      description: 'Server action sending cookies/headers/session to external endpoint',
      references: ['CVE-2025-55182', 'MITRE T1041'],
      remediation: 'Remove data exfiltration from server actions immediately',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-026',
      name: 'Server Action Import Smuggling',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,200}await\s+import\s*\(/gi,
      type: 'regex',
      description: 'Dynamic import within server action - potential module smuggling',
      references: ['CVE-2025-55182'],
      remediation: 'Use static imports in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-027',
      name: 'Server Action Prototype Pollution',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,500}(?:__proto__|prototype\s*\[|Object\.setPrototypeOf)/gi,
      type: 'regex',
      description: 'Server action with prototype pollution pattern',
      references: ['CVE-2025-55182'],
      remediation: 'Remove prototype manipulation from server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-028',
      name: 'Server Action SSRF Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,500}fetch\s*\(\s*(?:formData\.get|data\.|params\.)/gi,
      type: 'regex',
      description: 'Server action with user-controlled URL - SSRF vulnerability',
      references: ['CVE-2025-55182', 'OWASP SSRF'],
      remediation: 'Validate and whitelist URLs in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-029',
      name: 'Server Action Network Socket',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,500}(?:net\.connect|net\.createConnection|dgram\.createSocket)/gi,
      type: 'regex',
      description: 'Server action creating raw network connections',
      references: ['CVE-2025-55182'],
      remediation: 'Remove raw socket usage from server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-030',
      name: 'Server Action Credential Harvesting',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}(?:password|secret|apiKey|api_key|token)[\s\S]{0,100}fetch\s*\(/gi,
      type: 'regex',
      description: 'Server action extracting and transmitting credentials',
      references: ['CVE-2025-55182', 'MITRE T1552'],
      remediation: 'Audit credential handling in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },

    // ============================================================
    // NEXT.JS SPECIFIC SIGNATURES (IOC-031 to IOC-045)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-031',
      name: 'Malicious next.config.js Rewrite',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /rewrites\s*:\s*(?:async\s*)?\(\s*\)\s*=>[\s\S]{0,500}destination\s*:\s*['"`]https?:\/\/\d{1,3}\.\d{1,3}/gi,
      type: 'regex',
      description: 'next.config.js rewrite pointing to IP address',
      references: ['MITRE T1071'],
      remediation: 'Audit all rewrites for C2 redirection',
      fileTypes: ['.js', '.mjs', '.ts']
    },
    {
      id: 'NEUROLINT-IOC-032',
      name: 'Malicious next.config.js Redirect',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /redirects\s*:\s*(?:async\s*)?\(\s*\)\s*=>[\s\S]{0,500}destination\s*:\s*['"`]https?:\/\/(?!\w+\.(?:vercel|netlify|github))/gi,
      type: 'regex',
      description: 'next.config.js redirect to suspicious external domain',
      references: ['MITRE T1071'],
      remediation: 'Audit all redirects for phishing/C2',
      fileTypes: ['.js', '.mjs', '.ts']
    },
    {
      id: 'NEUROLINT-IOC-033',
      name: 'Webpack Plugin Injection',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /webpack\s*:\s*\(\s*config[\s\S]{0,500}plugins\.push\s*\(\s*new\s+(?!webpack\.)/gi,
      type: 'regex',
      description: 'Custom webpack plugin injection in next.config.js',
      references: ['MITRE T1195.002'],
      remediation: 'Audit custom webpack plugins for malicious behavior',
      fileTypes: ['.js', '.mjs', '.ts']
    },
    {
      id: 'NEUROLINT-IOC-034',
      name: 'Turbopack Loader Injection',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /turbo\s*:\s*\{[\s\S]{0,500}loaders\s*:\s*\{/gi,
      type: 'regex',
      description: 'Custom Turbopack loader configuration - verify legitimacy',
      remediation: 'Audit custom Turbopack loaders',
      fileTypes: ['.js', '.mjs', '.ts']
    },
    {
      id: 'NEUROLINT-IOC-035',
      name: 'Instrumentation File Tampering',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:export\s+(?:async\s+)?function\s+register|onRequestError)[\s\S]{0,500}(?:fetch|axios|http\.request)\s*\(\s*['"`]https?:\/\/\d/gi,
      type: 'regex',
      description: 'Instrumentation file sending data to IP address',
      references: ['MITRE T1041'],
      remediation: 'Audit instrumentation.ts for data exfiltration',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-036',
      name: 'Middleware Request Hijacking',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /export\s+(?:async\s+)?function\s+middleware[\s\S]{0,500}NextResponse\.rewrite\s*\(\s*new\s+URL\s*\(\s*['"`]https?:\/\/\d/gi,
      type: 'regex',
      description: 'Middleware rewriting requests to external IP',
      references: ['CVE-2025-55182', 'MITRE T1557'],
      remediation: 'Remove middleware request hijacking immediately',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-037',
      name: 'Middleware Cookie Exfiltration',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /export\s+(?:async\s+)?function\s+middleware[\s\S]{0,500}cookies\(\)[\s\S]{0,300}fetch\s*\(/gi,
      type: 'regex',
      description: 'Middleware sending cookies to external endpoint',
      references: ['CVE-2025-55182', 'MITRE T1539'],
      remediation: 'Audit middleware for credential theft',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-038',
      name: 'Route Handler Shell Execution',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH)[\s\S]{0,500}(?:exec|execSync|spawn|spawnSync)\s*\(/gi,
      type: 'regex',
      description: 'API route handler executing shell commands',
      references: ['CVE-2025-55182', 'MITRE T1059'],
      remediation: 'Remove shell execution from API routes',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-039',
      name: 'Route Handler Environment Exposure',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+(?:async\s+)?function\s+(?:GET|POST)[\s\S]{0,300}Response\.json\s*\([^)]*process\.env/gi,
      type: 'regex',
      description: 'API route returning environment variables',
      references: ['MITRE T1552'],
      remediation: 'Never expose environment variables via API',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-040',
      name: 'Malicious Layout Injection',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+default\s+(?:async\s+)?function\s+(?:Root)?Layout[\s\S]{0,1000}<script[\s\S]{0,200}dangerouslySetInnerHTML/gi,
      type: 'regex',
      description: 'Layout component with dangerouslySetInnerHTML script injection',
      references: ['CVE-2025-55182', 'OWASP XSS'],
      remediation: 'Remove script injection from layouts',
      fileTypes: ['.tsx', '.jsx']
    },
    {
      id: 'NEUROLINT-IOC-041',
      name: 'Malicious Error Boundary',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+default\s+function\s+(?:Global)?Error[\s\S]{0,500}fetch\s*\(\s*['"`]https?:\/\/\d/gi,
      type: 'regex',
      description: 'Error boundary sending error data to external IP',
      references: ['MITRE T1041'],
      remediation: 'Audit error boundary for data leakage',
      fileTypes: ['.tsx', '.jsx', '.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-042',
      name: 'Malicious Loading State',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /export\s+default\s+function\s+Loading[\s\S]{0,300}(?:useEffect|componentDidMount)[\s\S]{0,200}fetch\s*\(/gi,
      type: 'regex',
      description: 'Loading component with suspicious side effects',
      remediation: 'Loading components should be static UI only',
      fileTypes: ['.tsx', '.jsx']
    },
    {
      id: 'NEUROLINT-IOC-043',
      name: 'Edge Runtime Abuse',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /export\s+const\s+runtime\s*=\s*['"]edge['"][\s\S]{0,500}(?:eval|Function|import\s*\()/gi,
      type: 'regex',
      description: 'Edge runtime with code execution patterns',
      references: ['CVE-2025-55182'],
      remediation: 'Audit edge functions for code injection',
      fileTypes: ['.ts', '.js']
    },
    {
      id: 'NEUROLINT-IOC-044',
      name: 'Parallel Route Injection',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /@[\w]+\/[\s\S]{0,100}['"]use server['"]/gi,
      type: 'regex',
      pathPattern: /app[\\/]@[\w]+[\\/]/i,
      description: 'Server action in parallel route - verify legitimacy',
      references: ['CVE-2025-55182'],
      remediation: 'Audit parallel routes for hidden server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-045',
      name: 'Intercepting Route Abuse',
      category: IOC_CATEGORIES.NEXTJS_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /\(\.+\)[\w]+/gi,
      type: 'regex',
      pathPattern: /app[\\/]\([.]+\)/i,
      description: 'Intercepting route detected - verify legitimacy',
      remediation: 'Audit intercepting routes for request interception',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },

    // ============================================================
    // BACKDOOR SIGNATURES (IOC-046 to IOC-052)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-046',
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
      id: 'NEUROLINT-IOC-047',
      name: 'Hidden Endpoint Pattern',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:app|router)\s*\.(?:get|post|all)\s*\(\s*['"`]\/(?:\.hidden|_internal|__backdoor|admin_secret|\.well-known\/(?!acme))/gi,
      type: 'regex',
      description: 'Suspiciously named hidden API endpoint',
      remediation: 'Verify this endpoint is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-048',
      name: 'SSH Key in Code',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /-----BEGIN\s+(?:RSA|DSA|EC|OPENSSH)\s+PRIVATE\s+KEY-----/g,
      type: 'regex',
      description: 'Private SSH key embedded in code',
      remediation: 'Remove private key from source code immediately'
    },
    {
      id: 'NEUROLINT-IOC-049',
      name: 'Cron Job Persistence',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:fs\.writeFile|fs\.appendFile)\s*\(\s*['"`](?:\/var\/spool\/cron|\/etc\/cron)/gi,
      type: 'regex',
      description: 'Writing to cron directories - persistence mechanism',
      references: ['MITRE T1053.003'],
      remediation: 'Remove unauthorized cron modifications'
    },
    {
      id: 'NEUROLINT-IOC-050',
      name: 'Webshell Pattern',
      category: IOC_CATEGORIES.WEBSHELL,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:req|request)\.(?:body|query|params)[\s\S]{0,50}(?:eval|exec|spawn)\s*\(/gi,
      type: 'regex',
      description: 'Request parameter directly passed to code execution',
      references: ['MITRE T1505.003'],
      remediation: 'Remove webshell code immediately'
    },
    {
      id: 'NEUROLINT-IOC-051',
      name: 'Docker Escape Pattern',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:\/var\/run\/docker\.sock|docker\.sock|--privileged)/gi,
      type: 'regex',
      description: 'Docker socket access or privileged container pattern',
      references: ['MITRE T1611'],
      remediation: 'Audit container escape attempts'
    },
    {
      id: 'NEUROLINT-IOC-052',
      name: 'Process Memory Access',
      category: IOC_CATEGORIES.BACKDOOR,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /\/proc\/(?:self\/mem|kcore|kmem)|ptrace\s*\(/gi,
      type: 'regex',
      description: 'Accessing process memory or using ptrace',
      references: ['MITRE T1055'],
      remediation: 'Remove memory access patterns'
    },

    // ============================================================
    // DATA EXFILTRATION SIGNATURES (IOC-053 to IOC-058)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-053',
      name: 'Network Request to IP Address',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:fetch|axios|http\.request|https\.request)\s*\(\s*['"`]https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/gi,
      type: 'regex',
      description: 'Network request to raw IP address - potential data exfiltration',
      references: ['MITRE T1041'],
      remediation: 'Verify this endpoint is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-054',
      name: 'WebSocket to External Domain',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /new\s+WebSocket\s*\(\s*['"`]wss?:\/\/(?!localhost|127\.0\.0\.1)/gi,
      type: 'regex',
      description: 'WebSocket connection to external domain',
      remediation: 'Verify this WebSocket endpoint is legitimate',
      contextRequired: true
    },
    {
      id: 'NEUROLINT-IOC-055',
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
      id: 'NEUROLINT-IOC-056',
      name: 'AWS Credentials in Code',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g,
      type: 'regex',
      description: 'AWS access key ID found in code',
      remediation: 'Remove AWS credentials and rotate immediately'
    },
    {
      id: 'NEUROLINT-IOC-057',
      name: 'DNS Exfiltration Pattern',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /dns\.(?:resolve|lookup)\s*\(\s*[`'"][^`'"]*\$\{/gi,
      type: 'regex',
      description: 'DNS query with interpolated data - DNS exfiltration',
      references: ['MITRE T1048'],
      remediation: 'Audit DNS queries for data exfiltration'
    },
    {
      id: 'NEUROLINT-IOC-058',
      name: 'Beacon/Heartbeat Pattern',
      category: IOC_CATEGORIES.DATA_EXFILTRATION,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /setInterval\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*(?:\{[\s\S]{0,100})?fetch\s*\(/gi,
      type: 'regex',
      description: 'Periodic beacon/heartbeat to external server',
      references: ['MITRE T1071'],
      remediation: 'Verify periodic requests are legitimate',
      contextRequired: true
    },

    // ============================================================
    // SUPPLY CHAIN SIGNATURES (IOC-059 to IOC-063)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-059',
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
      id: 'NEUROLINT-IOC-060',
      name: 'NPM Prepare Hook Abuse',
      category: IOC_CATEGORIES.SUPPLY_CHAIN,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /"(?:prepare|prepublish|prepublishOnly)"\s*:\s*"[^"]*(?:curl|wget|node\s+-e)/gi,
      type: 'regex',
      fileTypes: ['package.json'],
      description: 'Suspicious prepare hook with network commands',
      references: ['MITRE T1195.002'],
      remediation: 'Audit npm lifecycle hooks'
    },
    {
      id: 'NEUROLINT-IOC-061',
      name: 'Git Hook Tampering',
      category: IOC_CATEGORIES.SUPPLY_CHAIN,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:\.git\/hooks|\.husky)[\s\S]{0,100}(?:curl|wget|nc\s|bash\s+-i)/gi,
      type: 'regex',
      description: 'Git hook with suspicious commands',
      references: ['MITRE T1195.002'],
      remediation: 'Audit git hooks for malicious commands'
    },
    {
      id: 'NEUROLINT-IOC-062',
      name: 'Typosquatting Package Import',
      category: IOC_CATEGORIES.SUPPLY_CHAIN,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /(?:require|import)\s*\(\s*['"](?:loadsh|requets|axois|expresss|recat|nextts)['"](?:\s*\))?/gi,
      type: 'regex',
      description: 'Possible typosquatting package import detected',
      references: ['MITRE T1195.002'],
      remediation: 'Verify package name is correct'
    },
    {
      id: 'NEUROLINT-IOC-063',
      name: 'Malicious Babel/SWC Plugin',
      category: IOC_CATEGORIES.SUPPLY_CHAIN,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:plugins|presets)\s*:\s*\[[\s\S]{0,200}['"`][^'"`]*(?:obfuscate|inject|backdoor)/gi,
      type: 'regex',
      description: 'Suspicious Babel/SWC plugin name',
      references: ['MITRE T1195.002'],
      remediation: 'Audit build tool plugins'
    },

    // ============================================================
    // PERSISTENCE SIGNATURES (IOC-064 to IOC-067)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-064',
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
      id: 'NEUROLINT-IOC-065',
      name: 'Systemd Service Creation',
      category: IOC_CATEGORIES.PERSISTENCE,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:fs\.writeFile|fs\.appendFile)\s*\(\s*['"`](?:\/etc\/systemd|\/lib\/systemd)/gi,
      type: 'regex',
      description: 'Writing to systemd directories - service persistence',
      references: ['MITRE T1543.002'],
      remediation: 'Audit systemd service creation'
    },
    {
      id: 'NEUROLINT-IOC-066',
      name: 'Registry Persistence (Windows)',
      category: IOC_CATEGORIES.PERSISTENCE,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:reg\s+add|HKEY_(?:LOCAL_MACHINE|CURRENT_USER)\\Software\\Microsoft\\Windows\\CurrentVersion\\Run)/gi,
      type: 'regex',
      description: 'Windows registry run key persistence',
      references: ['MITRE T1547.001'],
      remediation: 'Remove registry persistence mechanisms'
    },
    {
      id: 'NEUROLINT-IOC-067',
      name: 'Profile/RC File Modification',
      category: IOC_CATEGORIES.PERSISTENCE,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:fs\.writeFile|fs\.appendFile)\s*\(\s*['"`](?:~?\/\.(?:bash|zsh|profile|bashrc|zshrc))/gi,
      type: 'regex',
      description: 'Modifying shell profile files - persistence',
      references: ['MITRE T1546.004'],
      remediation: 'Audit shell profile modifications'
    },

    // ============================================================
    // CRYPTO MINING SIGNATURES (IOC-068 to IOC-070)
    // ============================================================
    {
      id: 'NEUROLINT-IOC-068',
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
      id: 'NEUROLINT-IOC-069',
      name: 'Worker-based Mining Pattern',
      category: IOC_CATEGORIES.CRYPTO_MINING,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /new\s+Worker\s*\([^)]*(?:miner|hash|crypto|coin|monero|xmr)/gi,
      type: 'regex',
      description: 'Web Worker with mining-related name',
      remediation: 'Verify this Worker is legitimate'
    },
    {
      id: 'NEUROLINT-IOC-070',
      name: 'Stratum Protocol Pattern',
      category: IOC_CATEGORIES.CRYPTO_MINING,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /stratum\+tcp:\/\/|mining\.(?:pool|proxy)|(?:xmr|btc)\.(?:pool|mine)/gi,
      type: 'regex',
      description: 'Mining pool connection URL detected',
      references: ['MITRE T1496'],
      remediation: 'Remove mining pool connections'
    },

    // ============================================================
    // CVE-2025-55182 EXTENDED SIGNATURES (IOC-071 to IOC-080)
    // WebSocket, Service Worker, PWA, and Response Caching attacks
    // ============================================================
    {
      id: 'NEUROLINT-IOC-071',
      name: 'Server Action WebSocket Exfiltration',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}new\s+WebSocket\s*\(\s*['"`]wss?:\/\/\d/gi,
      type: 'regex',
      description: 'Server action opening WebSocket to IP address - real-time data exfiltration',
      references: ['CVE-2025-55182', 'MITRE T1041'],
      remediation: 'Remove WebSocket connections from server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-072',
      name: 'Server Action WebSocket C2 Channel',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,200}(?:ws|socket)\.(?:on|addEventListener)\s*\(\s*['"]message/gi,
      type: 'regex',
      description: 'Server action with WebSocket message listener - potential C2 channel',
      references: ['CVE-2025-55182', 'MITRE T1571'],
      remediation: 'Audit WebSocket usage in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-073',
      name: 'Malicious Service Worker Registration',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /navigator\.serviceWorker\.register\s*\(\s*['"`](?:https?:\/\/\d|[^'"]*\$\{)/gi,
      type: 'regex',
      description: 'Service Worker registration with dynamic or IP-based URL',
      references: ['CVE-2025-55182', 'MITRE T1189'],
      remediation: 'Verify Service Worker source is legitimate',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-074',
      name: 'Service Worker Fetch Interception',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /self\.addEventListener\s*\(\s*['"]fetch['"][\s\S]{0,200}respondWith[\s\S]{0,100}fetch\s*\(\s*['"`]https?:\/\/\d/gi,
      type: 'regex',
      description: 'Service Worker intercepting requests and forwarding to IP address',
      references: ['CVE-2025-55182', 'MITRE T1557'],
      remediation: 'Audit Service Worker fetch handlers',
      fileTypes: ['.js', '.ts']
    },
    {
      id: 'NEUROLINT-IOC-075',
      name: 'PWA Manifest Tampering',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /"start_url"\s*:\s*"https?:\/\/\d{1,3}\.\d{1,3}/gi,
      type: 'regex',
      description: 'PWA manifest with start_url pointing to IP address',
      references: ['CVE-2025-55182'],
      remediation: 'Verify PWA manifest URLs are legitimate',
      fileTypes: ['.json', '.webmanifest']
    },
    {
      id: 'NEUROLINT-IOC-076',
      name: 'PWA Manifest Malicious Scope',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /"scope"\s*:\s*"https?:\/\/(?!\w+\.(?:vercel|netlify|github|localhost))/gi,
      type: 'regex',
      description: 'PWA manifest with suspicious external scope',
      references: ['CVE-2025-55182'],
      remediation: 'Verify PWA scope is correct',
      fileTypes: ['.json', '.webmanifest']
    },
    {
      id: 'NEUROLINT-IOC-077',
      name: 'Server Action Response Caching Attack',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,150}(?:cache|revalidate)[\s\S]{0,50}(?:cookies|headers|session)/gi,
      type: 'regex',
      description: 'Server action caching sensitive data - cache poisoning risk',
      references: ['CVE-2025-55182', 'OWASP Cache Poisoning'],
      remediation: 'Never cache sensitive data in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-078',
      name: 'Server Action Streaming Attack',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,150}(?:ReadableStream|TransformStream)[\s\S]{0,100}(?:process\.env|credentials)/gi,
      type: 'regex',
      description: 'Server action streaming sensitive data',
      references: ['CVE-2025-55182'],
      remediation: 'Audit streaming data in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-079',
      name: 'Server Action FormData Injection',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,150}formData\.get\s*\([^)]+\)[\s\S]{0,50}(?:eval|exec|spawn|import\s*\()/gi,
      type: 'regex',
      description: 'Server action using form data in code execution',
      references: ['CVE-2025-55182', 'OWASP Injection'],
      remediation: 'Sanitize all form data inputs in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-080',
      name: 'Server Action Bind Exploitation',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /\.bind\s*\(\s*null[\s\S]{0,50}['"]use server['"]/gi,
      type: 'regex',
      description: 'Server action using bind() which can bypass security checks',
      references: ['CVE-2025-55182'],
      remediation: 'Avoid using bind() with server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },

    // ============================================================
    // CVE-2025-55184 DENIAL OF SERVICE SIGNATURES (IOC-081 to IOC-085)
    // Disclosed: December 11, 2025 - CVSS 7.5 (HIGH)
    // Malicious request causes infinite loop during deserialization
    // ============================================================
    {
      id: 'NEUROLINT-IOC-081',
      name: 'Server Action Infinite Loop Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,300}(?:while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|while\s*\(\s*1\s*\))/gi,
      type: 'regex',
      description: 'Server action with potential infinite loop - DoS vulnerability indicator',
      references: ['CVE-2025-55184', 'MITRE T1499'],
      remediation: 'Remove infinite loops or add proper termination conditions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-082',
      name: 'Server Action Recursive Self-Call',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,100}(?:async\s+)?function\s+(\w+)[\s\S]{0,200}\1\s*\(/gi,
      type: 'regex',
      description: 'Server action with unbounded recursion - potential DoS',
      references: ['CVE-2025-55184'],
      remediation: 'Add recursion depth limits or termination conditions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-083',
      name: 'Server Action setImmediate/queueMicrotask Loop',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,200}\b(?:setImmediate|queueMicrotask|process\.nextTick)\s*\([^)]*\b(?:setImmediate|queueMicrotask|process\.nextTick)\b/gi,
      type: 'regex',
      description: 'Server action with recursive async scheduling - DoS pattern',
      references: ['CVE-2025-55184', 'MITRE T1499'],
      remediation: 'Avoid recursive async scheduling in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-084',
      name: 'RSC Payload Replay Loop',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /(?:JSON\.parse|decodeURIComponent)\s*\([^)]+\)[\s\S]{0,100}(?:while|for)\s*\(/gi,
      type: 'regex',
      description: 'Parsed request payload used in loop - potential DoS amplification',
      references: ['CVE-2025-55184'],
      remediation: 'Validate and limit iterations when processing request data',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-085',
      name: 'Flight Protocol Deserialization Attack Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /createFromReadableStream|decodeReply|decodeAction|decodeFormState/gi,
      type: 'regex',
      description: 'Direct RSC Flight protocol deserialization - attack surface for CVE-2025-55184',
      references: ['CVE-2025-55184', 'CVE-2025-55182'],
      remediation: 'Ensure RSC packages are updated to patched versions (19.0.2+, 19.1.3+, 19.2.2+)',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js'],
      contextRequired: true
    },

    // ============================================================
    // CVE-2025-55183 SOURCE CODE EXPOSURE SIGNATURES (IOC-086 to IOC-090)
    // Disclosed: December 11, 2025 - CVSS 5.3 (MEDIUM)
    // Malicious request can leak Server Function source code
    // ============================================================
    {
      id: 'NEUROLINT-IOC-086',
      name: 'Server Function toString Exposure',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,300}\.toString\s*\(\s*\)/gi,
      type: 'regex',
      description: 'Server action exposing function source via toString() - source code leak risk',
      references: ['CVE-2025-55183'],
      remediation: 'Never expose server function source code',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-087',
      name: 'Server Action Stringification Pattern',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.HIGH,
      pattern: /['"]use server['"][\s\S]{0,200}(?:String\s*\(|`\$\{[^}]*function|JSON\.stringify\s*\([^)]*function)/gi,
      type: 'regex',
      description: 'Server action with function stringification - potential source code exposure',
      references: ['CVE-2025-55183'],
      remediation: 'Avoid converting functions to strings in server actions',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-088',
      name: 'Server Action Hardcoded Secrets',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,500}(?:password|secret|api[_-]?key|auth[_-]?token|private[_-]?key)\s*[=:]\s*['"][^'"]{8,}['"]/gi,
      type: 'regex',
      description: 'Hardcoded secrets in server action - will be exposed via CVE-2025-55183',
      references: ['CVE-2025-55183', 'OWASP Sensitive Data Exposure'],
      remediation: 'Use environment variables instead of hardcoded secrets',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-089',
      name: 'Server Action Connection String Exposure',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.CRITICAL,
      pattern: /['"]use server['"][\s\S]{0,300}(?:mongodb|postgres|mysql|redis|amqp):\/\/[^'"]+:[^'"]+@/gi,
      type: 'regex',
      description: 'Database connection string with credentials in server action - will be exposed',
      references: ['CVE-2025-55183'],
      remediation: 'Use environment variables for database credentials',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
    },
    {
      id: 'NEUROLINT-IOC-090',
      name: 'Server Action Error Handler Source Leak',
      category: IOC_CATEGORIES.RSC_SPECIFIC,
      severity: SEVERITY_LEVELS.MEDIUM,
      pattern: /['"]use server['"][\s\S]{0,300}catch\s*\([^)]*\)\s*\{[\s\S]{0,100}(?:console\.(?:log|error)|res\.(?:json|send))\s*\([^)]*(?:err|error|e)\.(?:stack|message)/gi,
      type: 'regex',
      description: 'Server action error handler may leak source code in stack traces',
      references: ['CVE-2025-55183'],
      remediation: 'Sanitize error messages before sending to client',
      fileTypes: ['.tsx', '.ts', '.jsx', '.js']
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
  '.js': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'CRYPTO_MINING', 'NEXTJS_SPECIFIC'],
  '.jsx': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'RSC_SPECIFIC', 'NEXTJS_SPECIFIC'],
  '.ts': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'NEXTJS_SPECIFIC'],
  '.tsx': ['CODE_INJECTION', 'BACKDOOR', 'OBFUSCATION', 'RSC_SPECIFIC', 'NEXTJS_SPECIFIC'],
  '.json': ['SUPPLY_CHAIN', 'PERSISTENCE'],
  '.mjs': ['CODE_INJECTION', 'BACKDOOR', 'NEXTJS_SPECIFIC'],
  '.cjs': ['CODE_INJECTION', 'BACKDOOR']
};

const EXCLUDED_PATHS_DEFAULT = [
  '**/node_modules/**',
  '**/.neurolint/**',
  '**/.neurolint-backups/**',
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
