# Architect

**See any codebase as a living, breathing map.**

Paste a GitHub repo URL → instantly visualize its architecture, dependencies, and complexity hotspots as an interactive force-directed graph.

## Live

**[architect-viz.vercel.app](https://architect-viz.vercel.app)**

## Features

- **Interactive Force Graph** — Files as nodes, imports as edges. Click any node to trace its dependency tree.
- **Architecture Insights** — Automatically identifies central modules, largest directories, and connectivity patterns.
- **Complexity Hotspots** — Ranked by dependency count. Find the files that break when you touch them.
- **Language Breakdown** — Visual bar showing language distribution across the codebase.
- **File Tree** — Collapsible directory browser with file type tags.
- **Smart Filtering** — Filter by file type (tsx, ts, js, css, etc.)
- **Node Click → Detail Panel** — Size, imports, "used by" count, with clickable links to navigate the graph.
- **Colored Edges** — Green for outgoing imports, blue for incoming dependencies when a node is selected.
- **Glow Effects** — Selected and related nodes glow to show the dependency subgraph.
- **Repo Comparison** — Compare two repos side-by-side: health scores, file counts, dependency density, circular deps.
- **Dynamic OG Images** — Share analysis links with rich previews.
- **Mobile Responsive** — Sidebar toggles on smaller screens.

## How It Works

1. Fetches the repository tree via GitHub API
2. Downloads code files and parses import/require/from statements
3. Resolves import paths to actual files in the repo
4. Builds a dependency graph
5. Renders with `react-force-graph-2d` (force-directed layout)
6. Computes metrics: hotspots, language distribution, directory analysis

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4** with custom design tokens
- **react-force-graph-2d** for graph visualization
- **GitHub REST API** for repo analysis
- **Vercel Edge** for OG image generation

## Local Development

```bash
git clone https://github.com/satoshi891102/architect.git
cd architect
npm install
cp .env.example .env.local  # Add your GITHUB_TOKEN
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | Yes | GitHub personal access token (for API rate limits) |

## Limitations

- Analyzes files up to ~100KB each (larger files skipped)
- Import parsing covers JS/TS/CSS — not Go/Rust/Python (yet)
- Very large repos (>10K files) may take a few seconds
- Private repos require a token with `repo` scope

## Built By

[Basirah](https://github.com/satoshi891102) — built overnight as a delight project.

## License

MIT
