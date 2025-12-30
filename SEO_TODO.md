# NeuroLint SEO Optimization Todo List

This document outlines the specific, verified tasks required to align the NeuroLint landing page and documentation with the "Essential On-Page SEO Checklist".

## 1. Content Depth & Semantic Structure
- [ ] **Verify Heading Hierarchy in `LayersDocSection.tsx`**: Ensure the dynamic layer names (e.g., "Layer 1: Configuration") are rendered as `H2` or `H3` tags rather than styled `div`s.
- [ ] **Enhance Documentation Detail**: Expand `landing/src/docs/pages/DocsLayerHydration.tsx` and similar pages with more specific code examples for common error patterns to "exceed competitor depth."
- [ ] **Semantic Markup for Testimonials**: Wrap the "Trusted by Development Teams" section in proper semantic tags if not already present.

## 2. Image Optimization
- [ ] **Descriptive Alt Text (Header)**: Update the logo alt text in `landing/src/LandingHeader.tsx` from "NeuroLint Logo" to a 100-150 character keyword-rich description.
- [ ] **Descriptive Alt Text (Body)**: Audit `landing/src/Index.tsx` and `landing/src/SecurityPage.tsx` to update generic alt tags (e.g., for Product Hunt/Startup Fame badges).
- [ ] **Fallback for Demo Content**: Add hidden descriptive text or fallback images with alt tags for the `.cast` terminal demos in `DemoCarousel.tsx`.

## 3. URL & Slug Optimization
- [ ] **Shorten Blog Slugs**: Update `sitemap.xml` and corresponding route logic to shorten slugs to 3-5 words (25-30 characters).
  - *Current*: `blog/cve-2025-55182-react-server-components-rce`
  - *Target*: `blog/react-rce-patch`
- [ ] **Shorten Doc Slugs**: Update `sitemap.xml` and routes for documentation pages exceeding the length limit.

## 4. Internal Linking & Credibility
- [ ] **Descriptive Anchor Text**: Audit internal links (especially in `HydrationMismatch.tsx`) to replace generic titles with descriptive anchors (e.g., "how hydration changed in React 19").
- [ ] **Add Authorship Signals**: Create a small "About the Author" or "Engineering Team" section in `landing/src/LandingFooter.tsx` or individual blog posts.
- [ ] **External Authority Links**: Add links to official React/Next.js documentation within migration guides to build reliability.

## 5. Metadata & Freshness
- [ ] **Automate Freshness Signal**: Replace the hardcoded `2025-12-30` date in `landing/index.html` with a dynamic year/month variable or a strategy for regular manual updates.
- [ ] **Unique Meta Descriptions**: Ensure every page in `landing/src/docs/pages/` and `landing/src/fixes/pages/` has a unique, intent-matched meta description using the `useMetaTags` hook.

## 6. Technical Schema
- [ ] **Verify Article Schema**: Ensure blog posts use the `Article` schema with correct `datePublished` and `dateModified` fields.
- [ ] **Verify Breadcrumb Markup**: Implement or verify breadcrumb schema for nested documentation pages to provide explicit context.
