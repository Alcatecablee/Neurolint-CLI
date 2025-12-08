import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Index from './Index.tsx'
import { QuickStart } from './QuickStart.tsx'
import { Blog } from './Blog.tsx'
import { BlogPost } from './BlogPost.tsx'
import { 
  DocsIntro, 
  DocsInstallation, 
  DocsQuickstart, 
  DocsArchitecture,
  DocsCliReference,
  DocsLayerSecurity
} from './docs/pages'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quick-start" element={<QuickStart />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Documentation Routes */}
        <Route path="/docs" element={<DocsIntro />} />
        <Route path="/docs/installation" element={<DocsInstallation />} />
        <Route path="/docs/quickstart" element={<DocsQuickstart />} />
        <Route path="/docs/architecture" element={<DocsArchitecture />} />
        <Route path="/docs/cli-reference" element={<DocsCliReference />} />
        <Route path="/docs/layers/security" element={<DocsLayerSecurity />} />
        
        {/* Placeholder routes - will redirect to main docs for now */}
        <Route path="/docs/how-it-works" element={<DocsArchitecture />} />
        <Route path="/docs/ast-transformations" element={<DocsArchitecture />} />
        <Route path="/docs/commands/analyze" element={<DocsCliReference />} />
        <Route path="/docs/commands/fix" element={<DocsCliReference />} />
        <Route path="/docs/commands/migrate-react19" element={<DocsCliReference />} />
        <Route path="/docs/commands/migrate-nextjs-16" element={<DocsCliReference />} />
        <Route path="/docs/layers/config" element={<DocsArchitecture />} />
        <Route path="/docs/layers/patterns" element={<DocsArchitecture />} />
        <Route path="/docs/layers/react-repair" element={<DocsArchitecture />} />
        <Route path="/docs/layers/hydration" element={<DocsArchitecture />} />
        <Route path="/docs/layers/nextjs" element={<DocsArchitecture />} />
        <Route path="/docs/layers/testing" element={<DocsArchitecture />} />
        <Route path="/docs/layers/adaptive" element={<DocsArchitecture />} />
        <Route path="/docs/security/cve-2025-55182" element={<DocsLayerSecurity />} />
        <Route path="/docs/security/ioc-detection" element={<DocsLayerSecurity />} />
        <Route path="/docs/security/incident-response" element={<DocsLayerSecurity />} />
        <Route path="/docs/guides/ci-cd" element={<DocsCliReference />} />
        <Route path="/docs/guides/backup" element={<DocsCliReference />} />
        <Route path="/docs/guides/troubleshooting" element={<DocsInstallation />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>,
)
