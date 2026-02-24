# Architect — Morning Briefing Notes

## One-liner
Interactive code intelligence platform — paste any GitHub URL, see architecture as a living map with health scores.

## Why This Matters
1. CodeSee (raised $10M for similar concept) is dead. Market gap exists.
2. Developers share these visualizations constantly on Twitter/HN.
3. Doubles as bespoke IP — we can use this to analyze our own codebases before builds.
4. Multi-language (TS/JS/Python/Go/Rust) — not just a JS tool.

## What It Does
- Force-directed graph visualization of any GitHub repo
- Health Score (0-100) computed from architecture quality
- Circular dependency detection with visual warnings  
- Architecture insights (identifies central modules, god files)
- Language breakdown, complexity hotspots
- File tree browser, search, type filtering
- Click any node → see imports/dependents with colored edges
- Dynamic OG images for social sharing
- Mobile responsive (Stats toggle button on mobile)

## Tested With
- shadcn-ui/ui (9,690 files) — TS monorepo
- pmndrs/zustand (143 files) — TS library
- pallets/flask (235 files) — Python framework
- gin-gonic/gin — Go web framework
- BurntSushi/ripgrep — Rust CLI tool
- satoshi891102/architect (self-analysis)

## Build Stats
- 26 git commits in ~3 hours
- QA: B+ (Mizan)
- Languages parsed: TypeScript, JavaScript, Python, Go, Rust, CSS
- ISR caching (5min) for fast repeat visits

## Live
- https://architect-viz.vercel.app
- https://app-five-xi-91.vercel.app
- GitHub: github.com/satoshi891102/architect

## Known Limitations (from QA)
- Graph can be dense on very large repos (>5K files)
- Private repos require GitHub token
- OG image generation takes ~1.8s (acceptable)

## Revenue Path
- Free tool → audience builder → HN/Twitter virality potential
- Premium features later: private repos, CI integration, historical tracking
- Positions us as "dev tools" brand
