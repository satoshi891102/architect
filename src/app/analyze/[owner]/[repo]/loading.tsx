export default function AnalyzeLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg-0">
      <div className="text-center">
        {/* Animated graph nodes */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="absolute rounded-full bg-accent"
              style={{
                width: `${12 + i * 4}px`,
                height: `${12 + i * 4}px`,
                top: `${50 + Math.sin(i * 1.2) * 30}%`,
                left: `${50 + Math.cos(i * 1.2) * 30}%`,
                transform: "translate(-50%, -50%)",
                opacity: 0.3 + i * 0.15,
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 128 128">
            <line x1="40" y1="60" x2="80" y2="40" stroke="#5E6AD2" strokeWidth="1" />
            <line x1="80" y1="40" x2="90" y2="80" stroke="#5E6AD2" strokeWidth="1" />
            <line x1="40" y1="60" x2="60" y2="90" stroke="#5E6AD2" strokeWidth="1" />
          </svg>
        </div>

        <h2 className="text-[16px] font-medium text-text-0 mb-2">Analyzing repository...</h2>
        <p className="text-[13px] text-text-3">Fetching file tree, parsing imports, building dependency graph</p>

        <div className="mt-6 flex items-center justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent"
              style={{
                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.3); }
        }
        @keyframes bounce {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
