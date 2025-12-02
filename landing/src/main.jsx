import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Index from './Index.tsx'
import { QuickStart } from './QuickStart.tsx'
import { Blog } from './Blog.tsx'
import { BlogPost } from './BlogPost.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quick-start" element={<QuickStart />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  </React.StrictMode>,
)
