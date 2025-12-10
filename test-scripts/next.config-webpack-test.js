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


/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  
  // Webpack customization (should be detected by Turbopack migration assistant)
  webpack: (config, { isServer }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.CUSTOM_VAR': JSON.stringify('value'),
      })
    );
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': './components',
    };
    
    return config;
  },
  
  // Experimental features
  experimental: {
    ppr: 'incremental', // Should be detected for Next.js 16 migration
  },
  
  // Image optimization with deprecated domains
  images: {
    domains: ['example.com'], // Should be detected as deprecated
  },
};

module.exports = nextConfig;
