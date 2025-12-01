"use client";

import React, { useState } from "react";
import { LoadingButton } from "../../../components/ui/LoadingSpinner";

interface CommandResult {
  success: boolean;
  command: string;
  data?: any;
  error?: string;
  executionTime?: number;
}

const COMMANDS = [
  {
    id: "migrate-react19",
    name: "Migrate to React 19",
    description: "Apply Layer 7 (Adaptive Learning) for React 19 compatibility",
    category: "migration",
    endpoint: "/api/commands/migrate-react19",
    inputType: "code",
  },
  {
    id: "migrate-nextjs16",
    name: "Migrate to Next.js 16",
    description: "Migrate middleware, PPR, caching APIs for Next.js 16",
    category: "migration",
    endpoint: "/api/commands/migrate-nextjs16",
    inputType: "projectPath",
  },
  {
    id: "migrate-biome",
    name: "Migrate to Biome",
    description: "Convert ESLint/Prettier to Biome (CLI only)",
    category: "migration",
    endpoint: "/api/commands/migrate-biome",
    inputType: "none",
    disabled: true,
  },
  {
    id: "check-deps",
    name: "Check Dependencies",
    description: "Analyze package.json for React 19 compatibility",
    category: "analysis",
    endpoint: "/api/commands/check-deps",
    inputType: "packageJson",
  },
  {
    id: "check-turbopack",
    name: "Check Turbopack",
    description: "Analyze Turbopack migration compatibility",
    category: "analysis",
    endpoint: "/api/commands/check-turbopack",
    inputType: "projectPath",
  },
  {
    id: "check-compiler",
    name: "Check React Compiler",
    description: "Detect manual memoization patterns React Compiler would optimize",
    category: "analysis",
    endpoint: "/api/commands/check-compiler",
    inputType: "projectPath",
  },
  {
    id: "assess-router",
    name: "Assess Router",
    description: "Analyze Next.js router complexity and recommendations",
    category: "analysis",
    endpoint: "/api/commands/assess-router",
    inputType: "projectPath",
  },
  {
    id: "detect-react192",
    name: "Detect React 19.2 Features",
    description: "Find View Transitions, useEffectEvent, Activity opportunities",
    category: "analysis",
    endpoint: "/api/commands/detect-react192",
    inputType: "projectPath",
  },
  {
    id: "simplify",
    name: "Simplify Code",
    description: "Run all 7 layers to modernize and simplify code",
    category: "utility",
    endpoint: "/api/commands/simplify",
    inputType: "code",
  },
  {
    id: "validate",
    name: "Validate Code",
    description: "Check for issues without applying fixes",
    category: "utility",
    endpoint: "/api/commands/validate",
    inputType: "code",
  },
];

