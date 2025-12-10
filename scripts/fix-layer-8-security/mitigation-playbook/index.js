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
 * Mitigation Playbook Generator
 * 
 * Generates actionable guidance when patching is blocked or impossible.
 * Provides compensating controls for CVE-2025-55182 when version upgrade fails.
 * 
 * USE CASES:
 * 1. Peer dependency conflicts prevent upgrade
 * 2. Breaking changes in patched versions require significant refactoring
 * 3. Enterprise environments with frozen dependency policies
 * 4. Staging/investigation period before full upgrade
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

const PLAYBOOK_TEMPLATES = {
  WAF_RULES: {
    id: 'WAF_RULES',
    title: 'Web Application Firewall Rules',
    priority: 1,
    effectiveness: 'HIGH',
    implementationTime: '1-2 hours',
    description: 'Block malicious Flight protocol payloads at the network edge',
    steps: [
      {
        title: 'Add regex filter for CVE-2025-55182 exploit signatures',
        detail: 'Configure WAF to block requests matching known exploit patterns',
        code: `# Example Cloudflare WAF rule (adjust for your provider)
# Block requests with suspicious Flight payload patterns
(http.request.body.raw contains "\\\\x00" and 
 http.request.body.raw contains "react-server") or
(http.request.uri.path contains "/_next/data" and 
 http.request.body.size > 50000)`
      },
      {
        title: 'Rate limit RSC endpoints',
        detail: 'Limit requests to server action endpoints to slow down exploitation attempts',
        code: `# Rate limit rule for Next.js App Router endpoints
http.request.uri.path matches "^/_next/(data|static)" 
  -> rate_limit(100 requests per 10 seconds)`
      },
      {
        title: 'Enable request body inspection',
        detail: 'Ensure WAF inspects full request bodies for malformed payloads'
      }
    ]
  },
  
  CSP_HEADERS: {
    id: 'CSP_HEADERS',
    title: 'Content Security Policy Hardening',
    priority: 2,
    effectiveness: 'MEDIUM',
    implementationTime: '30 minutes',
    description: 'Restrict script execution to prevent injected payload execution',
    steps: [
      {
        title: 'Add strict CSP headers',
        detail: 'Configure restrictive Content-Security-Policy to limit script sources',
        code: `// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: \`
      default-src 'self';
      script-src 'self' 'nonce-{RANDOM}';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      upgrade-insecure-requests;
    \`.replace(/\\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: securityHeaders
    }];
  }
};`
      }
    ]
  },
  
  NETWORK_ISOLATION: {
    id: 'NETWORK_ISOLATION',
    title: 'Network Segmentation',
    priority: 3,
    effectiveness: 'HIGH',
    implementationTime: '2-4 hours',
    description: 'Isolate vulnerable application to limit blast radius',
    steps: [
      {
        title: 'Place application behind reverse proxy',
        detail: 'Use nginx or HAProxy to filter and sanitize incoming requests'
      },
      {
        title: 'Disable direct internet access from application servers',
        detail: 'Prevent data exfiltration by blocking outbound connections'
      },
      {
        title: 'Implement egress filtering',
        detail: 'Only allow necessary outbound connections (database, APIs)'
      }
    ]
  },
  
  MONITORING: {
    id: 'MONITORING',
    title: 'Enhanced Monitoring & Alerting',
    priority: 1,
    effectiveness: 'MEDIUM',
    implementationTime: '1-2 hours',
    description: 'Detect exploitation attempts in real-time',
    steps: [
      {
        title: 'Enable verbose logging for RSC requests',
        detail: 'Log all server action invocations with request details',
        code: `// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log all server action requests
  if (request.nextUrl.pathname.includes('/_next/') || 
      request.headers.get('content-type')?.includes('application/x-www-form-urlencoded')) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'SERVER_ACTION_REQUEST',
      path: request.nextUrl.pathname,
      method: request.method,
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      contentLength: request.headers.get('content-length')
    }));
  }
  return NextResponse.next();
}`
      },
      {
        title: 'Set up alerts for anomalous patterns',
        detail: 'Alert on: large payloads, many requests from single IP, unusual paths',
        code: `# Example Datadog monitor (adjust for your platform)
# Alert on suspicious RSC request patterns
query = """
  logs("service:nextjs path:*/_next/* content_length:>10000")
    .rollup("count")
    .last("5m") > 100
"""
alert_message = "High volume of large RSC requests detected - possible CVE-2025-55182 exploitation"`
      }
    ]
  },
  
  INPUT_VALIDATION: {
    id: 'INPUT_VALIDATION',
    title: 'Server Action Input Validation',
    priority: 1,
    effectiveness: 'MEDIUM',
    implementationTime: '1-3 hours',
    description: 'Add runtime validation to all server actions',
    steps: [
      {
        title: 'Wrap server actions with validation layer',
        detail: 'Use Zod or similar to validate all incoming data',
        code: `// lib/safe-action.ts
import { z } from 'zod';

export function createSafeAction<T extends z.ZodTypeAny>(
  schema: T,
  action: (validatedData: z.infer<T>) => Promise<any>
) {
  return async (formData: FormData) => {
    // Validate all input
    const rawData = Object.fromEntries(formData.entries());
    const result = schema.safeParse(rawData);
    
    if (!result.success) {
      console.warn('[SECURITY] Invalid input to server action:', result.error);
      return { error: 'Invalid input' };
    }
    
    return action(result.data);
  };
}

// Usage:
// 'use server';
// export const submitForm = createSafeAction(
//   z.object({ email: z.string().email(), name: z.string().max(100) }),
//   async (data) => { /* safe data */ }
// );`
      },
      {
        title: 'Add request size limits',
        detail: 'Limit the size of incoming server action payloads',
        code: `// middleware.ts
const MAX_BODY_SIZE = 1024 * 100; // 100KB

export function middleware(request: NextRequest) {
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  
  if (contentLength > MAX_BODY_SIZE) {
    console.warn('[SECURITY] Request body too large:', contentLength);
    return new Response('Request too large', { status: 413 });
  }
  
  return NextResponse.next();
}`
      }
    ]
  },
  
  DISABLE_RSC: {
    id: 'DISABLE_RSC',
    title: 'Disable React Server Components (Extreme)',
    priority: 5,
    effectiveness: 'COMPLETE',
    implementationTime: '4-8 hours',
    description: 'Temporarily disable RSC to eliminate attack surface',
    steps: [
      {
        title: 'Convert to Pages Router temporarily',
        detail: 'If feasible, move to Pages Router which is not affected',
        warning: 'This is a significant architectural change. Only use if other mitigations are insufficient.'
      },
      {
        title: 'Add "use client" to all components',
        detail: 'Force all components to render client-side',
        code: `// Run this script to add 'use client' to all components
// scripts/add-use-client.js
const glob = require('glob');
const fs = require('fs');

glob('app/**/*.{tsx,jsx}', (err, files) => {
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("'use client'") && !content.includes("'use server'")) {
      content = "'use client';\\n\\n" + content;
      fs.writeFileSync(file, content);
      console.log('Added use client to:', file);
    }
  });
});`
      }
    ]
  }
};

