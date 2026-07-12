# NeuroLint — Revival TODO

> Created: July 12, 2026 · Context: Project dormant for ~6 months (last release v1.5.9, Dec 30 2025)

---

## Phase 1 — Technical Catch-Up (Do This First)

### 1.1 Run the Full Test Suite ✅ DONE
- [x] Ran `npm test` — 727 tests total (up from 676 baseline), 727 passing
- [x] Found 10 failing tests in `__tests__/fix-layer-7-adaptive.test.js`
- [x] Root cause: `extractPatterns()` became `async` but test calls lacked `await`
- [x] Fixed: added `async`/`await` to all 10 affected tests
- [x] Fixed: `extractPatterns()` now filters out patterns with no `pattern` field (prevents downstream `.toString()` crash)
- [x] Fixed: one test's `toBe(0)` check tightened to check actual semantic intent

### 1.2 Fix Security Vulnerabilities ✅ DONE
- [x] Ran `npm audit` — confirmed 14 vulns (9 high, 4 moderate, 1 low)
- [x] Ran `npm audit fix` — resolved 12 vulns (all non-breaking transitive deps)
- [x] Evaluated vite separately: vuln range ≤6.4.2, upgraded `vite ^4.5.14 → ^6.4.3` (minimum safe version)
- [x] Confirmed `@vitejs/plugin-react@4.7.0` supports vite ^6 before upgrading
- [x] Re-ran `npm audit` — **0 vulnerabilities**
- [x] 727/727 tests still passing after all changes
- [x] Landing page verified running on VITE v6.4.3

### 1.3 Dependency Updates
- [ ] Check for outdated packages: `npm outdated`
- [ ] Update `@babel/parser`, `@babel/traverse`, `@babel/generator`, `@babel/types` to latest
- [ ] Update dev dependencies: Jest 30.x, `@types/jest`, `@testing-library/user-event`
- [ ] Re-run tests after each batch update to catch regressions early

---

## Phase 2 — Ecosystem Drift Audit

### 2.1 React 19 Rule Accuracy
- [ ] Verify CVE tracking is current: fully patched versions should be 19.0.3, 19.1.4, 19.2.3
- [ ] Check if any new React 19.x patch versions have shipped since Dec 2025
- [ ] Update `incompleteDoSPatched` and `rceOnlyPatched` version lists in Layer 8 if needed
- [ ] Audit Layer 5 `forwardRef` removal rules against React 19 stable docs

### 2.2 Next.js Rule Accuracy
- [ ] Check current stable Next.js version (was targeting 16.x)
- [ ] Audit Layer 1 config fixes against current `next.config.js` schema
- [ ] Audit Layer 5 App Router / `'use client'` rules — any new directives or deprecations?
- [ ] Verify Turbopack-as-default assumptions are still correct in Layer 5

### 2.3 React Compiler
- [ ] Check React Compiler adoption status (Layer 7 adaptive patterns)
- [ ] Update memo/useMemo detection rules if the compiler's stable release changed patterns
- [ ] Verify Layer 7 pattern confidence thresholds are still appropriate

---

## Phase 3 — VS Code Extension

### 3.1 Bring Extension Up to Date
- [ ] Check extension version (currently v1.5.1, 51 installs, 1 review)
- [ ] Sync extension with CLI v1.5.9 feature set (Layer 8, CVE commands, etc.)
- [ ] Test extension locally against a real Next.js project

### 3.2 Improve Extension UX
- [ ] Add inline diagnostic decorations (underline issues in-editor, not just in problems panel)
- [ ] Add one-click "Fix this file" code action via VS Code Quick Fix
- [ ] Add a NeuroLint sidebar panel showing layer-by-layer issue counts
- [ ] Add `--dry-run` preview mode accessible from the command palette

---

## Phase 4 — Launch & Awareness

### 4.1 Demo Asset
- [ ] Create a 30-second GIF/video: messy React file → NeuroLint → clean code
- [ ] Show at least 3 concrete fixes: missing key, hydration guard, use client
- [ ] Make it shareable without audio (most dev content is watched muted)

### 4.2 Proper Product Hunt Launch
- [ ] Prep launch assets: tagline, description, screenshots, demo GIF
- [ ] Line up a few hunters/supporters ahead of time
- [ ] Launch Tuesday–Thursday, 12:01 AM PT for full day cycle
- [ ] Respond to every comment on launch day

### 4.3 Community Presence
- [ ] Enable GitHub Discussions on the repo
- [ ] Answer 3–5 genuine hydration/ESLint questions on r/reactjs and r/nextjs (be helpful, not promotional)
- [ ] Submit to more developer tool directories (there.so, toools.io, etc.)
- [ ] Write a genuine DEV.to post: "I built a tool that fixes React bugs without AI — here's what I learned"

### 4.4 Landing Page Polish
- [ ] Verify all nav links and demo sections work correctly
- [ ] Add a live "try it" section if feasible (paste code, see fix)
- [ ] Add real download/usage numbers once they're worth showing
- [ ] Add a changelog section to homepage (latest release highlights)

---

## Phase 5 — Documentation

### 5.1 Docs Completeness
- [ ] Verify every Layer has a doc page in `landing/src/docs/pages/`
- [ ] Add Layer 8 (Security Forensics) doc page if missing
- [ ] Document the `migrate-nextjs-16` command with full examples
- [ ] Document the `security:cve-2025-55182` commands

### 5.2 Contributing Guide
- [ ] Update `CONTRIBUTING.md` with the Layer API contract from `rules.md`
- [ ] Add a "how to add a new transformation rule" guide
- [ ] Add a "how to add a new CVE signature" guide for Layer 8

---

## Tracking

| Phase | Status | Notes |
|-------|--------|-------|
| 1.1 Run tests | ✅ Done | 727/727 passing. Fixed 10 Layer 7 async/await regressions. |
| 1.2 Fix vulns | ⬜ Pending | |
| 1.3 Dep updates | ⬜ Pending | |
| 2.x Ecosystem audit | ⬜ Pending | |
| 3.x VS Code extension | ⬜ Pending | |
| 4.x Launch & awareness | ⬜ Pending | |
| 5.x Documentation | ⬜ Pending | |

---

**Rule**: Complete Phase 1 fully before starting Phase 2. Tests must be green before any rule changes.
