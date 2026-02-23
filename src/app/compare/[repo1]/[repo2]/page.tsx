import { analyzeRepo } from "@/lib/github";
import Link from "next/link";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function computeHealth(analysis: any): number {
  let score = 100;
  score -= (analysis.cycles?.length || 0) * 10;
  const codeFiles = analysis.nodes.filter((n: any) => ["ts","tsx","js","jsx","py","go","rs"].includes(n.ext));
  const hotspots = analysis.nodes
    .map((n: any) => ({ connections: n.imports.length + n.importedBy.length }))
    .filter((n: any) => n.connections > 15);
  score -= hotspots.length * 8;
  const avgDeps = codeFiles.length > 0 ? analysis.edges.length / codeFiles.length : 0;
  if (avgDeps > 5) score -= 10;
  const hasTests = analysis.nodes.some((n: any) => n.path.includes("test") || n.path.includes("spec"));
  if (hasTests) score += 5;
  return Math.max(0, Math.min(100, score));
}

function StatCard({ label, v1, v2, higherIsBetter = true }: { label: string; v1: number | string; v2: number | string; higherIsBetter?: boolean }) {
  const n1 = typeof v1 === "number" ? v1 : 0;
  const n2 = typeof v2 === "number" ? v2 : 0;
  const w1 = higherIsBetter ? n1 > n2 : n1 < n2;
  const w2 = higherIsBetter ? n2 > n1 : n2 < n1;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-border-1 last:border-0">
      <div className={`text-right text-[14px] font-semibold ${w1 ? "text-green" : "text-text-0"}`}>{v1}</div>
      <div className="text-center text-[11px] text-text-3 self-center">{label}</div>
      <div className={`text-left text-[14px] font-semibold ${w2 ? "text-green" : "text-text-0"}`}>{v2}</div>
    </div>
  );
}

export default async function CompareResultPage({
  params,
}: {
  params: Promise<{ repo1: string; repo2: string }>;
}) {
  const { repo1: r1Encoded, repo2: r2Encoded } = await params;
  const repo1 = decodeURIComponent(r1Encoded);
  const repo2 = decodeURIComponent(r2Encoded);
  const [owner1, name1] = repo1.split("/");
  const [owner2, name2] = repo2.split("/");

  const token = process.env.GITHUB_TOKEN || "";

  let a1, a2, error = "";
  try {
    [a1, a2] = await Promise.all([
      analyzeRepo(owner1, name1, token),
      analyzeRepo(owner2, name2, token),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to analyze repositories";
  }

  if (error || !a1 || !a2) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[20px] font-semibold text-text-0 mb-2">Comparison Failed</h1>
          <p className="text-[13px] text-text-2 mb-4">{error || "Unknown error"}</p>
          <Link href="/compare" className="text-accent text-[13px] hover:underline">← Try again</Link>
        </div>
      </div>
    );
  }

  const h1 = computeHealth(a1);
  const h2 = computeHealth(a2);
  const code1 = a1.nodes.filter(n => ["ts","tsx","js","jsx","py","go","rs"].includes(n.ext));
  const code2 = a2.nodes.filter(n => ["ts","tsx","js","jsx","py","go","rs"].includes(n.ext));
  const connected1 = a1.nodes.filter(n => n.imports.length > 0 || n.importedBy.length > 0).length;
  const connected2 = a2.nodes.filter(n => n.imports.length > 0 || n.importedBy.length > 0).length;

  const topLang1 = Object.entries(a1.languages).sort(([,a],[,b]) => b - a)[0];
  const topLang2 = Object.entries(a2.languages).sort(([,a],[,b]) => b - a)[0];

  const colorH = (s: number) => s >= 80 ? "text-green" : s >= 60 ? "text-amber" : "text-red";

  return (
    <div className="min-h-screen bg-bg-0 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/compare" className="text-text-3 hover:text-text-0 transition-colors text-[13px]">← New comparison</Link>

        {/* Header */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-8">
          <div className="text-right">
            <a href={`https://github.com/${repo1}`} target="_blank" rel="noopener noreferrer" className="text-[18px] font-bold text-text-0 hover:text-accent transition-colors">
              {name1}
            </a>
            <p className="text-[11px] text-text-3">{owner1}</p>
          </div>
          <div className="text-center self-center">
            <span className="text-[14px] text-text-3 font-medium">vs</span>
          </div>
          <div className="text-left">
            <a href={`https://github.com/${repo2}`} target="_blank" rel="noopener noreferrer" className="text-[18px] font-bold text-text-0 hover:text-accent transition-colors">
              {name2}
            </a>
            <p className="text-[11px] text-text-3">{owner2}</p>
          </div>
        </div>

        {/* Health Scores */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-right">
            <span className={`text-[48px] font-bold ${colorH(h1)}`}>{h1}</span>
          </div>
          <div className="text-center self-center text-[12px] text-text-3 uppercase tracking-wider">Health Score</div>
          <div className="text-left">
            <span className={`text-[48px] font-bold ${colorH(h2)}`}>{h2}</span>
          </div>
        </div>

        {/* Stats comparison */}
        <div className="bg-bg-1 rounded-xl border border-border-1 p-5">
          <StatCard label="Total Files" v1={a1.totalFiles} v2={a2.totalFiles} higherIsBetter={false} />
          <StatCard label="Code Files" v1={code1.length} v2={code2.length} />
          <StatCard label="Repo Size" v1={formatBytes(a1.totalSize)} v2={formatBytes(a2.totalSize)} higherIsBetter={false} />
          <StatCard label="Dependencies" v1={a1.edges.length} v2={a2.edges.length} />
          <StatCard label="Connected" v1={connected1} v2={connected2} />
          <StatCard label="Circular Deps" v1={a1.cycles.length} v2={a2.cycles.length} higherIsBetter={false} />
          <StatCard label="Primary Language" v1={topLang1?.[0] || "—"} v2={topLang2?.[0] || "—"} />
        </div>

        {/* Deep links */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Link
            href={`/analyze/${owner1}/${name1}`}
            className="block text-center bg-bg-1 border border-border-1 rounded-xl py-3 text-[13px] text-accent hover:bg-bg-2 transition-all"
          >
            Deep dive → {name1}
          </Link>
          <Link
            href={`/analyze/${owner2}/${name2}`}
            className="block text-center bg-bg-1 border border-border-1 rounded-xl py-3 text-[13px] text-accent hover:bg-bg-2 transition-all"
          >
            Deep dive → {name2}
          </Link>
        </div>
      </div>
    </div>
  );
}
