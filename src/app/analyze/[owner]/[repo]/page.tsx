import { analyzeRepo, type FileNode, type FileEdge } from "@/lib/github";
import AnalyzeView from "@/components/AnalyzeView";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}): Promise<Metadata> {
  const { owner, repo } = await params;
  const title = `${owner}/${repo} — Architect`;
  const description = `Interactive architecture visualization of ${owner}/${repo}. See dependencies, hotspots, and code structure.`;
  const ogUrl = `/api/og?repo=${encodeURIComponent(`${owner}/${repo}`)}`;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogUrl] },
  };
}

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;

  let analysis;
  let error = "";

  try {
    const token = process.env.GITHUB_TOKEN || "";
    analysis = await analyzeRepo(owner, repo, token);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to analyze repository";
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold text-text-0 mb-2">Analysis Failed</h1>
          <p className="text-[13px] text-text-2 mb-4">{error?.includes("404") ? "Repository not found or private" : error || "Unknown error"}</p>
          <a href="/" className="text-accent text-[13px] hover:underline">← Try another repo</a>
        </div>
      </div>
    );
  }

  return (
    <AnalyzeView
      owner={owner}
      repo={repo}
      nodes={analysis.nodes}
      edges={analysis.edges}
      languages={analysis.languages}
      totalFiles={analysis.totalFiles}
      totalSize={analysis.totalSize}
      cycles={analysis.cycles}
    />
  );
}
