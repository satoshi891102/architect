"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ComparePage() {
  const [repo1, setRepo1] = useState("");
  const [repo2, setRepo2] = useState("");
  const router = useRouter();

  const handleCompare = () => {
    const r1 = repo1.replace("https://github.com/", "").replace(/\/$/, "");
    const r2 = repo2.replace("https://github.com/", "").replace(/\/$/, "");
    if (r1 && r2) {
      router.push(`/compare/${encodeURIComponent(r1)}/${encodeURIComponent(r2)}`);
    }
  };

  const presets = [
    { label: "Zustand vs Jotai", r1: "pmndrs/zustand", r2: "pmndrs/jotai" },
    { label: "Next.js vs Nuxt", r1: "vercel/next.js", r2: "nuxt/nuxt" },
    { label: "Tailwind vs UnoCSS", r1: "tailwindlabs/tailwindcss", r2: "unocss/unocss" },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(94,106,210,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(94,106,210,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h1 className="text-[28px] font-bold text-text-0 tracking-tight mb-2">
          Compare Repositories
        </h1>
        <p className="text-[14px] text-text-2 mb-8">
          See how two codebases stack up — architecture, health, complexity side by side.
        </p>

        <div className="flex flex-col md:flex-row gap-3 items-center mb-4">
          <input
            type="text"
            value={repo1}
            onChange={(e) => setRepo1(e.target.value)}
            placeholder="owner/repo (left)"
            className="flex-1 w-full bg-bg-1 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-0 placeholder:text-text-3 focus:outline-none focus:border-accent/50"
          />
          <span className="text-text-3 text-[14px] font-medium">vs</span>
          <input
            type="text"
            value={repo2}
            onChange={(e) => setRepo2(e.target.value)}
            placeholder="owner/repo (right)"
            className="flex-1 w-full bg-bg-1 border border-border-1 rounded-xl px-4 py-3 text-[14px] text-text-0 placeholder:text-text-3 focus:outline-none focus:border-accent/50"
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
          />
          <button
            onClick={handleCompare}
            disabled={!repo1 || !repo2}
            className="bg-accent text-white px-6 py-3 rounded-xl text-[14px] font-medium hover:bg-accent/90 transition-all disabled:opacity-40 shrink-0"
          >
            Compare
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <span className="text-[12px] text-text-3">Try:</span>
          {presets.map(p => (
            <button
              key={p.label}
              onClick={() => { setRepo1(p.r1); setRepo2(p.r2); }}
              className="text-[12px] text-text-2 border border-border-1 px-3 py-1 rounded-full hover:border-accent/50 transition-all"
            >
              {p.label}
            </button>
          ))}
        </div>

        <a href="/" className="inline-block mt-8 text-[13px] text-text-3 hover:text-accent transition-colors">
          ← Single repo analysis
        </a>
      </div>
    </div>
  );
}