export default function CommandsPanel() {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [projectPath, setProjectPath] = useState("");
  const [packageJson, setPackageJson] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Commands" },
    { id: "migration", label: "Migration" },
    { id: "analysis", label: "Analysis" },
    { id: "utility", label: "Utility" },
  ];

  const filteredCommands =
    activeCategory === "all"
      ? COMMANDS
      : COMMANDS.filter((cmd) => cmd.category === activeCategory);

  const selectedCommandData = COMMANDS.find((cmd) => cmd.id === selectedCommand);

  const runCommand = async () => {
    if (!selectedCommandData || selectedCommandData.disabled) return;

    setIsLoading(true);
    setResult(null);

    try {
      const body: any = {};
      
      if (selectedCommandData.inputType === "code") {
        body.code = code;
        body.filename = "input.tsx";
        body.dryRun = dryRun;
      } else if (selectedCommandData.inputType === "projectPath") {
        body.projectPath = projectPath;
      } else if (selectedCommandData.inputType === "packageJson") {
        try {
          body.packageJson = JSON.parse(packageJson);
        } catch {
          body.packageJson = { dependencies: {} };
        }
      }

      const response = await fetch(selectedCommandData.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      setResult({
        success: response.ok && data.success !== false,
        command: selectedCommandData.id,
        data,
        executionTime: data.executionTime,
      });
    } catch (error) {
      setResult({
        success: false,
        command: selectedCommandData.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isInputValid = () => {
    if (!selectedCommandData) return false;
    if (selectedCommandData.disabled) return false;
    
    switch (selectedCommandData.inputType) {
      case "code":
        return code.trim().length > 0;
      case "projectPath":
        return projectPath.trim().length > 0;
      case "packageJson":
        return packageJson.trim().length > 0;
      case "none":
        return false;
      default:
        return true;
    }
  };

  return (
    <div className="commands-panel">
      <div className="commands-header">
        <h2>CLI Commands</h2>
        <p className="commands-description">
          Run NeuroLint migration and analysis commands directly from the dashboard.
          These are the same commands available via the CLI.
        </p>
      </div>

      <div className="commands-categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="commands-grid">
        {filteredCommands.map((cmd) => (
          <div
            key={cmd.id}
            className={`command-card ${selectedCommand === cmd.id ? "selected" : ""} ${cmd.disabled ? "disabled" : ""}`}
            onClick={() => !cmd.disabled && setSelectedCommand(cmd.id)}
          >
            <div className="command-header">
              <span className={`command-category ${cmd.category}`}>
                {cmd.category}
              </span>
              {cmd.disabled && <span className="badge-cli">CLI Only</span>}
            </div>
            <h3>{cmd.name}</h3>
            <p>{cmd.description}</p>
          </div>
        ))}
      </div>

      {selectedCommandData && !selectedCommandData.disabled && (
        <div className="command-executor">
          <h3>Run: {selectedCommandData.name}</h3>

          {selectedCommandData.inputType === "code" && (
            <div className="code-input">
              <label>Code Input:</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your React/TypeScript code here..."
                rows={10}
              />
            </div>
          )}

          {selectedCommandData.inputType === "projectPath" && (
            <div className="code-input">
              <label>Project Path (absolute path):</label>
              <input
                type="text"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/path/to/your/project"
                className="text-input"
              />
              <p className="input-hint">
                For security, you must provide the absolute path to your project directory.
              </p>
            </div>
          )}

          {selectedCommandData.inputType === "packageJson" && (
            <div className="code-input">
              <label>package.json contents:</label>
              <textarea
                value={packageJson}
                onChange={(e) => setPackageJson(e.target.value)}
                placeholder='{"dependencies": {"react": "^18.0.0"}, "devDependencies": {}}'
                rows={8}
              />
            </div>
          )}

          {selectedCommandData.inputType === "code" && (
            <div className="options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={dryRun}
                  onChange={(e) => setDryRun(e.target.checked)}
                />
                Dry Run (preview changes only)
              </label>
            </div>
          )}

          <div className="command-actions">
            <LoadingButton
              onClick={runCommand}
              loading={isLoading}
              className="btn btn-primary"
              disabled={!isInputValid()}
            >
              Run Command
            </LoadingButton>
          </div>
        </div>
      )}

      {result && (
        <div className={`command-result ${result.success ? "success" : "error"}`}>
          <div className="result-header">
            <span className={`status ${result.success ? "success" : "error"}`}>
              {result.success ? "Success" : "Error"}
            </span>
            {result.executionTime && (
              <span className="execution-time">
                {result.executionTime}ms
              </span>
            )}
          </div>
          <pre className="result-output">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        .commands-panel {
          padding: 24px;
        }

        .commands-header h2 {
          margin: 0 0 8px 0;
          color: #fff;
          font-size: 24px;
        }

        .commands-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 24px;
        }

        .commands-categories {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 8px 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .category-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .category-btn.active {
          background: rgba(33, 150, 243, 0.2);
          border-color: rgba(33, 150, 243, 0.5);
          color: #2196f3;
        }

        .commands-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .command-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .command-card:hover:not(.disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .command-card.selected {
          background: rgba(33, 150, 243, 0.1);
          border-color: rgba(33, 150, 243, 0.5);
        }

        .command-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .command-header {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .command-category {
          font-size: 10px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }

        .badge-cli {
          font-size: 9px;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          background: rgba(255, 152, 0, 0.2);
          color: #ff9800;
        }

        .command-category.migration {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .command-category.analysis {
          background: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .command-category.utility {
          background: rgba(156, 39, 176, 0.2);
          color: #9c27b0;
        }

        .command-card h3 {
          margin: 0 0 4px 0;
          color: #fff;
          font-size: 16px;
        }

        .command-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
        }

        .command-executor {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .command-executor h3 {
          margin: 0 0 16px 0;
          color: #fff;
        }

        .code-input {
          margin-bottom: 16px;
        }

        .code-input label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .code-input textarea,
        .text-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 12px;
          color: #fff;
          font-family: "Monaco", "Menlo", monospace;
          font-size: 13px;
        }

        .code-input textarea {
          resize: vertical;
        }

        .text-input {
          font-family: inherit;
        }

        .input-hint {
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
        }

        .options {
          margin-bottom: 16px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
        }

        .checkbox-label input {
          accent-color: #2196f3;
        }

        .command-actions {
          display: flex;
          gap: 12px;
        }

        .command-result {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 16px;
          border: 1px solid;
        }

        .command-result.success {
          border-color: rgba(76, 175, 80, 0.3);
        }

        .command-result.error {
          border-color: rgba(244, 67, 54, 0.3);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .status {
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 4px;
        }

        .status.success {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status.error {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .execution-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
        }

        .result-output {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 8px;
          padding: 16px;
          overflow: auto;
          max-height: 400px;
          color: rgba(255, 255, 255, 0.9);
          font-family: "Monaco", "Menlo", monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }

        @media (max-width: 768px) {
          .commands-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
