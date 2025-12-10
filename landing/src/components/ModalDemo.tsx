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


import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Play, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { demoScenarios, type DemoScenario } from '../data/staticDemoData';
import { InstallCTA } from './InstallCTA';

export function ModalDemo() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [expandedLayers, setExpandedLayers] = useState<Set<number>>(new Set());
  const [copiedCode, setCopiedCode] = useState<'before' | 'after' | null>(null);

  const handleAnalyze = () => {
    setHasAnalyzed(true);
  };

  const toggleLayer = (layerId: number) => {
    const newExpanded = new Set(expandedLayers);
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId);
    } else {
      newExpanded.add(layerId);
    }
    setExpandedLayers(newExpanded);
  };

  const copyToClipboard = (code: string, type: 'before' | 'after') => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-white';
      case 'medium': return 'text-zinc-300';
      case 'low': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
          Interactive Demo
        </h2>
        <p className="text-xl md:text-2xl text-zinc-300 max-w-4xl mx-auto font-medium">
          Select a scenario to see how NeuroLint automatically detects and fixes common React issues
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-black shadow-2xl overflow-hidden">
        {/* Scenario Selector Dropdown */}
        <div className="bg-black/40 border-b border-black p-6">
          <label htmlFor="scenario-select" className="block text-sm font-bold text-zinc-400 mb-3">
            Choose Demo Scenario
          </label>
          <select
            id="scenario-select"
            value={selectedScenario?.id || ''}
            onChange={(e) => {
              const scenario = demoScenarios.find(s => s.id === e.target.value);
              if (scenario) {
                setSelectedScenario(scenario);
                setHasAnalyzed(false);
                setExpandedLayers(new Set());
                setCopiedCode(null);
              }
            }}
            className="w-full bg-black/60 border-2 border-black text-white rounded-xl px-4 py-3 font-medium text-lg focus:outline-none focus:border-white/40 transition-colors cursor-pointer"
          >
            <option value="" disabled>Select a demo scenario...</option>
            {demoScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title} ({scenario.issues.length} issues)
              </option>
            ))}
          </select>
        </div>

        {/* Demo Content */}
        {selectedScenario ? (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-2xl font-black text-white mb-2">
                {selectedScenario.title}
              </h3>
              <p className="text-zinc-300 text-sm sm:text-lg">
                {selectedScenario.description}
              </p>
            </div>

            {!hasAnalyzed ? (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm sm:text-lg font-black text-white">Sample Code</h4>
                    <button
                      onClick={() => copyToClipboard(selectedScenario.beforeCode, 'before')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                      aria-label="Copy code"
                    >
                      {copiedCode === 'before' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="bg-black/60 rounded-xl sm:rounded-2xl overflow-auto border-2 border-white/20 max-h-[300px] sm:max-h-[400px]">
                    <div className="min-w-0 overflow-x-auto">
                      <SyntaxHighlighter
                        language="typescript"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: '0.75rem',
                          background: 'transparent',
                          fontSize: '0.7rem',
                        }}
                        showLineNumbers={true}
                        wrapLongLines={false}
                      >
                        {selectedScenario.beforeCode}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleAnalyze}
                    className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 text-lg shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Analyze Code
                  </button>
                </div>
              </div>
            ) : (
                <div className="space-y-4 sm:space-y-6 animate-fade-in">
                  <div className="bg-white/5 border-2 border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 backdrop-blur-xl transform transition-all duration-300">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-green-400 font-black text-sm sm:text-base mb-1">Analysis Complete</h4>
                      <p className="text-zinc-300 text-xs sm:text-sm">
                        Found {selectedScenario.issues.length} issues across{' '}
                        {selectedScenario.layerBreakdown.length} layer(s)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="transform transition-all duration-500 md:hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          Before (Issues Detected)
                        </h4>
                        <button
                          onClick={() => copyToClipboard(selectedScenario.beforeCode, 'before')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Copy before code"
                        >
                          {copiedCode === 'before' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="bg-black/60 border-2 border-white/20 rounded-xl sm:rounded-2xl min-h-[200px] max-h-[300px] sm:max-h-[350px] lg:max-h-[400px] overflow-auto backdrop-blur-xl">
                        <div className="min-w-0 overflow-x-auto">
                          <SyntaxHighlighter
                            language="typescript"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '0.75rem',
                              background: 'transparent',
                              fontSize: '0.7rem',
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {selectedScenario.beforeCode}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </div>

                    <div className="transform transition-all duration-500 md:hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm sm:text-lg font-black text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          After (Fixed)
                        </h4>
                        <button
                          onClick={() => copyToClipboard(selectedScenario.afterCode, 'after')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          aria-label="Copy after code"
                        >
                          {copiedCode === 'after' ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <div className="bg-black/60 border-2 border-white/20 rounded-xl sm:rounded-2xl min-h-[200px] max-h-[300px] sm:max-h-[350px] lg:max-h-[400px] overflow-auto backdrop-blur-xl">
                        <div className="min-w-0 overflow-x-auto">
                          <SyntaxHighlighter
                            language="typescript"
                            style={vscDarkPlus}
                            customStyle={{
                              margin: 0,
                              padding: '0.75rem',
                              background: 'transparent',
                              fontSize: '0.7rem',
                            }}
                            showLineNumbers={true}
                            wrapLongLines={false}
                          >
                            {selectedScenario.afterCode}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black">
                    <h4 className="text-sm sm:text-lg font-black text-white mb-3 sm:mb-4">Issues Detected</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedScenario.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="bg-black/60 border-2 border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3 backdrop-blur-xl"
                        >
                          <AlertCircle className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${getSeverityColor(issue.severity)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs sm:text-sm font-black ${getSeverityColor(issue.severity)}`}>
                                {issue.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-zinc-500">•</span>
                              <span className="text-xs text-zinc-500 truncate">{issue.type}</span>
                            </div>
                            <p className="text-zinc-300 text-xs sm:text-sm">{issue.description}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Fixed by Layer {issue.fixedByLayer}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-3xl p-4 sm:p-6 border-2 border-black">
                    <h4 className="text-sm sm:text-lg font-black text-white mb-3 sm:mb-4">Layer Breakdown</h4>
                    <div className="space-y-2 sm:space-y-3">
                      {selectedScenario.layerBreakdown.map((layer) => (
                        <div key={layer.layerId} className="bg-black/60 border-2 border-white/20 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-xl">
                          <button
                            onClick={() => toggleLayer(layer.layerId)}
                            className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-black font-black text-xs sm:text-sm">
                                {layer.layerId}
                              </div>
                              <div className="text-left">
                                <h5 className="text-white font-black text-sm sm:text-base">{layer.name}</h5>
                                <p className="text-xs sm:text-sm text-zinc-400">
                                  {layer.issuesFound} issue{layer.issuesFound !== 1 ? 's' : ''} fixed
                                </p>
                              </div>
                            </div>
                            {expandedLayers.has(layer.layerId) ? (
                              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 flex-shrink-0" />
                            )}
                          </button>
                          {expandedLayers.has(layer.layerId) && (
                            <div className="p-3 sm:p-4 border-t border-white/20 bg-black/80">
                              <h6 className="text-xs sm:text-sm font-black text-zinc-300 mb-2">Applied Fixes:</h6>
                              <ul className="space-y-2">
                                {layer.fixes.map((fix, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-400">
                                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    {fix}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA - Only shows after user analyzes code */}
                  <InstallCTA />
                </div>
            )}
          </div>
        ) : (
            <div className="p-12 text-center">
              <p className="text-zinc-400 text-lg">
                Select a scenario from the dropdown above to begin
              </p>
            </div>
          )}
        </div>
      </div>
  );
}
