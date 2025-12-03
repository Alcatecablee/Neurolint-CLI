/**
 * CVE-2025-55182 Security Constants
 * Centralized version mappings for React Server Components RCE vulnerability
 * 
 * These constants should be updated when new patched versions are released.
 * Only changelogs and documentation files should contain static version references.
 */

const CVE_2025_55182 = {
  id: 'CVE-2025-55182',
  cvss: 10.0,
  severity: 'CRITICAL',
  description: 'React Server Components Remote Code Execution',
  disclosed: '2025-12-03',
  
  react: {
    vulnerable: ['19.0.0', '19.1.0', '19.1.1', '19.2.0'],
    patched: {
      '19.0': '19.0.1',
      '19.1': '19.1.2',
      '19.2': '19.2.1'
    },
    defaultPatched: '19.2.1'
  },
  
  nextjs: {
    patched: {
      '15.0': '15.0.5',
      '15.1': '15.1.9',
      '15.2': '15.2.6',
      '15.3': '15.3.6',
      '15.4': '15.4.8',
      '15.5': '15.5.5',
      '16.0': '16.0.2',
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

function isVulnerableReactVersion(version) {
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
  const patchedVersion = CVE_2025_55182.react.patched[majorMinor];
  
  if (!patchedVersion) return false;
  
  const patchedPatch = parseInt(patchedVersion.split('.')[2]);
  
  return patch < patchedPatch;
}

function getPatchedReactVersion(version) {
  const cleanVersion = version.replace(/[\^~>=<]/g, '');
  const majorMinor = cleanVersion.split('.').slice(0, 2).join('.');
  return CVE_2025_55182.react.patched[majorMinor] || CVE_2025_55182.react.defaultPatched;
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
    return Object.values(CVE_2025_55182.react.patched).join(', ');
  }
  if (type === 'nextjs') {
    return Object.entries(CVE_2025_55182.nextjs.patched)
      .map(([k, v]) => `${v}+`)
      .join(', ');
  }
  return '';
}

module.exports = {
  CVE_2025_55182,
  isVulnerableReactVersion,
  getPatchedReactVersion,
  isVulnerableNextVersion,
  getPatchedNextVersion,
  formatPatchedVersionsList
};
