import { analyzeRepo, type FileNode, type FileEdge } from "@/lib/github";
import AnalyzeView from "@/components/AnalyzeView";

export const dynamic = "force-dynamic";

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
          <p className="text-[13px] text-text-2 mb-4">{error || "Unknown error"}</p>
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
    />
  );
}
