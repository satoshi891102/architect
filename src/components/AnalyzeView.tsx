"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import type { FileNode, FileEdge } from "@/lib/github";
import Link from "next/link";
import FileTree from "./FileTree";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

type GraphNode = {
  id: string;
  name: string;
  ext: string;
  size: number;
  imports: string[];
  importedBy: string[];
  directory: string;
  color: string;
  val: number;
};

type GraphLink = {
  source: string;
  target: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const langColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f0db4f",
    CSS: "#264de4",
    HTML: "#e34c26",
    Python: "#3572A5",
    Go: "#00ADD8",
    Rust: "#dea584",
    Shell: "#89e051",
    SCSS: "#c6538c",
    JSON: "#6b7280",
  };

  const sorted = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-2 mb-2">
        {sorted.map(([lang, bytes]) => (
          <div
            key={lang}
            style={{
              width: `${(bytes / total) * 100}%`,
              backgroundColor: langColors[lang] || "#6b7280",
            }}
            title={`${lang}: ${((bytes / total) * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {sorted.slice(0, 6).map(([lang, bytes]) => (
          <div key={lang} className="flex items-center gap-1.5 text-[11px]">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: langColors[lang] || "#6b7280" }}
            />
            <span className="text-text-2">{lang}</span>
            <span className="text-text-3">{((bytes / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyzeView({
  owner,
  repo,
  nodes,
  edges,
  languages,
  totalFiles,
  totalSize,
}: {
  owner: string;
  repo: string;
  nodes: FileNode[];
  edges: FileEdge[];
  languages: Record<string, number>;
  totalFiles: number;
  totalSize: number;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterExt, setFilterExt] = useState<string | null>(null);
  const [dims, setDims] = useState({ w: 800, h: 600 });

  // Track window size
  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);

  // Build graph data — only nodes with connections for cleaner visualization
  const graphData = useMemo(() => {
    const connectedIds = new Set<string>();
    edges.forEach(e => {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    });

    // Include connected nodes + standalone code files (for completeness)
    const graphNodes: GraphNode[] = nodes
      .filter(n => {
        if (filterExt && n.ext !== filterExt) return false;
        if (searchQuery) return n.path.toLowerCase().includes(searchQuery.toLowerCase());
        return connectedIds.has(n.id) || ["ts", "tsx", "js", "jsx"].includes(n.ext);
      })
      .map(n => ({
        ...n,
        val: Math.max(2, Math.sqrt(n.size / 100)),
      }));

    const nodeIds = new Set(graphNodes.map(n => n.id));
    const graphLinks: GraphLink[] = edges.filter(
      e => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    return { nodes: graphNodes, links: graphLinks };
  }, [nodes, edges, filterExt, searchQuery]);

  // Stats
  const codeFiles = nodes.filter(n => ["ts", "tsx", "js", "jsx"].includes(n.ext));
  const connectedFiles = new Set([...edges.map(e => e.source), ...edges.map(e => e.target)]).size;

  // File extensions for filter
  const extCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach(n => {
      if (n.ext) counts[n.ext] = (counts[n.ext] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [nodes]);

  // Hotspots — most connected files
  const hotspots = useMemo(() => {
    return [...nodes]
      .map(n => ({ ...n, connections: n.imports.length + n.importedBy.length }))
      .filter(n => n.connections > 0)
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10);
  }, [nodes]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    const fileNode = nodes.find(n => n.id === node.id);
    setSelectedNode(fileNode || null);
  }, [nodes]);

  const nodeCanvasObject = useCallback((node: GraphNode & { x?: number; y?: number }, ctx: CanvasRenderingContext2D) => {
    if (!node.x || !node.y) return;
    const size = node.val;
    const isSelected = selectedNode?.id === node.id;
    const isRelated = selectedNode && (
      selectedNode.imports.includes(node.id) ||
      selectedNode.importedBy.includes(node.id)
    );

    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? "#ffffff" : isRelated ? "#5E6AD2" : node.color;
    ctx.globalAlpha = isSelected || isRelated ? 1 : 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;

    if (isSelected) {
      ctx.strokeStyle = "#5E6AD2";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Label for larger nodes or selected
    if (size > 4 || isSelected || isRelated) {
      ctx.font = `${isSelected ? "bold " : ""}${Math.max(3, size * 0.8)}px sans-serif`;
      ctx.fillStyle = isSelected ? "#ffffff" : "#a3a3a3";
      ctx.textAlign = "center";
      ctx.fillText(node.name, node.x, node.y + size + 4);
    }
  }, [selectedNode]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-border-1 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-text-3 hover:text-text-0 transition-colors text-[13px]">← Back</Link>
          <div className="w-px h-4 bg-border-1" />
          <h1 className="text-[15px] font-medium text-text-0">
            <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
              {owner}/<span className="font-semibold">{repo}</span> ↗
            </a>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-text-3">
          <span>{totalFiles} files</span>
          <span>{formatBytes(totalSize)}</span>
          <span>{edges.length} dependencies</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Graph area */}
        <div className="flex-1 relative bg-bg-0">
          {/* Search + filter overlay */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="px-3 py-1.5 rounded-lg bg-bg-1/90 backdrop-blur border border-border-1 text-[12px] text-text-0 placeholder:text-text-3 focus:outline-none focus:ring-1 focus:ring-accent w-48"
            />
            <div className="flex flex-wrap gap-1">
              {extCounts.map(([ext, count]) => (
                <button
                  key={ext}
                  onClick={() => setFilterExt(filterExt === ext ? null : ext)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                    filterExt === ext
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-bg-1/90 border-border-1 text-text-3 hover:text-text-1"
                  }`}
                >
                  .{ext} ({count})
                </button>
              ))}
            </div>
          </div>

          {/* Graph */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData as any}
            nodeCanvasObject={nodeCanvasObject as any}
            nodePointerAreaPaint={((node: any, color: string, ctx: CanvasRenderingContext2D) => {
              if (!node.x || !node.y) return;
              ctx.beginPath();
              ctx.arc(node.x, node.y, (node.val || 3) + 2, 0, 2 * Math.PI);
              ctx.fillStyle = color;
              ctx.fill();
            }) as any}
            onNodeClick={handleNodeClick as any}
            linkColor={() => "rgba(94, 106, 210, 0.15)"}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            backgroundColor="transparent"
            width={dims.w < 768 ? dims.w : dims.w - 320}
            height={dims.h - 52}
            cooldownTicks={100}
            enableZoomInteraction={true}
            enablePanInteraction={true}
          />
        </div>

        {/* Sidebar — fixed on desktop, overlay on mobile */}
        {selectedNode ? (
          <div className="w-[320px] border-l border-border-1 bg-bg-1 overflow-y-auto shrink-0 max-md:fixed max-md:right-0 max-md:top-[52px] max-md:bottom-0 max-md:z-20 max-md:shadow-2xl">
            <div className="p-4">
              {/* Close button */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h2 className="text-[14px] font-semibold text-text-0 break-all">{selectedNode.name}</h2>
                  <p className="text-[11px] text-text-3 break-all mt-0.5">{selectedNode.path}</p>
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-text-3 hover:text-text-0 text-[14px] shrink-0 ml-2">✕</button>
              </div>

              {/* File stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-bg-0 rounded-lg p-2 text-center">
                  <div className="text-[14px] font-semibold text-text-0">{formatBytes(selectedNode.size)}</div>
                  <div className="text-[9px] text-text-3">Size</div>
                </div>
                <div className="bg-bg-0 rounded-lg p-2 text-center">
                  <div className="text-[14px] font-semibold text-green-400">{selectedNode.imports.length}</div>
                  <div className="text-[9px] text-text-3">Imports</div>
                </div>
                <div className="bg-bg-0 rounded-lg p-2 text-center">
                  <div className="text-[14px] font-semibold text-blue-400">{selectedNode.importedBy.length}</div>
                  <div className="text-[9px] text-text-3">Used by</div>
                </div>
              </div>

              {/* Imports */}
              {selectedNode.imports.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[11px] font-medium text-text-2 uppercase tracking-wider mb-2">Imports →</h3>
                  <div className="space-y-1">
                    {selectedNode.imports.map((imp: string) => (
                      <button
                        key={imp}
                        onClick={() => {
                          const n = nodes.find(n => n.id === imp);
                          if (n) setSelectedNode(n);
                        }}
                        className="block w-full text-left px-2 py-1 rounded text-[11px] text-text-2 hover:bg-bg-0 hover:text-accent transition-all truncate"
                      >
                        {imp.split("/").pop()}
                        <span className="text-text-3 ml-1">— {imp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Imported by */}
              {selectedNode.importedBy.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-[11px] font-medium text-text-2 uppercase tracking-wider mb-2">← Used by</h3>
                  <div className="space-y-1">
                    {selectedNode.importedBy.map((imp: string) => (
                      <button
                        key={imp}
                        onClick={() => {
                          const n = nodes.find(n => n.id === imp);
                          if (n) setSelectedNode(n);
                        }}
                        className="block w-full text-left px-2 py-1 rounded text-[11px] text-text-2 hover:bg-bg-0 hover:text-accent transition-all truncate"
                      >
                        {imp.split("/").pop()}
                        <span className="text-text-3 ml-1">— {imp}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub link */}
              <a
                href={`https://github.com/${owner}/${repo}/blob/main/${selectedNode.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[12px] text-accent hover:underline mt-4"
              >
                View on GitHub ↗
              </a>
            </div>
          </div>
        ) : (
          /* Default sidebar — overview */
          <div className="w-[320px] border-l border-border-1 bg-bg-1 overflow-y-auto shrink-0 max-md:hidden">
            <div className="p-4">
              <h2 className="text-[14px] font-semibold text-text-0 mb-4">Overview</h2>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-bg-0 rounded-lg p-3 text-center">
                  <div className="text-[18px] font-semibold text-text-0">{totalFiles}</div>
                  <div className="text-[10px] text-text-3">Files</div>
                </div>
                <div className="bg-bg-0 rounded-lg p-3 text-center">
                  <div className="text-[18px] font-semibold text-text-0">{codeFiles.length}</div>
                  <div className="text-[10px] text-text-3">Code Files</div>
                </div>
                <div className="bg-bg-0 rounded-lg p-3 text-center">
                  <div className="text-[18px] font-semibold text-accent">{edges.length}</div>
                  <div className="text-[10px] text-text-3">Dependencies</div>
                </div>
                <div className="bg-bg-0 rounded-lg p-3 text-center">
                  <div className="text-[18px] font-semibold text-text-0">{connectedFiles}</div>
                  <div className="text-[10px] text-text-3">Connected</div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-5">
                <h3 className="text-[11px] font-medium text-text-2 uppercase tracking-wider mb-3">Languages</h3>
                <LanguageBar languages={languages} />
              </div>

              {/* Hotspots */}
              <div>
                <h3 className="text-[11px] font-medium text-text-2 uppercase tracking-wider mb-3">
                  Complexity Hotspots
                </h3>
                <div className="space-y-1">
                  {hotspots.map(h => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedNode(nodes.find(n => n.id === h.id) || null)}
                      className="flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] hover:bg-bg-0 transition-all"
                    >
                      <span className="text-text-1 truncate">{h.name}</span>
                      <span className="text-text-3 shrink-0 ml-2">{h.connections} deps</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Tree */}
              <div className="mt-5">
                <h3 className="text-[11px] font-medium text-text-2 uppercase tracking-wider mb-2">File Tree</h3>
                <div className="max-h-[300px] overflow-y-auto border border-border-1 rounded-lg bg-bg-0 p-1">
                  <FileTree
                    files={nodes}
                    selectedId={selectedNode?.id as string | undefined}
                    onSelect={(f) => setSelectedNode(f)}
                  />
                </div>
              </div>

              {/* Tip */}
              <div className="mt-5 p-3 rounded-lg bg-accent/5 border border-accent/10">
                <p className="text-[11px] text-text-2 leading-relaxed">
                  <span className="font-medium text-accent">Tip:</span> Click any node in the graph to see its imports and dependents. Use the search to find specific files.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
