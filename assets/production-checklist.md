# Production Checklist - CVE-2025-55182 Video

## Pre-Production (Day 1)

### Technical Setup
- [ ] Install asciinema
  ```bash
  sudo apt install asciinema
  # OR
  brew install asciinema
  ```
- [ ] Verify NeuroLint CLI is working
  ```bash
  npx @neurolint/cli --version
  ```
- [ ] Make recording scripts executable
  ```bash
  chmod +x /app/video-production/scripts/*.sh
  ```
- [ ] Test terminal size consistency (120×30)
  ```bash
  echo $COLUMNS $LINES
  ```
- [ ] Set up clean terminal theme (dark background, high contrast)

### Content Preparation
- [ ] Review video script (`/app/video-production/assets/video-script.md`)
- [ ] Review shot list (`/app/video-production/assets/shot-list.md`)
- [ ] Prepare voiceover notes
- [ ] Gather Eduardo Borges breach screenshots (if available)
- [ ] Prepare graphics templates

---

## Production - Terminal Recordings (Day 1-2)

### Recording 1: Patch Demo
- [ ] Navigate to: `/app/video-production/scripts`
- [ ] Run: `./record-demo1-patch.sh`
- [ ] Preview: `asciinema play /app/video-production/recordings/demo1-patch-vulnerability.cast`
- [ ] Re-record if needed (delete .cast file and re-run script)
- [ ] Convert to MP4:
  ```bash
  asciinema render demo1-patch-vulnerability.cast demo1-patch.mp4 -t asciinema
  ```
- [ ] Quality check:
  - [ ] Commands execute correctly
  - [ ] Output is readable
  - [ ] No awkward pauses
  - [ ] Duration ~30-40 seconds

### Recording 2: Scan Demo
- [ ] Navigate to: `/app/video-production/scripts`
- [ ] Run: `./record-demo2-scan.sh`
- [ ] Preview: `asciinema play /app/video-production/recordings/demo2-scan-compromise.cast`
- [ ] Re-record if needed
- [ ] Convert to MP4:
  ```bash
  asciinema render demo2-scan-compromise.cast demo2-scan.mp4 -t asciinema
  ```
- [ ] Quality check:
  - [ ] All 11 categories appear
  - [ ] Findings are clearly visible
  - [ ] Text is readable
  - [ ] Duration ~60-90 seconds

### Recording 3: Complete Workflow
- [ ] Navigate to: `/app/video-production/scripts`
- [ ] Run: `./record-demo3-complete.sh`
- [ ] Preview: `asciinema play /app/video-production/recordings/demo3-complete-workflow.cast`
- [ ] Re-record if needed
- [ ] Convert to MP4:
  ```bash
  asciinema render demo3-complete-workflow.cast demo3-complete.mp4 -t asciinema
  ```
- [ ] Quality check:
  - [ ] All 4 steps shown
  - [ ] Clear progression
  - [ ] Success confirmation visible
  - [ ] Duration ~45 seconds

---

## Production - Graphics & Animation (Day 2)

### Hook Section (0:00-0:50)
- [ ] Create timeline graphic (Dec 3 → Dec 7 → Today)
- [ ] Design split-screen visual (patched code vs. malware)
- [ ] Add text overlays for key phrases
- [ ] Export as MP4 (1920×1080, 30fps)

### Breach Case Study (0:50-2:15)
- [ ] Gather/create malicious process screenshots
- [ ] Add annotations (arrows, highlights)
- [ ] Create "Vulnerability → Exploit → Patch → Infection" diagram
- [ ] Export screenshots (1920×1080)

### Why Patching Isn't Enough (2:15-3:30)
- [ ] Create door metaphor animation
- [ ] Design threat checklist graphic
- [ ] Add icons for each threat type
- [ ] Export as MP4

### End Screen (7:00-7:45)
- [ ] Design end screen with:
  - [ ] GitHub link + QR code
  - [ ] NPM link
  - [ ] Docs link
  - [ ] Subscribe button
  - [ ] Social links
- [ ] Export as PNG overlay

---

## Production - Voiceover (Day 3)

### Recording Setup
- [ ] Find quiet environment
- [ ] Test microphone levels
- [ ] Have water available
- [ ] Open script: `/app/video-production/assets/video-script.md`

### Recording Sections
- [ ] Hook (0:00-0:50)
- [ ] Breach case study (0:50-2:15)
- [ ] Why patching isn't enough (2:15-3:30)
- [ ] Demo 1 intro (3:30-4:30)
- [ ] Demo 2 intro (4:30-6:00)
- [ ] Action plan (6:00-7:00)
- [ ] Closing (7:00-7:45)

### Post-Recording
- [ ] Noise reduction (if needed)
- [ ] Normalize audio levels
- [ ] Remove mouth clicks/breaths
- [ ] Export as WAV (48kHz)

---

## Post-Production - Video Assembly (Day 3-4)

### Import Assets
- [ ] Terminal recordings (3 MP4s)
- [ ] Graphics/animations
- [ ] Voiceover audio
- [ ] B-roll footage
- [ ] Background music (optional, subtle)

### Video Editing Sequence
- [ ] 0:00-0:50 - Hook + Timeline
- [ ] 0:50-2:15 - Breach case study
- [ ] 2:15-3:30 - Why patching isn't enough
- [ ] 3:30-4:30 - Demo 1 (Patch)
- [ ] 4:30-6:00 - Demo 2 (Scan)
- [ ] 6:00-7:00 - Demo 3 (Complete workflow)
- [ ] 7:00-7:45 - Closing + End screen

