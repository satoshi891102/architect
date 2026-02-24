import { analyzeRepo } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing owner or repo parameter. Usage: /api/analyze?owner=pmndrs&repo=zustand" },
      { status: 400 }
    );
  }

  try {
    const token = process.env.GITHUB_TOKEN || "";
    const analysis = await analyzeRepo(owner, repo, token);

    // Compute health score
    let score = 100;
    const codeExts = ["ts", "tsx", "js", "jsx", "py", "go", "rs"];
    const codeFiles = analysis.nodes.filter(n => codeExts.includes(n.ext));
    score -= analysis.cycles.length * 10;
    const godFiles = analysis.nodes
      .map(n => n.imports.length + n.importedBy.length)
      .filter(c => c > 15).length;
    score -= godFiles * 8;
    const avgDeps = codeFiles.length > 0 ? analysis.edges.length / codeFiles.length : 0;
    if (avgDeps > 5) score -= 10;
    const hasTests = analysis.nodes.some(n =>
      n.path.includes("test") || n.path.includes("spec") || n.path.includes("__tests__")
    );
    if (hasTests) score += 5;
    score = Math.max(0, Math.min(100, score));

    // Top hotspots
    const hotspots = [...analysis.nodes]
      .map(n => ({
        path: n.path,
        imports: n.imports.length,
        importedBy: n.importedBy.length,
        connections: n.imports.length + n.importedBy.length,
      }))
      .filter(n => n.connections > 0)
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);

    return NextResponse.json({
      repo: `${owner}/${repo}`,
      health: {
        score,
        label: score >= 80 ? "Healthy" : score >= 60 ? "Moderate" : "Needs Attention",
        circularDeps: analysis.cycles.length,
        godFiles,
        hasTests,
      },
      stats: {
        totalFiles: analysis.totalFiles,
        codeFiles: codeFiles.length,
        totalSize: analysis.totalSize,
        dependencies: analysis.edges.length,
        connectedFiles: new Set([
          ...analysis.edges.map(e => e.source),
          ...analysis.edges.map(e => e.target),
        ]).size,
      },
      languages: analysis.languages,
      hotspots,
      cycles: analysis.cycles.map(c => c.map(f => f.split("/").pop())),
      visualization: `https://architect-viz.vercel.app/analyze/${owner}/${repo}`,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json({ error: msg }, { status: msg.includes("404") ? 404 : 500 });
  }
}
