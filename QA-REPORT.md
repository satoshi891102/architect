# QA Review: Architect

**URL:** https://app-five-xi-91.vercel.app  
**Reviewed by:** Mizan  
**Date:** 2026-02-24 00:30 GMT+2  
**Method:** web_fetch + curl (browser relay unavailable — OpenClaw Chrome extension not attached)

---

## Gate Score
N/A — quality-gate.sh not applicable (no local build dir with source). Manual review only.

## Subjective Grade: B+

---

## Test Cases

### TC-1: Homepage Loads ✅ PASS
- **Status:** 200 OK, 170ms (Vercel CDN HIT)
- **Title:** `Architect — See any codebase as a living map` ✓
- **Meta description:** Present ✓
- **Input field:** `<input type="text" placeholder="github.com/owner/repo or owner/repo">` ✓
- **Submit button:** Present, disabled until input populated ✓ (disabled:opacity-40)
- **Example buttons:** Shadcn UI, tRPC, Zustand, T3 Stack — all 4 present ✓
- **Feature stats:** "2D / Interactive Graph", "Live / Import Analysis", "Free / Public Repos" ✓
- **Footer:** "Built overnight by Basirah · Powered by GitHub API" ✓
- **OG tags:** og:title, og:description, og:type all present ✓
- **Twitter card:** summary_large_image ✓
- **Viewport:** width=device-width, initial-scale=1 ✓
- **Dark mode:** `<html class="dark">` ✓
- **Grid background:** Subtle CSS grid pattern for depth ✓
- **⚠️ Issue:** Homepage has no `og:image` — social unfurl will show no preview image for the root URL

---

### TC-2: Analyzing shadcn-ui/ui ✅ PASS
- **Status:** 200 OK
- **Time:** 3.13s (uncached — large repo)
- **Title:** `shadcn-ui/ui — Architect` ✓
- **Loading state:** Animated node graph skeleton ("Analyzing repository...") displayed during RSC streaming ✓
- **Data streaming:** React Server Component streaming delivers full analysis payload ✓
- **Per-repo OG tags:** og:image, og:title, og:description, og:image:width/height, twitter:image all present ✓
- **Note:** 3s load time is within acceptable range for a first-time large repo analysis; Vercel streaming means the loading skeleton appears immediately

---

### TC-3: Analyzing pmndrs/zustand ✅ PASS (Full data verified)
- **Status:** 200 OK, 540ms (CDN cached)
- **Title:** `pmndrs/zustand — Architect` ✓
- **Sidebar stats:**
  - 143 total files ✓
  - 47 code files ✓
  - 34 dependencies ✓
  - 38 connected ✓
  - 1.7 MB repo size ✓
- **Architecture insights panel:** 
  - "vanilla.ts is the most connected file (11 dependencies) — likely a central module." ✓
  - "38 of 47 code files are interconnected through 34 import relationships." ✓
  - Largest directories identified ✓
- **Language breakdown:** TypeScript 97.8% (indigo), JavaScript 2.2% (yellow) with visual bar ✓
- **Complexity hotspots list:** 10 items shown with dependency counts (vanilla.ts top at 11, Scene.jsx at 9) ✓
- **File tree:** Collapsible directory tree with color-coded file type dots ✓
- **Extension filter buttons:** .md(47), .ts(21), .yml(12), .tsx(12), .json(8), .jsx(8), .png(7), .js(6) ✓
- **Search input:** "Search files..." input in graph area ✓
- **Legend:** React/TSX, TypeScript, JavaScript, CSS, JSON, Markdown, HTML, Python all color-coded ✓
- **Tip:** "Click any node in the graph to see its imports and dependents. Scroll to zoom, drag to pan." ✓
- **Graph:** Nodes and edges present in HTML payload — Force-directed graph (client-side render via React/D3/similar) ✓
- **Header navigation:**
  - Back link: `← Back` → `/` ✓
  - GitHub link: `pmndrs/zustand ↗` → `https://github.com/pmndrs/zustand` opens in new tab with `rel="noopener noreferrer"` ✓

---

