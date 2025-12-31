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
 * RSC Security Constants - Centralized CVE Definitions
 * 
 * Contains version mappings for React Server Components vulnerabilities:
 * - CVE-2025-55182: Remote Code Execution (CRITICAL, CVSS 10.0)
 * - CVE-2025-55183: Source Code Exposure (MEDIUM, CVSS 5.3)
 * - CVE-2025-55184: Denial of Service (HIGH, CVSS 7.5)
 * - CVE-2025-67779: Incomplete DoS Fix (HIGH, CVSS 7.5) - Dec 11, 2025
 * 
 * IMPORTANT PATCH HISTORY:
 * - 19.0.1, 19.1.2, 19.2.1 patched CVE-2025-55182 only
 * - 19.0.2, 19.1.3, 19.2.2 attempted to patch CVE-2025-55184 but fix was INCOMPLETE (CVE-2025-67779)
 * - 19.0.3, 19.1.4, 19.2.3 are FULLY PATCHED for all vulnerabilities
 * 
 * Last updated: December 20, 2025
 */

const CVE_2025_55182 = {
  id: 'CVE-2025-55182',
  cvss: 10.0,
  severity: 'CRITICAL',
  description: 'React Server Components Remote Code Execution',
  disclosed: '2025-12-03',
  
  react: {
    vulnerable: ['19.0.0', '19.0.1', '19.1.0', '19.1.1', '19.1.2', '19.2.0', '19.2.1'],
    patched: {
      '19.0': '19.0.2',
      '19.1': '19.1.3',
      '19.2': '19.2.2'
    },
    defaultPatched: '19.2.2'
  },
  
  nextjs: {
    patched: {
      '15.0': '15.0.5',
      '15.1': '15.1.9',
      '15.2': '15.2.6',
      '15.3': '15.3.6',
      '15.4': '15.4.8',
      '15.5': '15.5.7',
      '16.0': '16.0.7',
      '16.1': '16.1.0',
      '16.2': '16.2.1'
    }
  },
  
  serverDomPackages: [
    'react-server-dom-webpack',
    'react-server-dom-parcel',
    'react-server-dom-turbopack'
  ],
  
  notAffected: [
    'React 18 and earlier',
    'SPAs without React Server Components',
    'Next.js Pages Router applications',
    'Client-side only React applications'
  ]
};

const CVE_2025_55183 = {
  id: 'CVE-2025-55183',
  cvss: 5.3,
  severity: 'MEDIUM',
  description: 'React Server Components Source Code Exposure',
  disclosed: '2025-12-11',
  
  react: {
    vulnerable: ['19.0.0', '19.0.1', '19.1.0', '19.1.1', '19.1.2', '19.2.0', '19.2.1'],
    patched: {
      '19.0': '19.0.3',
      '19.1': '19.1.4',
      '19.2': '19.2.3'
    },
    defaultPatched: '19.2.3'
  },
  
  serverDomPackages: [
    'react-server-dom-webpack',
    'react-server-dom-parcel',
    'react-server-dom-turbopack'
  ],
  
  exploitPattern: 'Malicious HTTP request can leak Server Function source code including hardcoded secrets',
  
  affectedPatterns: [
    'Server Functions that explicitly stringify arguments',
    'Server Functions that implicitly convert arguments to strings',
    'Hardcoded secrets in Server Function source code'
  ]
};

const CVE_2025_55184 = {
  id: 'CVE-2025-55184',
  cvss: 7.5,
  severity: 'HIGH',
  description: 'React Server Components Denial of Service',
  disclosed: '2025-12-11',
  
  react: {
    vulnerable: ['19.0.0', '19.0.1', '19.1.0', '19.1.1', '19.1.2', '19.2.0', '19.2.1'],
    patched: {
      '19.0': '19.0.3',
      '19.1': '19.1.4',
      '19.2': '19.2.3'
    },
    defaultPatched: '19.2.3'
  },
  
  serverDomPackages: [
    'react-server-dom-webpack',
    'react-server-dom-parcel',
    'react-server-dom-turbopack'
  ],
  
  exploitPattern: 'Malicious HTTP request causes infinite loop during deserialization, hanging server process',
  
  indicators: [
    'CPU usage spike on RSC endpoints',
    'Hanging requests that never complete',
    'Memory exhaustion from infinite loops'
  ]
};

const CVE_2025_67779 = {
  id: 'CVE-2025-67779',
  cvss: 7.5,
  severity: 'HIGH',
  description: 'React Server Components Denial of Service (Incomplete Fix for CVE-2025-55184)',
  disclosed: '2025-12-11',
  
  react: {
    vulnerable: ['19.0.2', '19.1.3', '19.2.2'],
    patched: {
      '19.0': '19.0.3',
      '19.1': '19.1.4',
      '19.2': '19.2.3'
    },
    defaultPatched: '19.2.3'
  },
  
  serverDomPackages: [
    'react-server-dom-webpack',
    'react-server-dom-parcel',
    'react-server-dom-turbopack'
  ],
  
  exploitPattern: 'Bypass for CVE-2025-55184 fix - same DoS impact via alternative payload structure',
  
  indicators: [
    'Same as CVE-2025-55184',
    'Affects versions that claim to be patched for CVE-2025-55184'
  ]
};