class MitigationPlaybookGenerator {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      outputFormat: options.outputFormat || 'cli',
      ...options
    };
  }

  async generate(context = {}) {
    const playbook = {
      generated: new Date().toISOString(),
      cve: 'CVE-2025-55182',
      context: {
        patchBlocked: context.patchBlocked || false,
        blockReason: context.blockReason || 'Unknown',
        currentReactVersion: context.reactVersion || 'Unknown',
        currentNextVersion: context.nextVersion || 'Unknown',
        hasWAF: context.hasWAF || false,
        environment: context.environment || 'production'
      },
      urgency: this.calculateUrgency(context),
      mitigations: [],
      timeline: this.generateTimeline(context)
    };

    const applicableMitigations = this.selectMitigations(context);
    playbook.mitigations = applicableMitigations;

    return playbook;
  }

  calculateUrgency(context) {
    if (context.exposed && context.activelyExploited) {
      return {
        level: 'CRITICAL',
        message: 'Immediate action required. Active exploitation detected.',
        timeframe: 'Within hours'
      };
    }
    
    if (context.exposed) {
      return {
        level: 'HIGH',
        message: 'Application is exposed to the internet. Prioritize mitigation.',
        timeframe: 'Within 24 hours'
      };
    }
    
    return {
      level: 'MEDIUM',
      message: 'Apply mitigations before next production deployment.',
      timeframe: 'Within 1 week'
    };
  }

  selectMitigations(context) {
    const mitigations = [];

    mitigations.push(PLAYBOOK_TEMPLATES.MONITORING);
    mitigations.push(PLAYBOOK_TEMPLATES.INPUT_VALIDATION);

    if (context.hasWAF || context.canAddWAF) {
      mitigations.push(PLAYBOOK_TEMPLATES.WAF_RULES);
    }

    mitigations.push(PLAYBOOK_TEMPLATES.CSP_HEADERS);

    if (context.highRisk) {
      mitigations.push(PLAYBOOK_TEMPLATES.NETWORK_ISOLATION);
    }

    if (context.criticalExposure) {
      mitigations.push(PLAYBOOK_TEMPLATES.DISABLE_RSC);
    }

    mitigations.sort((a, b) => a.priority - b.priority);

    return mitigations;
  }

  generateTimeline(context) {
    return {
      immediate: [
        'Enable enhanced logging for server actions',
        'Review access logs for suspicious patterns since Dec 3, 2025',
        'Notify security team of vulnerability status'
      ],
      shortTerm: [
        'Implement WAF rules to block exploit signatures',
        'Add input validation to all server actions',
        'Configure CSP headers'
      ],
      mediumTerm: [
        'Plan and test version upgrade path',
        'Address peer dependency conflicts',
        'Schedule maintenance window for upgrade'
      ],
      ongoing: [
        'Monitor for new exploit variants',
        'Run regular security scans with NeuroLint',
        'Keep up with React security advisories'
      ]
    };
  }

  formatPlaybook(playbook) {
    const lines = [];
    
    lines.push('\n\x1b[1m╔══════════════════════════════════════════════════════════════════╗\x1b[0m');
    lines.push('\x1b[1m║                    CVE-2025-55182 MITIGATION PLAYBOOK             ║\x1b[0m');
    lines.push('\x1b[1m╚══════════════════════════════════════════════════════════════════╝\x1b[0m\n');
    
    const urgencyColor = playbook.urgency.level === 'CRITICAL' ? '\x1b[31m' : 
                          playbook.urgency.level === 'HIGH' ? '\x1b[33m' : '\x1b[34m';
    lines.push(`${urgencyColor}URGENCY: ${playbook.urgency.level}\x1b[0m`);
    lines.push(`${playbook.urgency.message}`);
    lines.push(`Timeframe: ${playbook.urgency.timeframe}\n`);
    
    if (playbook.context.patchBlocked) {
      lines.push('\x1b[33mPatch Status: BLOCKED\x1b[0m');
      lines.push(`Reason: ${playbook.context.blockReason}\n`);
    }
    
    lines.push('\x1b[1m─── RECOMMENDED MITIGATIONS ───\x1b[0m\n');
    
    for (let i = 0; i < playbook.mitigations.length; i++) {
      const mitigation = playbook.mitigations[i];
      const effectivenessColor = mitigation.effectiveness === 'HIGH' ? '\x1b[32m' : 
                                  mitigation.effectiveness === 'COMPLETE' ? '\x1b[35m' : '\x1b[33m';
      
      lines.push(`\x1b[1m${i + 1}. ${mitigation.title}\x1b[0m`);
      lines.push(`   Effectiveness: ${effectivenessColor}${mitigation.effectiveness}\x1b[0m | Time: ${mitigation.implementationTime}`);
      lines.push(`   ${mitigation.description}\n`);
      
      if (this.options.verbose) {
        for (const step of mitigation.steps) {
          lines.push(`   • ${step.title}`);
          if (step.detail) {
            lines.push(`     \x1b[2m${step.detail}\x1b[0m`);
          }
        }
        lines.push('');
      }
    }
    
    lines.push('\x1b[1m─── ACTION TIMELINE ───\x1b[0m\n');
    
    lines.push('\x1b[31mIMMEDIATE (0-4 hours):\x1b[0m');
    for (const action of playbook.timeline.immediate) {
      lines.push(`  □ ${action}`);
    }
    
    lines.push('\n\x1b[33mSHORT-TERM (1-3 days):\x1b[0m');
    for (const action of playbook.timeline.shortTerm) {
      lines.push(`  □ ${action}`);
    }
    
    lines.push('\n\x1b[34mMEDIUM-TERM (1-2 weeks):\x1b[0m');
    for (const action of playbook.timeline.mediumTerm) {
      lines.push(`  □ ${action}`);
    }
    
    lines.push('\n\x1b[2mONGOING:\x1b[0m');
    for (const action of playbook.timeline.ongoing) {
      lines.push(`  ○ ${action}`);
    }
    
    lines.push('\n\x1b[2m─────────────────────────────────────────────────────────────────────\x1b[0m');
    lines.push('\x1b[2mGenerated by NeuroLint Layer 8 Security Forensics\x1b[0m');
    lines.push(`\x1b[2m${playbook.generated}\x1b[0m\n`);
    
    return lines.join('\n');
  }

  async savePlaybook(playbook, outputPath) {
    const content = JSON.stringify(playbook, null, 2);
    await fs.writeFile(outputPath, content, 'utf8');
    return outputPath;
  }
}

module.exports = { MitigationPlaybookGenerator, PLAYBOOK_TEMPLATES };