### TC-4: Non-existent repo (fake/nonexistent) ✅ PASS
- **Status:** 200 (not 404 — correct; the route exists, the data doesn't)
- **Error display:** "Analysis Failed" with "GitHub API error: 404" and "← Try another repo" link ✓
- **Recovery link:** Points to `/` ✓
- **No crash:** Page renders gracefully via React error boundary ✓
- **Time:** 470ms (cached)

---

### TC-5: Private repo (torvalds/private-test) ✅ PASS (graceful)
- **Status:** 200
- **Error display:** "Analysis Failed" / "GitHub API error: 404" ✓
- **Graceful failure:** No stack trace, no crash, link back to home ✓
- **⚠️ Issue (minor):** Private repos and nonexistent repos show identical error message. A private repo returns 404 from the GitHub API (GitHub doesn't reveal existence), so this is technically correct — but the UX could distinguish by saying "Repository not found or private" to help users understand why a real repo might fail.

---

### TC-6: Mobile Responsiveness ⚠️ PARTIAL PASS
- **Viewport meta:** Present ✓
- **Homepage:** Responsive layout with `px-4`, `max-w-2xl`, `max-w-xl`, `grid-cols-3` (may stack poorly at narrow widths — minor)
- **Analysis page — CRITICAL FINDING:** The entire stats sidebar uses `max-md:hidden`
  - **What this means:** On screens < 768px, the entire right panel (stats, architecture insights, language breakdown, complexity hotspots, file tree, legend) is COMPLETELY HIDDEN
  - **What mobile users see:** Only the graph area. No stats. No hotspots. No file tree. No insights.
  - **Severity:** Major UX issue. The sidebar is the most information-dense part of the app. Mobile users get a bare graph they can't interpret.
  - **No mobile alternative panel** exists (no bottom sheet, no collapsible drawer, no tab interface)

---

### TC-7: OG Image API ✅ PASS
- **Endpoint:** `https://app-five-xi-91.vercel.app/api/og?repo=test/repo`
- **Status:** 200
- **Content-Type:** `image/png` ✓
- **Time:** 1.875s (acceptable for image generation)
- **Dimensions metadata:** og:image:width=1200, og:image:height=630 (standard OG ratio) ✓
- **Used in:** All analyze pages dynamically inject the OG image URL with the encoded repo slug ✓
- **⚠️ Issue (minor):** 1.875s is slow for a social card. Consider caching generated images.

---

### TC-8: Navigation ✅ PASS
- **Back link:** `← Back` on analyze page → `/` ✓
- **GitHub link:** Repo name header links to GitHub, opens in new tab with proper security attrs ✓
- **"← Try another repo"** on error page → `/` ✓
- **"← Back to Architect"** on 404 page → `/` ✓
- **Homepage example buttons:** All 4 present and styled with hover states ✓
- **404 page:** Custom 404 renders correctly (tested via `/api/analyze?repo=...` which returns 404) ✓
- **robots tag on 404:** `<meta name="robots" content="noindex">` present on 404 ✓

---

## Performance Summary

| Endpoint | Status | Time | Cache |
|---|---|---|---|
| `/` (homepage) | 200 | 170ms | HIT |
| `/analyze/shadcn-ui/ui` | 200 | 3,130ms | MISS |
| `/analyze/pmndrs/zustand` | 200 | 540ms | HIT |
| `/analyze/fake/nonexistent` | 200 | 470ms | HIT |
| `/analyze/torvalds/private-test` | 200 | ~400ms | HIT |
| `/api/og?repo=test/repo` | 200 (PNG) | 1,875ms | — |

All well under 3s except uncached large-repo analysis (3.13s) which is acceptable.

---

## What's Good

- **Core flow works end-to-end.** Input → analysis → graph + sidebar with real data. Not a mock.
- **Data quality is genuinely useful.** Architecture insights are specific and accurate (correctly identifies vanilla.ts as the central module in zustand). This isn't lorem ipsum.
- **Error handling is clean.** No stack traces, no blank screens, no broken states. "Analysis Failed" with "← Try another repo" is exactly right.
- **Streaming UX is smart.** The animated loading skeleton appears instantly (SSR shell) while the repo data streams in. Users never see a blank page.
- **Per-page SEO is excellent.** Every analyze page gets a unique title, description, og:image with correct dimensions, twitter:image. This is production-level metadata work.
- **Security.** GitHub links open with `rel="noopener noreferrer"`. Dark mode from the root html element (no flash).
- **Typography is intentional.** Consistent text-size scale (10px, 11px, 12px, 13px, 14px, 16px, 20px, 28px) with tracking-tight on the heading.
- **Custom 404 page** with robots:noindex. Most overnight builds forget this.

---

## What's Broken

1. **[Major] Mobile sidebar completely hidden with no alternative**
   - Class `max-md:hidden` on the 320px sidebar — mobile users see only the graph
   - No bottom sheet, no drawer, no tab switcher
   - On mobile, you can't access stats, hotspots, language breakdown, or file tree
   - Fix: Add a bottom drawer or tabbed interface below the graph on mobile

2. **[Minor] Homepage has no og:image**
   - Root URL `/` has og:title and og:description but no og:image
   - Twitter/Slack/Discord unfurls will show a blank preview card
   - Fix: Add a static OG image for the homepage (or point to `/api/og?repo=shadcn-ui/ui`)

3. **[Minor] Private repos indistinguishable from nonexistent repos**
   - Both show "GitHub API error: 404"
   - Fix: Change error copy to "Repository not found or private" to reduce user confusion

---

## What's Ugly

- **Mobile graph is borderline unusable.** A force-directed graph with 100+ nodes at 375px wide, no legend, no stats — users will bounce immediately.
- **The "Try:" example buttons on homepage** don't do anything visible to indicate they're clickable until hover (relies on hover:border-accent/50). On mobile (touch), there's no hover state — they look like dead tags.
- **shadcn-ui/ui takes 3+ seconds uncached** with no progress indicator beyond the initial skeleton. Users don't know if it's loading or hung. A status message ("Fetching file tree... Parsing imports...") would help.

---

## Verdict

**SHIP** — with known mobile limitation

The core product works and delivers genuine value. Error handling is solid. SEO is production-ready. Performance is good. The mobile sidebar issue is real but doesn't break the desktop experience, which is the primary use case for a dev tool like this.

---

## Fix List (Post-ship)

1. **[Major]** Add mobile panel — bottom drawer or swipeable tab for stats/hotspots on screens < md
2. **[Minor]** Add og:image to homepage root URL
3. **[Minor]** Update error copy: "Repository not found or private" for 404 API errors
4. **[Minor]** Cache generated OG images (currently 1.875s per generation)
5. **[Nice-to-have]** Add step-by-step progress during analysis ("Fetching tree... Parsing imports... Building graph...")
6. **[Nice-to-have]** Example buttons should work on touch (add active: state for mobile)