const ALL_RSC_CVES = [CVE_2025_55182, CVE_2025_55183, CVE_2025_55184, CVE_2025_67779];

const FULLY_PATCHED_VERSIONS = {
  react: {
    '19.0': '19.0.2',
    '19.1': '19.1.3',
    '19.2': '19.2.2'
  },
  defaultPatched: '19.2.2'
};

const PARTIALLY_PATCHED_VERSIONS = {
  react: ['19.0.1', '19.0.2', '19.1.2', '19.1.3', '19.2.1', '19.2.2'],
  rceOnlyPatched: ['19.0.1', '19.1.2', '19.2.1'],
  incompleteDoSPatched: ['19.0.2', '19.1.3', '19.2.2'],
  description: 'Versions 19.0.1/19.1.2/19.2.1 patched CVE-2025-55182 only. Versions 19.0.2/19.1.3/19.2.2 have incomplete DoS fix (CVE-2025-67779).'
};

function isVulnerableReactVersion(version, cveId = null) {
  if (!version || typeof version !== 'string') return false;
  
  const hasGreaterThan = version.includes('>') && !version.includes('>=');
  if (hasGreaterThan) {
    return false;
  }
  
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const parts = cleanVersion.split('.');
  
  if (parts.length < 2) return false;
  
  const major = parseInt(parts[0]);
  const minor = parseInt(parts[1]);
  const patch = parseInt(parts[2] || '0');
  
  if (isNaN(major) || isNaN(minor) || major !== 19) return false;
  
  const majorMinor = `${major}.${minor}`;
  const fullyPatchedVersion = FULLY_PATCHED_VERSIONS.react[majorMinor];
  
  if (!fullyPatchedVersion) return false;
  
  const fullyPatchedPatch = parseInt(fullyPatchedVersion.split('.')[2]);
  
  return patch < fullyPatchedPatch;
}

function isPartiallyPatchedVersion(version) {
  if (!version || typeof version !== 'string') return false;
  
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  return PARTIALLY_PATCHED_VERSIONS.react.includes(cleanVersion);
}

function getVulnerabilitiesForVersion(version, includePartialPatch = false) {
  if (!version || typeof version !== 'string') return [];
  
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const vulnerabilities = [];
  
  if (PARTIALLY_PATCHED_VERSIONS.incompleteDoSPatched.includes(cleanVersion)) {
    vulnerabilities.push(CVE_2025_55183);
    vulnerabilities.push(CVE_2025_67779);
    if (includePartialPatch) {
      vulnerabilities.unshift(CVE_2025_55182);
      vulnerabilities.push(CVE_2025_55184);
    }
  } else if (PARTIALLY_PATCHED_VERSIONS.rceOnlyPatched.includes(cleanVersion)) {
    vulnerabilities.push(CVE_2025_55183);
    vulnerabilities.push(CVE_2025_55184);
    if (includePartialPatch) {
      vulnerabilities.unshift(CVE_2025_55182);
    }
  } else if (isVulnerableReactVersion(version)) {
    vulnerabilities.push(CVE_2025_55182);
    vulnerabilities.push(CVE_2025_55183);
    vulnerabilities.push(CVE_2025_55184);
  }
  
  return vulnerabilities;
}

function getPatchedReactVersion(version) {
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const majorMinor = cleanVersion.split('.').slice(0, 2).join('.');
  return FULLY_PATCHED_VERSIONS.react[majorMinor] || FULLY_PATCHED_VERSIONS.defaultPatched;
}

function isVulnerableNextVersion(version) {
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const majorMinor = cleanVersion.split('.').slice(0, 2).join('.');
  const patchedVersion = CVE_2025_55182.nextjs.patched[majorMinor];
  
  if (!patchedVersion) return false;
  
  const currentPatch = parseInt(cleanVersion.split('.')[2] || '0');
  const patchedPatch = parseInt(patchedVersion.split('.')[2]);
  
  return currentPatch < patchedPatch;
}

function getPatchedNextVersion(version) {
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const majorMinor = cleanVersion.split('.').slice(0, 2).join('.');
  return CVE_2025_55182.nextjs.patched[majorMinor];
}

function formatPatchedVersionsList(type) {
  if (type === 'react') {
    return Object.values(FULLY_PATCHED_VERSIONS.react).join(', ');
  }
  if (type === 'nextjs') {
    return Object.entries(CVE_2025_55182.nextjs.patched)
      .map(([k, v]) => `${v}+`)
      .join(', ');
  }
  return '';
}

function getAllCVEIds() {
  return ALL_RSC_CVES.map(cve => cve.id);
}

function getCVEById(id) {
  return ALL_RSC_CVES.find(cve => cve.id === id) || null;
}

module.exports = {
  CVE_2025_55182,
  CVE_2025_55183,
  CVE_2025_55184,
  CVE_2025_67779,
  ALL_RSC_CVES,
  FULLY_PATCHED_VERSIONS,
  PARTIALLY_PATCHED_VERSIONS,
  isVulnerableReactVersion,
  isPartiallyPatchedVersion,
  getVulnerabilitiesForVersion,
  getPatchedReactVersion,
  isVulnerableNextVersion,
  getPatchedNextVersion,
  formatPatchedVersionsList,
  getAllCVEIds,
  getCVEById
};
