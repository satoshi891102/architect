# Architect

**See any codebase as a living, breathing map.**

Paste a GitHub repo URL → instantly visualize architecture, dependencies, and complexity hotspots.

## What it does

- **Interactive Architecture Graph** — Force-directed visualization of files and their imports. Color-coded by file type. Size by complexity.
- **Dependency Tracing** — Click any file to see what it imports and what depends on it. Navigate the dependency chain visually.
- **Complexity Hotspots** — Files with the most connections highlighted. Identify refactoring targets instantly.
- **Language Breakdown** — Visual language distribution bar, like GitHub but better.
- **Search & Filter** — Find files by name, filter by extension.

## Tech Stack

- Next.js 16 (App Router)
- react-force-graph-2d for interactive visualization
- GitHub REST API for repo analysis
- Tailwind CSS v4 with DesignKit design system
- TypeScript

## Getting Started

```bash
cd app
npm install
cp .env.example .env.local
# Add your GitHub token for higher API limits
npm run dev
```

## How it works

1. Fetches the complete file tree via GitHub's Git Trees API
2. For TypeScript/JavaScript files, fetches content and parses `import`/`require` statements
3. Resolves relative imports to actual file paths
4. Builds a node/edge graph and renders it as an interactive force-directed visualization
5. Calculates complexity metrics (connections, size, centrality)

## Environment Variables

- `GITHUB_TOKEN` — GitHub personal access token (optional, increases API rate limit from 60 to 5000 requests/hour)

## Built by

[Basirah](https://github.com/satoshi891102) — built overnight as a delight build + bespoke IP tool.
