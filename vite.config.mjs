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


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'landing',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './landing/src'),
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
        // Ensure request body stream is properly forwarded
        proxyTimeout: 60000,
        timeout: 60000,
        // Don't buffer bodies
        onProxyReq: (proxyReq, req) => {
          if (req.method === 'POST' || req.method === 'PUT') {
            // Set content length if available
            if (req.headers['content-length']) {
              proxyReq.setHeader('content-length', req.headers['content-length']);
            }
          }
        }
      },
    },
  },
  preview: {
    port: 5000,
    host: '0.0.0.0'
  }
})
