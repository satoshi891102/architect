"use client";

export default function AnalyzeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-red-400 text-[20px]">!</span>
        </div>
        <h1 className="text-[20px] font-semibold text-text-0 mb-2">Analysis Failed</h1>
        <p className="text-[13px] text-text-2 mb-6">
          {error.message || "Could not analyze this repository. It may be private, too large, or the branch name might differ."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] font-medium hover:opacity-90 transition-all"
          >
            Try Again
          </button>
          <a href="/" className="px-4 py-2 rounded-lg bg-bg-1 border border-border-1 text-text-1 text-[13px] hover:border-accent/50 transition-all">
            ← Home
          </a>
        </div>
      </div>
    </div>
  );
}
