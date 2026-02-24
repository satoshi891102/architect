import { NextRequest, NextResponse } from "next/server";
import { analyzeRepo, computeHealthScore } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get("repo");

  if (!repo) {
    return NextResponse.json(
      { error: "Missing 'repo' parameter. Use ?repo=owner/repo" },
      { status: 400 }
    );
  }

  const parts = repo.split("/");
  if (parts.length !== 2) {
    return NextResponse.json(
      { error: "Invalid repo format. Use owner/repo" },
      { status: 400 }
    );
  }

  const [owner, repoName] = parts;
  const token = process.env.GITHUB_TOKEN || "";

  try {
    const analysis = await analyzeRepo(owner, repoName, token);

    // Compute summary stats
    const codeFiles = analysis.nodes.filter(n =>
      ["ts", "tsx", "js", "jsx", "py", "go", "rs", "css"].includes(n.ext)
    );
    const connectedFiles = new Set([
      ...analysis.edges.map(e => e.source),
      ...analysis.edges.map(e => e.target),
    ]).size;

    const hotspots = [...analysis.nodes]
      .map(n => ({ path: n.path, name: n.name, connections: n.imports.length + n.importedBy.length }))
      .filter(n => n.connections > 0)
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);

    // Health score
    const health = computeHealthScore(analysis);
    const healthScore = health.score;
    const hasTests = health.hasTests;
    const godFiles = health.godFiles;

    return NextResponse.json({
      repo: `${owner}/${repoName}`,
      summary: {
        totalFiles: analysis.totalFiles,
        totalSize: analysis.totalSize,
        codeFiles: codeFiles.length,
        dependencies: analysis.edges.length,
        connectedFiles,
        healthScore,
        hasTests,
        circularDeps: analysis.cycles.length,
        godFiles,
      },
      languages: analysis.languages,
      hotspots,
      cycles: analysis.cycles,
      edges: analysis.edges.length,
      visualUrl: `https://app-five-xi-91.vercel.app/analyze/${owner}/${repoName}`,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
