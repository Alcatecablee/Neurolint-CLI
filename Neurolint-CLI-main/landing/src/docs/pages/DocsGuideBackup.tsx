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


import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsGuideBackup() {
  return (
    <DocsLayout
      title="Backup & Restore"
      description="NeuroLint automatically creates backups before making changes. Learn how to manage and restore from backups."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Automatic Backups</h2>
        
        <p className="text-gray-300 mb-4">
          Every time NeuroLint modifies a file, it automatically creates a backup with:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm mb-6">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Timestamp-based folder naming</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>SHA-256 checksum for integrity verification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Original file content preserved exactly</span>
          </li>
        </ul>

        <p className="text-gray-400 text-sm">
          Backups are stored in <code className="text-gray-300 bg-zinc-800 px-1 rounded">.neurolint-backups/</code>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Listing Backups</h2>
        
        <CommandBlock command="neurolint backup list" />
        
        <p className="text-gray-400 text-sm mt-4">
          Shows all available backups with timestamps and file counts.
        </p>

        <CodeBlock
          language="text"
          code={`Available Backups:

  backup-2025-12-08-143052
    Files: 5
    Created: 2025-12-08 14:30:52
    
  backup-2025-12-08-141215
    Files: 3
    Created: 2025-12-08 14:12:15`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Restoring Files</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Interactive restore (recommended):</p>
            <CommandBlock command="neurolint restore --interactive" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Restore specific backup:</p>
            <CommandBlock command="neurolint backup restore backup-2025-12-08-143052 --yes" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Restore specific file:</p>
            <CommandBlock command="neurolint backup restore backup-2025-12-08-143052 --file=src/components/Button.tsx" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Manual Backup</h2>
        
        <p className="text-gray-300 mb-4">
          Create a manual backup before making changes:
        </p>

        <CommandBlock command="neurolint backup create ./src" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Cleanup</h2>
        
        <p className="text-gray-300 mb-4">
          Remove old backups to save disk space:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Clean backups older than 7 days:</p>
            <CommandBlock command="neurolint clean --older-than=7 --verbose" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Keep only latest 5 backups:</p>
            <CommandBlock command="neurolint clean --keep-latest=5 --verbose" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Clean state files too:</p>
            <CommandBlock command="neurolint clean --states --older-than=30" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Production Backups</h2>
        
        <p className="text-gray-300 mb-4">
          For production environments, use enhanced backup settings:
        </p>

        <CommandBlock command="neurolint fix ./src --all-layers --production" />

        <p className="text-gray-400 text-sm mt-4">
          The --production flag enables production-grade backup management with:
        </p>
        
        <ul className="space-y-2 text-gray-400 text-sm mt-3">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Increased backup retention (50 backups vs 10 in development)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Enhanced logging with file-based audit trails</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Environment-aware configuration for CI/CD pipelines</span>
          </li>
        </ul>

        <Callout type="info" title="Note on encryption">
          Encryption features are available through the enterprise encryption management commands. 
          Use <code className="text-gray-300 bg-zinc-800 px-1 rounded">neurolint encryption status</code> to check encryption status.
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Disabling Backups</h2>
        
        <p className="text-gray-300 mb-4">
          You can skip backup creation (not recommended):
        </p>

        <CommandBlock command="neurolint fix ./src --all-layers --no-backup" />

        <Callout type="warning" title="Not recommended">
          Disabling backups means you cannot restore if something goes wrong. 
          Only use this if your project is under version control with recent commits.
        </Callout>
      </section>
    </DocsLayout>
  );
}
