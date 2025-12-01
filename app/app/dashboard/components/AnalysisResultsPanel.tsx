"use client";

import React from "react";

interface DemoResult {
  success?: boolean;
  dryRun?: boolean;
  analysis?: {
    recommendedLayers: number[];
    detectedIssues: Array<{
      type: string;
      severity: string;
      description: string;
      fixedByLayer: number;
      pattern: string;
      count?: number;
      layer?: number;
      reason?: string;
    }>;
    reasoning?: string[];
    confidence: number;
    estimatedImpact: {
      level: string;
      description: string;
      estimatedFixTime: string;
    };
  };
  transformed?: string;
  originalCode?: string;
  layers?: Array<{
    layerId: number;
    success: boolean;
    improvements?: string[];
    executionTime: number;
    changeCount?: number;
    revertReason?: string;
  }>;
  layerResults?: Array<{
    layerId: number;
    success: boolean;
    improvements?: string[];
    executionTime?: number;
    changeCount?: number;
    error?: string;
  }>;
  states?: string[];
  totalExecutionTime?: number;
  successfulLayers?: number;
  executionTime?: number;
  error?: string;
  metadata?: {
    requestId: string;
    processingTimeMs: number;
    timestamp: string;
    version: string;
  };
}

interface AnalysisResultsPanelProps {
  result: DemoResult | null;
  currentFile: string | null;
  isLoading: boolean;
  onClearResults: () => void;
  onCloseResults: () => void;
  onCopyCode: (code: string, type: string) => void;
  onDownloadCode: (code: string, filename: string) => void;
  resultsSectionRef?: React.RefObject<HTMLDivElement>;
}

