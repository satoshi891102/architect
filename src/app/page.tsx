"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Parse GitHub URL
    const patterns = [
      /github\.com\/([^/]+)\/([^/\s?#]+)/,
      /^([^/\s]+)\/([^/\s]+)$/,
    ];

    let owner = "", repo = "";
    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, "");
        break;
      }
    }

    if (!owner || !repo) {
      setError("Paste a GitHub URL or owner/repo (e.g. facebook/react)");
      return;
    }

    setLoading(true);
    router.push(`/analyze/${owner}/${repo}`);
  };

  const examples = [
    { label: "Shadcn UI", repo: "shadcn-ui/ui" },
    { label: "tRPC", repo: "trpc/trpc" },
    { label: "Zustand", repo: "pmndrs/zustand" },
    { label: "T3 Stack", repo: "t3-oss/create-t3-app" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(94,106,210,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(94,106,210,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight text-text-0">Architect</h1>
        </div>
        <p className="text-[16px] text-text-2 leading-relaxed mb-2">
          See any codebase as a living, breathing map.
        </p>
        <p className="text-[13px] text-text-3">
          Paste a GitHub repo URL — instantly visualize architecture, dependencies, and complexity hotspots.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleAnalyze} className="w-full max-w-xl mx-auto mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={e => { setUrl(e.target.value); setError(""); }}
            placeholder="github.com/owner/repo or owner/repo"
            className="flex-1 px-4 py-3 rounded-xl bg-bg-1 border border-border-1 text-text-0 text-[14px] placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-accent text-white text-[14px] font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing
              </span>
            ) : "Analyze"}
          </button>
        </div>
        {error && <p className="text-red-400 text-[12px] mt-2 pl-1">{error}</p>}
      </form>

      {/* Examples */}
      <div className="flex items-center gap-2 text-[12px] text-text-3">
        <span>Try:</span>
        {examples.map(ex => (
          <button
            key={ex.repo}
            onClick={() => setUrl(ex.repo)}
            className="px-2.5 py-1 rounded-lg bg-bg-1 border border-border-1 hover:border-accent/50 hover:text-text-1 transition-all"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-16 grid grid-cols-3 gap-8 text-center">
        <div>
          <div className="text-[20px] font-semibold text-text-0">2D</div>
          <div className="text-[11px] text-text-3">Interactive Graph</div>
        </div>
        <div>
          <div className="text-[20px] font-semibold text-text-0">Live</div>
          <div className="text-[11px] text-text-3">Import Analysis</div>
        </div>
        <div>
          <div className="text-[20px] font-semibold text-text-0">Free</div>
          <div className="text-[11px] text-text-3">Public Repos</div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-16 pb-8 text-[11px] text-text-3">
        Built overnight by Basirah · Powered by GitHub API
      </div>
    </div>
  );
}
