# NeuroLint — Product Roadmap

> Last updated: July 12, 2026
>
> **North star:** Stop positioning NeuroLint as "a better ESLint." Position it as **the maintenance and modernisation platform for React and Next.js applications.** The CLI is the entry point. The SaaS is the product. The data the CLI generates is the moat.
>
> **Real competitor:** Not ESLint (that's infrastructure — 141M downloads, like competing with Git). Not Grit (too abstract for solo developers). The real competitor is a developer opening Cursor and typing "fix my React errors." That's the daily behaviour NeuroLint has to complement.
>
> **Positioning reframe:** "NeuroLint runs *after* ESLint." Complementary, not competitive.

---

## Completed Work

### Phase 0 — Technical Foundation ✅

| Task | Status | Notes |
|------|--------|-------|
| Run full test suite | ✅ Done | 727/727 passing. Fixed 10 Layer 7 async/await regressions. |
| Fix security vulnerabilities | ✅ Done | 0 vulnerabilities (was 14: 9 high, 4 moderate, 1 low). |
| Dependency updates | ✅ Done | 18 packages updated. ESM-only skips documented. |

**Skip decisions on record:**
- `ora`, `strip-ansi`, `cli-cursor`, `log-symbols`, `restore-cursor` — ESM-only at latest; project uses CommonJS `require()` in `cli.js`
- `glob` — ESM-only at v13; pinned at v12
- `@vitejs/plugin-react` — major upgrade requires vite ^8; incompatible with pinned vite 6.4.3
- `vite` — pinned at 6.4.3 (minimum safe version)
- `tailwindcss` — major config rewrite required; deferred to dedicated task

---

## Phase 1 — SaaS MVP (Highest Priority)

> **Why first:** CLI tools rarely make money. The dashboard does. This is the business. Every other phase supports it.

### 1.1 Core Dashboard
- [ ] Define MVP scope: repo health scores per layer, not a full feature product
- [ ] Build the repository health view — single number per dimension:
  - Hydration score
  - Security score  
  - Accessibility score
  - Technical debt score
  - Estimated engineering hours saved
- [ ] Connect CLI output (JSON) to dashboard as data source
- [ ] Auth: email/password to start; no OAuth complexity in MVP

### 1.2 Pricing Page (Ship Before MVP Is Done)
- [ ] Publish a pricing page immediately — even "Coming soon / join the waitlist" counts
- [ ] The absence of any monetisation signal makes the project look abandoned
- [ ] Three tiers sketch: Free (CLI, open source), Pro (dashboard, single repo), Team (multi-repo, CI reports)

### 1.3 Messaging
- [ ] Managers don't buy AST transforms. They buy dashboards.
- [ ] Rewrite all copy away from: AST, rules, layers, deterministic, transform, pipeline
- [ ] Rewrite toward: "My build passes." "My deployment succeeds." "My React upgrade doesn't take three weeks." "My codebase isn't vulnerable."
- [ ] Homepage headline test: does a non-technical engineering manager understand it in 5 seconds?

---

## Phase 2 — Own the Security Niche

> **Why this niche:** Security budgets are enormous. Nobody is building "automatic CVE patching for React codebases." Semgrep scans. NeuroLint patches. That gap is real and defensible.
>
> **Target headline:** "One command patched every vulnerable React component after CVE-2025-55182."

### 2.1 Layer 8 — Keep It Current
- [x] Verify CVE tracking is current: fully patched React versions = 19.0.3, 19.1.4, 19.2.3 (minimum; latest June 2026: 19.0.7, 19.1.8, 19.2.7)
- [x] Check if any new React 19.x patch versions shipped since Dec 2025 — confirmed 19.0.7 / 19.1.8 / 19.2.7 (June 1, 2026)
- [x] Update `incompleteDoSPatched` and `rceOnlyPatched` version lists if needed — patch history updated in constants.js header
- [x] Add any new RSC CVEs disclosed in 2026 — added CVE-2025-66478 (Next.js RSC RCE, CVSS 10.0, IOC-091–095) and CVE-2026-23864 (Next.js RSC DoS, CVSS 7.5, IOC-096–100). Layer 8 v2.4.0, 100 signatures total.

### 2.2 Security Marketing
- [ ] Write one long-form technical post: "How NeuroLint auto-patches React CVEs without touching your business logic"
- [ ] Target audience: security engineers, DevSecOps teams — not just frontend devs
- [ ] Submit to: OWASP community, r/netsec, security-focused newsletters
- [ ] Add a dedicated `/security` page on the landing site listing every CVE covered, what it patches, and how to verify

### 2.3 Security as a Sales Argument
- [ ] Add to every sales touch: "We create a full backup before touching your files and auto-revert on failure" — no competitor ships this
- [ ] Backup/rollback system belongs on the homepage, not buried in docs

---

## Phase 3 — Ecosystem Accuracy Audit

> Keep the rules current. A tool that fires false positives loses trust immediately.

### 3.1 React 19 Rules
- [ ] Audit Layer 5 `forwardRef` removal rules against React 19 stable docs
- [ ] Verify Layer 3 component fixes still match current React 19 patterns

### 3.2 Next.js Rules
- [ ] Check current stable Next.js version (was targeting 16.x when last worked on)
- [ ] Audit Layer 1 config fixes against current `next.config.js` schema
- [ ] Audit Layer 5 App Router / `'use client'` rules — any new directives or deprecations?
- [ ] Verify Turbopack-as-default assumptions are still correct
- [ ] Clarify Layer 5 vs `@next/codemod` — document what NeuroLint fixes that official codemods don't

### 3.3 React Compiler
- [ ] Check React Compiler adoption/stable status
- [ ] Update memo/useMemo detection rules if compiler's stable release changed patterns
- [ ] Verify Layer 7 pattern confidence thresholds are still appropriate

---

## Phase 4 — Build Credibility (Run In Parallel With Phases 1–3)

> **The trust problem is the business problem.** No testimonials, no case studies, no public roadmap, no users telling stories. Every item here is a trust-builder, not a vanity metric.

### 4.1 One Real Case Study
- [ ] Find one real codebase (open source is fine) to run NeuroLint against with permission
- [ ] Publish before/after: files changed, issues fixed, time saved, backup log
- [ ] This single case study is worth more than 100 GitHub stars

### 4.2 Weekly Case Study Cadence (Once SaaS Launches)
- [ ] Real repositories, real metrics, before/after format
- [ ] Publish every week — the consistency signal matters as much as the content

### 4.3 Proper Product Hunt Launch
- [ ] Not the self-promotion forum — a full launch
- [ ] Lead with the CVE/security angle: "One command. React CVEs patched, hydration fixed, backup included."
- [ ] Prep: tagline, screenshots, demo GIF, 3–5 hunters lined up
- [ ] Launch Tuesday–Thursday, 12:01 AM PT
- [ ] Respond to every comment on launch day

### 4.4 Demo Asset
- [ ] 30-second GIF: messy React file → NeuroLint → clean diff, backup confirmed
- [ ] Show the concrete comparison: "Cursor changed 93 files. NeuroLint changed 12. Every change is deterministic."
- [ ] Watchable muted — no audio dependency

### 4.5 Community Presence
- [ ] Enable GitHub Discussions on the repo
- [ ] Register on G2 and Capterra — currently zero reviews anywhere; buyers look here first
- [ ] Answer genuine hydration/ESLint questions on r/reactjs and r/nextjs (helpful first, not promotional)
- [ ] Write DEV.to post: "Why I built a deterministic React fixer instead of using AI"

---

## Phase 5 — CI Integrations

> Once there are users, CI is how they keep using it. This is the retention layer.

- [ ] GitHub Actions — official action (already in marketplace, needs promotion)
- [ ] GitLab CI — `.gitlab-ci.yml` example and docs
- [ ] Azure DevOps — YAML pipeline example
- [ ] Pre-commit hook — `npx @neurolint/cli fix . --staged` pattern
- [ ] Status check: fail PR if security layer detects CVE; pass if clean
- [ ] PR comment summary: "NeuroLint found 3 issues, fixed 2 automatically. 1 requires manual review."

---

## Phase 6 — Enterprise Reporting

> This is where the money is. Managers buy reports. Compliance teams buy audit trails. CFOs buy "hours saved."

- [ ] PDF report output: repo health over time, issues fixed, hours saved, CVEs patched
- [ ] Compliance export: SARIF format (already built in Layer 8 — expose it prominently)
- [ ] PR summary comments with per-layer breakdown
- [ ] Technical debt trending: week-over-week, which releases increased/decreased debt
- [ ] Engineering intelligence layer:
  - Which patterns keep reappearing?
  - Which releases introduced the most regressions?
  - Which dependencies cause the most issues?
  - How much debt has been removed this quarter?

---

## Phase 7 — VS Code Extension

> Deferred from original priority — SaaS and credibility come first.

- [ ] Sync extension with CLI v1.5.9 feature set (Layer 8, CVE commands)
- [ ] Add inline diagnostic decorations (underline issues in-editor)
- [ ] Add one-click "Fix this file" Quick Fix code action
- [ ] Add NeuroLint sidebar panel: layer-by-layer issue counts
- [ ] Add `--dry-run` preview accessible from command palette

---

## Phase 8 — Documentation

- [ ] Verify every Layer has a doc page in `landing/src/docs/pages/`
- [ ] Add Layer 8 Security Forensics doc page if missing
- [ ] Document `migrate-nextjs-16` command with full examples
- [ ] Document `security:cve-2025-55182` commands
- [ ] Update `CONTRIBUTING.md` with Layer API contract from `rules.md`
- [ ] Add "how to add a new transformation rule" guide
- [ ] Add "how to add a new CVE signature" guide for Layer 8

---

## Tracking

| Phase | Priority | Status | Blocker |
|-------|----------|--------|---------|
| 0 — Technical foundation | — | ✅ Done | — |
| 1 — SaaS MVP | 🔴 Highest | ⬜ Not started | Needs product decisions |
| 2 — Own security niche | 🔴 High | ⬜ Not started | — |
| 3 — Ecosystem accuracy | 🟡 Medium | ⬜ Not started | — |
| 4 — Build credibility | 🟡 Medium | ⬜ Not started | Run in parallel with 1–3 |
| 5 — CI integrations | 🟡 Medium | ⬜ Not started | Needs users first |
| 6 — Enterprise reporting | 🟢 Later | ⬜ Not started | Needs SaaS first |
| 7 — VS Code extension | 🟢 Later | ⬜ Not started | Deferred |
| 8 — Documentation | 🟢 Later | ⬜ Not started | — |

---

> **Single rule:** Don't add more transformation rules until Phase 1 (SaaS MVP) is shipped. The tool already fixes more than any competitor in its niche. The gap is not technical depth — it's visibility, trust, and a business model.
