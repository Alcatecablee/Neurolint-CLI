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

import React, { useState, useEffect } from 'react';
import { Zap, Layers, Shield, Code2 } from 'lucide-react';

interface MetricProps {
  icon: React.ElementType;
  value: string;
  label: string;
}

const Metric: React.FC<MetricProps> = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-2" data-testid="trust-metric">
    <Icon className="w-4 h-4 text-blue-400 flex-shrink-0" strokeWidth={2} />
    <div className="text-sm">
      <span className="font-semibold text-white">{value}</span>
      <span className="text-zinc-400 ml-1">{label}</span>
    </div>
  </div>
);

export const TrustMetrics: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [githubStars, setGithubStars] = useState<string>('22');
  const [npmDownloads, setNpmDownloads] = useState<string>('1K+');
  const [issuesFixed, setIssuesFixed] = useState<string>('1K+');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Fetch GitHub stars
        const githubResponse = await fetch('https://api.github.com/repos/Alcatecablee/Neurolint-CLI');
        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          setGithubStars(githubData.stargazers_count.toString());
        }

        // Fetch NPM downloads
        const npmResponse = await fetch('https://api.npmjs.org/downloads/point/last-month/@neurolint/cli');
        if (npmResponse.ok) {
          const npmData = await npmResponse.json();
          const downloads = npmData.downloads;
          setNpmDownloads(downloads >= 1000 ? `${(downloads / 1000).toFixed(1)}K` : downloads.toString());
        }

        // TODO: Fetch issues fixed stats when API endpoint is available
        // const issuesResponse = await fetch('/api/metrics/issues-fixed');
        // if (issuesResponse.ok) {
        //   const issuesData = await issuesResponse.json();
        //   setIssuesFixed(issuesData.count >= 1000 ? `${(issuesData.count / 1000).toFixed(1)}K+` : issuesData.count.toString());
        // }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className={`flex flex-wrap items-center justify-center gap-6 md:gap-8 ${className}`} data-testid="trust-metrics-container">
      <Metric
        icon={Layers}
        value="8"
        label="Automated Layers"
      />
      <Metric
        icon={Code2}
        value={loading ? '...' : issuesFixed}
        label="Issues Fixed"
      />
      <Metric
        icon={Shield}
        value="0"
        label="AI Guesswork"
      />
      <Metric
        icon={Zap}
        value={loading ? '...' : npmDownloads}
        label="Monthly Users"
      />
    </div>
  );
};
