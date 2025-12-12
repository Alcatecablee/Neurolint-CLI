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
import { Download, Star, Code, Users } from 'lucide-react';

interface MetricProps {
  icon: React.ElementType;
  value: string;
  label: string;
  loading?: boolean;
}

const Metric: React.FC<MetricProps> = ({ icon: Icon, value, label, loading }) => (
  <div className="flex flex-col items-center gap-3 p-5 md:p-6 bg-zinc-900/40 border-2 border-black rounded-xl backdrop-blur-sm hover:border-zinc-800 transition-colors" data-testid="trust-metric">
    <Icon className="w-5 h-5 text-blue-400" />
    <div className="text-2xl md:text-3xl font-black text-white">
      {loading ? '...' : value}
    </div>
    <div className="text-xs md:text-sm text-zinc-400 font-medium">{label}</div>
  </div>
);

export const TrustMetrics: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [githubStars, setGithubStars] = useState<string>('22');
  const [npmDownloads, setNpmDownloads] = useState<string>('1K+');
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
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 ${className}`} data-testid="trust-metrics-container">
      <Metric
        icon={Star}
        value={githubStars}
        label="GitHub Stars"
        loading={loading}
      />
      <Metric
        icon={Download}
        value={npmDownloads}
        label="Monthly Downloads"
        loading={loading}
      />
      <Metric
        icon={Code}
        value="700+"
        label="Issues Fixed"
        loading={false}
      />
      <Metric
        icon={Users}
        value="1K+"
        label="Developers"
        loading={false}
      />
    </div>
  );
};
