# NeuroLint SEO Manual Tasks

These are SEO tasks that require your manual effort (Google Search Console access, backlinks, content strategy, etc.)

---

## What I Already Implemented

- [x] Updated meta keywords with researched high-value keywords
- [x] Sitemap.xml exists and is up to date (48 pages indexed)
- [x] Robots.txt properly configured
- [x] JSON-LD structured data (SoftwareApplication, Organization, FAQPage, WebSite)
- [x] Open Graph and Twitter Card meta tags
- [x] Canonical URLs set
- [x] Mobile-friendly viewport meta
- [x] Favicon set in multiple sizes
- [x] Preconnect for fonts performance

---

## Priority 1: Google Search Console Setup

### Submit Your Site
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://www.neurolint.dev/`
3. Verify ownership (DNS, HTML file, or meta tag method)
4. Submit sitemap: `https://www.neurolint.dev/sitemap.xml`

### Request Indexing
After verification, manually request indexing for high-priority pages:
- Homepage `/`
- Security page `/security`
- Quick Start `/quick-start`
- Blog posts (especially CVE articles - these are timely and newsworthy)

---

## Priority 2: Low-Hanging Fruit Strategy (From Brandon Longo's Twitter Tip)

Once you have 3+ months of GSC data, do this monthly:

### Find Golden Keywords (Position 11-20)
1. Go to GSC Performance tab
2. Filter: Position 11-20
3. Filter: Clicks > 100 over 3 months
4. Sort by impressions (high to low)

These keywords are close to page 1. Small tweaks = big results.

### Optimization Formula for Each Target Page
1. Update title tag with exact keyword match
2. Add keyword to H1 and first sentence
3. Write 200-300 words of search-intent content
4. Add internal links from 3-5 related pages
5. Update meta description for higher CTR

### Advanced Filter Combos
- **Position 4-10 + Impressions >1000** = Can hit page 1 fast
- **Position 11-30 + CTR <2%** = Title tag optimization gold
- **Branded keywords + Position >3** = You should own your brand terms

---

## Priority 3: Content Refresh Strategy (From Hridoy Rehman's Twitter Tip)

This simple process got 4,700+ traffic in 6 months:

### Monthly Content Refresh Workflow
1. Grab an existing blog post
2. Go to GSC and find keywords that URL ranks for
3. Ask Gemini/Claude: "Which of these keywords are missing from this content?"
4. Ask it to insert missing keywords naturally
5. Republish with updated date

### Target Pages for Refresh
- `/blog/cve-2025-55182-react-server-components-rce`
- `/blog/fix-react-nextjs-hydration-errors-complete-guide`
- `/blog/8-layer-code-fixing-pipeline-explained`

---

## Priority 4: Target Keywords to Rank For

### Primary Keywords (High Intent)
| Keyword | Action Needed |
|---------|---------------|
| React code fixer | Already in title - monitor rankings |
| React hydration error fix | Create dedicated blog post if not exists |
| ESLint alternative | Position against ESLint in content |
| React debugging tool | Emphasize in feature descriptions |
| Next.js migration tool | Highlight React 19 / Next.js 16 migration |

### Long-Tail Keywords (Lower Competition)
Create content targeting these:
- "how to fix React hydration errors automatically"
- "automated React bug fixer CLI"
- "fix React performance issues CLI"
- "React hooks error fixer"
- "React Server Components debugging tool"
- "React 19 breaking changes fix"
- "Next.js App Router migration tool"

### Blog Post Ideas for Organic Traffic
1. "React Best Practices 2025: Complete Checklist"
2. "Common React Errors and How to Fix Them Automatically"
3. "React Hydration Errors: Complete Guide with Solutions"
4. "Migrating from React 18 to React 19: What Breaks and How to Fix It"
5. "ESLint vs NeuroLint: Why Rule-Based Fixing Beats Linting"
6. "React Server Components Security Guide 2025"

---

## Priority 5: Backlink Strategy

### Get High DR Backlinks From
1. **Dev.to** - Write tutorial articles with links back
2. **Hashnode** - Cross-post blog content
3. **Reddit** - Share in r/reactjs, r/nextjs, r/webdev (valuable content, not spam)
4. **Hacker News** - Submit when you have newsworthy updates (CVE fixes are perfect)
5. **Product Hunt** - Launch when ready
6. **GitHub Awesome Lists** - Submit to awesome-react, awesome-nextjs
7. **npm trending** - Downloads boost visibility

### Guest Post Opportunities
- React/Next.js focused blogs
- Web security blogs (your CVE content is valuable)
- Developer tool review sites

---

## Priority 6: Technical SEO Monitoring

### Monthly Checks
- [ ] Check GSC for crawl errors
- [ ] Review Core Web Vitals (LCP, FID, CLS)
- [ ] Check for broken links (use screaming frog or similar)
- [ ] Monitor page load speed (PageSpeed Insights)
- [ ] Review mobile usability issues

### Track Rankings for These Terms
Set up rank tracking (Ahrefs, SEMrush, or free alternatives like SerpWatch):
- "react code fixer"
- "neurolint"
- "fix react hydration errors"
- "react cli tool"
- "next.js migration tool"
- "cve-2025-55182" (own this term!)

---

## Priority 7: Quick Wins Checklist

### This Week
- [ ] Set up Google Search Console
- [ ] Submit sitemap
- [ ] Create Google Business Profile (if applicable)
- [ ] Share on Twitter/X with relevant hashtags
- [ ] Post on Reddit (r/reactjs, r/nextjs)

### This Month
- [ ] Write 1-2 targeted blog posts
- [ ] Submit to Product Hunt
- [ ] Get listed on awesome-react GitHub list
- [ ] Reach out to 5 dev blogs for potential mentions

### Ongoing
- [ ] Monthly content refresh (Hridoy's strategy)
- [ ] Monthly GSC analysis (Brandon's strategy)
- [ ] Track and respond to branded mentions
- [ ] Build relationships with React/Next.js influencers

---

## Tools You'll Need

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Google Search Console | Rankings, indexing, keywords | Yes |
| Google Analytics | Traffic analysis | Yes |
| Ahrefs/SEMrush | Backlink analysis, competitor research | Limited |
| Screaming Frog | Technical SEO audit | 500 URLs free |
| PageSpeed Insights | Core Web Vitals | Yes |
| Ubersuggest | Keyword research | Limited |

---

## Notes

- SEO is a long game - expect 3-6 months for significant results
- Your CVE content is your secret weapon - security content gets backlinks naturally
- Focus on 5-10 keywords max per month
- Track everything in GSC weekly
