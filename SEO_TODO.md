# NeuroLint SEO Optimization Todo List

This document outlines the specific, verified tasks required to align the NeuroLint landing page and documentation with the "Essential On-Page SEO Checklist".

## 1. Content Depth & Semantic Structure
- [x] **Verify Heading Hierarchy in `LayersDocSection.tsx`**: Verified and ensured layer names use `H3` and section headers use `H2`.
- [ ] **Enhance Documentation Detail**: Expand `landing/src/docs/pages/DocsLayerHydration.tsx` and similar pages with more specific code examples for common error patterns to "exceed competitor depth."
- [x] **Semantic Markup for Testimonials**: Confirmed `TestimonialsSection.tsx` uses proper `h2` and semantic structure.
- [x] **Real Testimonials**: Replaced placeholder feedback with real testimonial from `sayaword`.

## 2. Image Optimization
- [x] **Descriptive Alt Text (Header)**: Updated logo alt text to be descriptive and keyword-rich (100-150 characters).
- [x] **Descriptive Alt Text (Body)**: Updated Product Hunt and Startup Fame badges with detailed alt text in `landing/src/Index.tsx`.
- [ ] **Fallback for Demo Content**: Add hidden descriptive text or fallback images with alt tags for the `.cast` terminal demos in `DemoCarousel.tsx`.

## 3. URL & Slug Optimization
- [ ] **Shorten Blog Slugs**: Update `sitemap.xml` and corresponding route logic to shorten slugs to 3-5 words (25-30 characters).
  - *Current*: `blog/cve-2025-55182-react-server-components-rce`
  - *Target*: `blog/react-rce-patch`
- [ ] **Shorten Doc Slugs**: Update `sitemap.xml` and routes for documentation pages exceeding the length limit.

## 4. Internal Linking & Credibility
- [x] **Descriptive Anchor Text**: Improved internal links in `HydrationMismatch.tsx` with more descriptive and keyword-rich anchor text.
- [x] **Add Authorship Signals**: Created an "Engineering Team" section in `landing/src/LandingFooter.tsx` and linked it to the author's portfolio with a profile photo.
- [ ] **External Authority Links**: Add links to official React/Next.js documentation within migration guides to build reliability.

## 5. Metadata & Freshness
- [x] **Automate Freshness Signal**: Implemented a script in `landing/index.html` to automatically update the `last-modified` meta tags to the current date.
- [ ] **Unique Meta Descriptions**: Ensure every page in `landing/src/docs/pages/` and `landing/src/fixes/pages/` has a unique, intent-matched meta description using the `useMetaTags` hook.

## 6. Technical Schema
- [ ] **Verify Article Schema**: Ensure blog posts use the `Article` schema with correct `datePublished` and `dateModified` fields.
- [ ] **Verify Breadcrumb Markup**: Implement or verify breadcrumb schema for nested documentation pages to provide explicit context.