const formatProcessingTime = (ms: number) => {
  if (!ms || isNaN(ms) || ms < 0) return "0ms";
  if (ms < 10) return `${ms.toFixed(1)}ms`;
  if (ms < 100) return `${ms.toFixed(0)}ms`;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

const getLayerStatus = (layer: {
  success: boolean;
  changeCount?: number;
  improvements?: string[];
  error?: string;
}) => {
  if (
    layer.success &&
    ((layer.changeCount && layer.changeCount > 0) || (layer.improvements && layer.improvements.length > 0))
  ) {
    return { className: "success", text: "Success" };
  } else if (!layer.success && layer.error === "No changes were made") {
    return { className: "no-changes", text: "No changes needed" };
  } else if (!layer.success && layer.error) {
    return { className: "failed", text: "Failed" };
  } else if (layer.success && layer.changeCount === 0) {
    return { className: "no-changes", text: "No changes needed" };
  } else {
    return { className: "skipped", text: "Skipped" };
  }
};

export default function AnalysisResultsPanel({
  result,
  currentFile,
  isLoading,
  onClearResults,
  onCloseResults,
  onCopyCode,
  onDownloadCode,
  resultsSectionRef,
}: AnalysisResultsPanelProps) {
  if (!result && !isLoading) return null;

  return (
    <div className="results-inline-section" ref={resultsSectionRef}>
      <div className="results-inline-container">
        <div className="results-inline-header">
          <h2>Analysis Results - {currentFile}</h2>
          <div className="results-inline-actions">
            <button
              className="control-btn"
              onClick={onClearResults}
              aria-label="Clear analysis results and start over"
            >
              Clear Results
            </button>
            <button
              className="results-close"
              onClick={onCloseResults}
              aria-label="Close results"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="results-inline-content">
          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Analyzing code with NeuroLint...</p>
            </div>
          ) : result?.error ? (
            <div className="error-state">
              <h3>Analysis Failed</h3>
              <p>{result.error}</p>
            </div>
          ) : (
            result && (
              <div className="analysis-results">
                {result.analysis && (
                  <div className="business-insights">
                    <h3>Technical Impact Analysis</h3>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <div className="insight-label">Potential Savings</div>
                        <div className="insight-value">
                          ~
                          {Math.round(
                            result.analysis.detectedIssues.length * 2.5
                          )}{" "}
                          hours dev time
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-label">Performance Gain</div>
                        <div className="insight-value">
                          {result.analysis.estimatedImpact.level === "high"
                            ? "15-25%"
                            : "5-15%"}{" "}
                          faster
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-label">Risk Reduction</div>
                        <div className="insight-value">
                          {
                            result.analysis.detectedIssues.filter(
                              (i) =>
                                i.severity === "high" ||
                                i.severity === "critical"
                            ).length
                          }{" "}
                          critical issues
                        </div>
                      </div>
                      <div className="insight-card">
                        <div className="insight-label">Standards Compliance</div>
                        <div className="insight-value">
                          {Math.round(result.analysis.confidence * 100)}% best
                          practices
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.analysis && (
                  <div className="analysis-overview">
                    <h3>Analysis Overview</h3>
                    <div className="overview-stats">
                      <div className="stat">
                        <span className="stat-value">
                          {result.analysis.detectedIssues.length}
                        </span>
                        <span className="stat-label">Issues Found</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {result.analysis.confidence}%
                        </span>
                        <span className="stat-label">Analysis Score</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {result.analysis.estimatedImpact.level}
                        </span>
                        <span className="stat-label">Impact Level</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {formatProcessingTime(
                            result.metadata?.processingTimeMs || 0
                          )}
                        </span>
                        <span className="stat-label">Processing Time</span>
                      </div>
                    </div>
                  </div>
                )}

                {result.originalCode && result.transformed && (
                  <div className="code-comparison">
                    <h3>
                      {result.dryRun
                        ? "Code Preview (Dry Run)"
                        : "Applied Changes"}
                    </h3>

                    {result.originalCode === result.transformed ? (
                      <div className="no-changes">
                        <p>
                          No changes needed - your code is already optimized!
                        </p>
                      </div>
                    ) : (
                      <div className="comparison-grid">
                        <div className="code-panel">
                          <div className="code-panel-header">
                            <h4>Original Code</h4>
                            <div className="code-actions">
                              <button
                                className="code-action-btn"
                                onClick={() =>
                                  onCopyCode(result.originalCode || "", "Original")
                                }
                                title="Copy original code"
                                aria-label="Copy original code to clipboard"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                </svg>
                              </button>
                              <button
                                className="code-action-btn"
                                onClick={() =>
                                  onDownloadCode(
                                    result.originalCode || "",
                                    `${currentFile || "original-code"}.backup.tsx`
                                  )
                                }
                                title="Download original code"
                                aria-label="Download original code as file"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                  <polyline points="7,10 12,15 17,10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <pre className="code-block">
                            <code>{result.originalCode}</code>
                          </pre>
                        </div>
                        <div className="code-panel">
                          <div className="code-panel-header">
                            <h4>
                              {result.dryRun ? "Preview Changes" : "Fixed Code"}
                            </h4>
                            <div className="code-actions">
                              <button
                                className="code-action-btn"
                                onClick={() =>
                                  onCopyCode(result.transformed || "", "Fixed")
                                }
                                title="Copy fixed code"
                                aria-label="Copy fixed code to clipboard"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                  ></rect>
                                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                </svg>
                              </button>
                              <button
                                className="code-action-btn"
                                onClick={() =>
                                  onDownloadCode(
                                    result.transformed || "",
                                    `${currentFile || "fixed-code"}.tsx`
                                  )
                                }
                                title="Download fixed code"
                                aria-label="Download fixed code as file"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
                                  <polyline points="7,10 12,15 17,10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <pre className="code-block">
                            <code>{result.transformed}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.analysis?.detectedIssues &&
                  result.analysis.detectedIssues.length > 0 && (
                    <div className="issues-section">
                      <h3>Detected Issues</h3>
                      <div className="issues-list">
                        {result.analysis.detectedIssues.map((issue, index) => (
                          <div
                            key={`layer-${issue.layer || index}-${index}`}
                            className="issue-item severity-medium"
                          >
                            <div className="issue-header">
                              <span className="issue-type">
                                Layer {issue.layer} Issue
                              </span>
                              <span className="issue-severity">medium</span>
                            </div>
                            <p className="issue-description">
                              {issue.reason ||
                                issue.description ||
                                "No description available"}
                            </p>
                            <div className="issue-meta">
                              <span>Fixed by Layer {issue.layer}</span>
                              {issue.count && (
                                <span>{issue.count} occurrences</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {result.layerResults && (
                  <div className="layers-section">
                    <h3>Layer Execution</h3>
                    <div className="layers-list">
                      {result.layerResults.map((layer, layerIndex) => {
                        const status = getLayerStatus(layer);

                        return (
                          <div
                            key={`layer-${layer.layerId || `index-${layerIndex}`}`}
                            className={`layer-item ${status.className}`}
                          >
                            <div className="layer-header">
                              <span className="layer-id">
                                Layer {layer.layerId}
                              </span>
                              <span className="layer-time">
                                {formatProcessingTime(
                                  layer.executionTime ||
                                    Math.round(
                                      (result.executionTime || 2000) /
                                        (result.layerResults?.length || 1)
                                    )
                                )}
                              </span>
                              <span className={`layer-status ${status.className}`}>
                                {status.text}
                              </span>
                            </div>
                            {layer.improvements && layer.improvements.length > 0 && (
                              <ul className="layer-improvements">
                                {layer.improvements.map((improvement, idx) => (
                                  <li key={idx}>{improvement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export type { AnalysisResultsPanelProps, DemoResult };