### Polish
- [ ] Add transitions between sections
- [ ] Synchronize voiceover with visuals
- [ ] Add subtle zoom-ins on key terminal output
- [ ] Color correction for consistency
- [ ] Audio mixing (balance voiceover and any music)
- [ ] Add captions/subtitles (highly recommended)

### Quality Check
- [ ] Watch at 1080p (desktop)
- [ ] Watch at 480p (mobile simulation)
- [ ] Verify all text is readable
- [ ] Check audio levels (no clipping)
- [ ] Verify no awkward cuts
- [ ] Confirm end screen appears at right time
- [ ] Test on different devices if possible

---

## YouTube Setup (Day 4)

### Video Details
- [ ] Title: "The Complete CVE-2025-55182 Fix (Patch + Detect Compromise)"
- [ ] Description: Use `/app/video-production/assets/youtube-description.txt`
- [ ] Thumbnail: Upload custom thumbnail (1280×720)
- [ ] Tags: React, NextJS, CyberSecurity, CVE-2025-55182, etc.
- [ ] Category: Science & Technology
- [ ] Language: English

### End Screen & Cards
- [ ] Add end screen at 7:00 (last 45 seconds)
- [ ] Link to:
  - [ ] Subscribe button
  - [ ] GitHub repository (external link)
  - [ ] Related video (if available)
  - [ ] Best video for viewer

### Advanced Settings
- [ ] Allow embedding: Yes
- [ ] Publish to subscriptions feed: Yes
- [ ] Category: Science & Technology
- [ ] Comments: Enabled
- [ ] Age restriction: No

### Monetization (If Applicable)
- [ ] Suitable for all advertisers
- [ ] No sensitive content

---

## Distribution (Launch Day)

### Pre-Launch (1 hour before)
- [ ] Schedule or set to unlisted
- [ ] Share private link with trusted reviewers
- [ ] Check all metadata one more time

### Launch
- [ ] Publish video
- [ ] Copy video URL

### Social Media (Within 1 hour)
- [ ] Twitter/X:
  - [ ] Tag @reactjs
  - [ ] Tag security researchers
  - [ ] Include CVE number
  - [ ] Add video link
  - [ ] Use hashtags: #React #CyberSecurity #CVE202555182

- [ ] Reddit:
  - [ ] r/netsec (check rules first)
  - [ ] r/reactjs
  - [ ] r/nextjs
  - [ ] r/cybersecurity
  - [ ] Wait 24 hours for initial views before posting

- [ ] Dev.to:
  - [ ] Write companion blog post
  - [ ] Embed video
  - [ ] Add code examples
  - [ ] Link to GitHub

- [ ] Hacker News:
  - [ ] Submit if video gains traction
  - [ ] Title: "Show HN: NeuroLint - Patch CVE-2025-55182 and detect post-breach infections"

- [ ] LinkedIn:
  - [ ] Share in cybersecurity groups
  - [ ] Tag relevant contacts
  - [ ] Professional context

### GitHub
- [ ] Update README.md to reference video
- [ ] Add video thumbnail with link to docs
- [ ] Tweet from account (if available)

---

## Post-Launch Monitoring (First 48 hours)

### Engagement
- [ ] Respond to YouTube comments within 2 hours
- [ ] Answer technical questions
- [ ] Thank viewers for engagement
- [ ] Pin best comment

### Analytics
- [ ] Track views in first 24 hours
- [ ] Monitor audience retention graph
- [ ] Check click-through rate (CTR) on thumbnail
- [ ] Review traffic sources

### Adjustments
- [ ] If CTR < 4%: Consider new thumbnail
- [ ] If retention drops at specific point: Add chapter marker
- [ ] If negative feedback: Address in pinned comment

---

## Success Metrics

### Week 1 Goals
- [ ] 1,000+ views
- [ ] 50+ GitHub stars
- [ ] 20+ NPM downloads
- [ ] 10+ quality comments
- [ ] CTR > 5%
- [ ] Avg. view duration > 4:00

### Month 1 Goals
- [ ] 10,000+ views
- [ ] 200+ GitHub stars
- [ ] 100+ NPM downloads
- [ ] Featured in security newsletter

---

## Backup Plan

If video doesn't perform well in first 48 hours:

1. **Thumbnail A/B Test**
   - Create 2 alternative thumbnails
   - Use YouTube's A/B testing (if available) or manual switch after 1 week

2. **Title Optimization**
   - Alternative: "You Patched React2Shell. Now Scan for Infections."
   - Alternative: "The React2Shell Problem Nobody's Talking About"

3. **Cross-Promotion**
   - Reach out to security YouTubers for collaboration
   - Guest post on security blogs with video embed
   - Submit to security newsletters

4. **Paid Promotion (Optional)**
   - Consider small YouTube Ads budget ($50-100)
   - Target keywords: CVE-2025-55182, React security, Next.js security

---

## Files Generated

### All Video Production Assets:
```
/app/video-production/
├── recordings/
│   ├── demo1-patch-vulnerability.cast
│   ├── demo2-scan-compromise.cast
│   └── demo3-complete-workflow.cast
├── demo-files/
│   ├── vulnerable-app/
│   │   ├── package.json
│   │   └── app/page.tsx
│   └── infected-examples/
│       ├── backdoor-route.ts
│       ├── obfuscated-malware.js
│       ├── credential-harvester.ts
│       └── fake-system-service.sh
├── scripts/
│   ├── record-demo1-patch.sh
│   ├── record-demo2-scan.sh
│   └── record-demo3-complete.sh
└── assets/
    ├── youtube-description.txt
    ├── video-script.md
    ├── shot-list.md
    └── production-checklist.md (this file)
```

---

**Ready to start? Begin with terminal recordings (Day 1) ✅**
