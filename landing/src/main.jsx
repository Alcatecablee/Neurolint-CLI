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


import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Index from './Index.tsx'
import SecurityPage from './SecurityPage.tsx'
import { QuickStart } from './QuickStart.tsx'
import { BlogPage } from './Blog.tsx'
import { BlogPost } from './BlogPost.tsx'
import { 
  DocsIntro, 
  DocsInstallation, 
  DocsQuickstart, 
  DocsArchitecture,
  DocsCliReference,
  DocsLayerSecurity,
  DocsCommandAnalyze,
  DocsCommandFix,
  DocsCommandMigrateReact19,
  DocsCommandMigrateNextjs16,
  DocsHowItWorks,
  DocsAstTransformations,
  DocsLayerConfig,
  DocsLayerPatterns,
  DocsLayerReactRepair,
  DocsLayerHydration,
  DocsLayerNextjs,
  DocsLayerTesting,
  DocsLayerAdaptive,
  DocsSecurityCve,
  DocsSecurityIoc,
  DocsSecurityIncidentResponse,
  DocsGuideCiCd,
  DocsGuideBackup,
  DocsGuideTroubleshooting
} from './docs/pages'
import { 
  FixesLayout, 
  FixesHub, 
  ReactKeysAutoFix, 
  NextLintDeprecated, 
  HydrationMismatch,
  ConsoleLogRemoval,
  TypeScriptStrictMode,
  React19Migration,
  ForwardRefRemoval,
  UseEffectCleanup,
  NextJS16Migration,
  RSCCommonErrors
} from './fixes'
import { ComparisonIndex, ESLintComparison, BiomeComparison } from './compare'
import { ScrollToTop } from './components/ScrollToTop'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/quick-start" element={<QuickStart />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Fixes Routes */}
        <Route path="/fixes" element={<FixesLayout />}>
          <Route index element={<FixesHub />} />
          <Route path="react-keys-auto-fix" element={<ReactKeysAutoFix />} />
          <Route path="next-lint-deprecated" element={<NextLintDeprecated />} />
          <Route path="hydration-mismatch" element={<HydrationMismatch />} />
          <Route path="hydration-mismatch-window-undefined" element={<HydrationMismatch />} />
          <Route path="console-log-removal" element={<ConsoleLogRemoval />} />
          <Route path="typescript-strict-mode" element={<TypeScriptStrictMode />} />
          <Route path="react-19-migration" element={<React19Migration />} />
          <Route path="forwardref-removal" element={<ForwardRefRemoval />} />
          <Route path="useeffect-cleanup-patterns" element={<UseEffectCleanup />} />
          <Route path="nextjs-16-migration" element={<NextJS16Migration />} />
          <Route path="rsc-common-errors" element={<RSCCommonErrors />} />
        </Route>
        
        {/* Comparison Routes */}
        <Route path="/compare" element={<ComparisonIndex />} />
        <Route path="/compare/eslint" element={<ESLintComparison />} />
        <Route path="/compare/biome" element={<BiomeComparison />} />
        
        {/* Documentation Routes */}
        <Route path="/docs" element={<DocsIntro />} />
        <Route path="/docs/installation" element={<DocsInstallation />} />
        <Route path="/docs/quickstart" element={<DocsQuickstart />} />
        <Route path="/docs/architecture" element={<DocsArchitecture />} />
        <Route path="/docs/cli-reference" element={<DocsCliReference />} />
        
        {/* How It Works */}
        <Route path="/docs/how-it-works" element={<DocsHowItWorks />} />
        <Route path="/docs/ast-transformations" element={<DocsAstTransformations />} />
        
        {/* Commands */}
        <Route path="/docs/commands/analyze" element={<DocsCommandAnalyze />} />
        <Route path="/docs/commands/fix" element={<DocsCommandFix />} />
        <Route path="/docs/commands/migrate-react19" element={<DocsCommandMigrateReact19 />} />
        <Route path="/docs/commands/migrate-nextjs-16" element={<DocsCommandMigrateNextjs16 />} />
        
        {/* Layers */}
        <Route path="/docs/layers/config" element={<DocsLayerConfig />} />
        <Route path="/docs/layers/patterns" element={<DocsLayerPatterns />} />
        <Route path="/docs/layers/react-repair" element={<DocsLayerReactRepair />} />
        <Route path="/docs/layers/hydration" element={<DocsLayerHydration />} />
        <Route path="/docs/layers/nextjs" element={<DocsLayerNextjs />} />
        <Route path="/docs/layers/testing" element={<DocsLayerTesting />} />
        <Route path="/docs/layers/adaptive" element={<DocsLayerAdaptive />} />
        <Route path="/docs/layers/security" element={<DocsLayerSecurity />} />
        
        {/* Security */}
        <Route path="/docs/security/cve-2025-55182" element={<DocsSecurityCve />} />
        <Route path="/docs/security/ioc-detection" element={<DocsSecurityIoc />} />
        <Route path="/docs/security/incident-response" element={<DocsSecurityIncidentResponse />} />
        
        {/* Guides */}
        <Route path="/docs/guides/ci-cd" element={<DocsGuideCiCd />} />
        <Route path="/docs/guides/backup" element={<DocsGuideBackup />} />
        <Route path="/docs/guides/troubleshooting" element={<DocsGuideTroubleshooting />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>,
)
