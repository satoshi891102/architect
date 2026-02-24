export type RepoFile = {
  path: string;
  type: "blob" | "tree";
  size: number;
  sha: string;
};

export type RepoAnalysis = {
  owner: string;
  repo: string;
  files: RepoFile[];
  languages: Record<string, number>;
  tree: RepoFile[];
};

export type FileNode = {
  id: string;
  path: string;
  name: string;
  ext: string;
  size: number;
  imports: string[];
  importedBy: string[];
  directory: string;
  color: string;
};

export type FileEdge = {
  source: string;
  target: string;
};

const EXT_COLORS: Record<string, string> = {
  tsx: "#61dafb",
  ts: "#3178c6",
  jsx: "#f7df1e",
  js: "#f0db4f",
  css: "#264de4",
  json: "#a3a3a3",
  md: "#ffffff",
  html: "#e34c26",
  py: "#3572A5",
  go: "#00ADD8",
  rs: "#dea584",
  default: "#6b7280",
};

export function getExtColor(ext: string): string {
  return EXT_COLORS[ext] || EXT_COLORS.default;
}

export async function fetchRepoTree(owner: string, repo: string, token?: string): Promise<RepoFile[]> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
    { headers, next: { revalidate: 300 } }
  );

  if (!res.ok) {
    // Try 'master' branch
    const res2 = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
      { headers, next: { revalidate: 300 } }
    );
    if (!res2.ok) throw new Error(`GitHub API error: ${res2.status}`);
    const data2 = await res2.json();
    return data2.tree || [];
  }

  const data = await res.json();
  return data.tree || [];
}

export async function fetchFileContent(owner: string, repo: string, path: string, token?: string): Promise<string> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers, next: { revalidate: 300 } }
  );

  if (!res.ok) return "";
  const data = await res.json();
  if (data.encoding === "base64" && data.content) {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }
  return "";
}

export async function fetchLanguages(owner: string, repo: string, token?: string): Promise<Record<string, number>> {
  const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    { headers, next: { revalidate: 300 } }
  );

  if (!res.ok) return {};
  return res.json();
}

export function parseImports(content: string, filePath: string): string[] {
  const imports: string[] = [];
  const dir = filePath.split("/").slice(0, -1).join("/");

  // Match: import ... from "..." or import ... from '...'
  const importRegex = /import\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  // Match: require("...") or require('...')
  const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  // Match: import "..." or import '...'
  const sideEffectRegex = /import\s+['"]([^'"]+)['"]/g;
  // Match: @import "..." or @import url("...")
  const cssImportRegex = /@import\s+(?:url\()?['"]([^'"]+)['"]\)?/g;

  // Python: from X import Y  or  import X
  const pyFromRegex = /from\s+(\.+\w*(?:\.\w+)*)\s+import/g;
  const pyImportRegex = /^import\s+(\w+(?:\.\w+)*)/gm;

  let match;

  // Language-specific handling
  const ext = filePath.split(".").pop() || "";

  // Go: import "path" or import ( "path" )
  if (ext === "go") {
    const goImportRegex = /import\s+(?:\(\s*)?"([^"]+)"/g;
    const goBlockRegex = /import\s*\(([^)]+)\)/g;
    // Single imports
    goImportRegex.lastIndex = 0;
    while ((match = goImportRegex.exec(content)) !== null) {
      const pkg = match[1];
      // Only resolve project-local imports (contain the repo path or start with ./)
      if (pkg.includes("/") && !pkg.includes(".com/") && !pkg.includes(".org/") && !pkg.includes(".io/")) {
        imports.push(pkg);
      }
    }
    // Block imports
    goBlockRegex.lastIndex = 0;
    while ((match = goBlockRegex.exec(content)) !== null) {
      const block = match[1];
      const lineRegex = /"([^"]+)"/g;
      let lineMatch;
      while ((lineMatch = lineRegex.exec(block)) !== null) {
        const pkg = lineMatch[1];
        if (pkg.includes("/") && !pkg.includes(".com/") && !pkg.includes(".org/") && !pkg.includes(".io/")) {
          imports.push(pkg);
        }
      }
    }
  }

  if (ext === "py") {
    pyFromRegex.lastIndex = 0;
    while ((match = pyFromRegex.exec(content)) !== null) {
      const specifier = match[1];
      if (specifier.startsWith(".")) {
        // Relative python import: from .foo import bar → ./foo
        const dots = specifier.match(/^\.+/)?.[0].length || 1;
        const module = specifier.slice(dots);
        const parts = dir.split("/");
        for (let i = 1; i < dots; i++) parts.pop();
        if (module) parts.push(...module.split("."));
        const resolved = parts.join("/");
        imports.push(resolved);
      }
    }
  }

  for (const regex of [importRegex, requireRegex, sideEffectRegex, cssImportRegex]) {
    regex.lastIndex = 0;
    while ((match = regex.exec(content)) !== null) {
      const specifier = match[1];
      // Only resolve relative imports
      if (specifier.startsWith(".") || specifier.startsWith("@/")) {
        let resolved: string;
        if (specifier.startsWith("@/")) {
          resolved = "src/" + specifier.slice(2);
        } else {
          // Resolve relative path
          const parts = dir.split("/");
          const specParts = specifier.split("/");
          for (const sp of specParts) {
            if (sp === "..") parts.pop();
            else if (sp !== ".") parts.push(sp);
          }
          resolved = parts.join("/");
        }
        // Try common extensions
        imports.push(resolved);
      }
    }
  }
  return imports;
}

export function resolveImportPath(importPath: string, allPaths: string[]): string | null {
  // Direct match
  if (allPaths.includes(importPath)) return importPath;
  // Try extensions
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".css", ".py"]) {
    if (allPaths.includes(importPath + ext)) return importPath + ext;
  }
  // Try /index or /__init__
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    if (allPaths.includes(importPath + "/index" + ext)) return importPath + "/index" + ext;
  }
  // Python __init__.py
  if (allPaths.includes(importPath + "/__init__.py")) return importPath + "/__init__.py";
  return null;
}

export async function analyzeRepo(owner: string, repo: string, token?: string): Promise<{
  nodes: FileNode[];
  edges: FileEdge[];
  languages: Record<string, number>;
  totalFiles: number;
  totalSize: number;
  cycles: string[][];
}> {
  const [tree, languages] = await Promise.all([
    fetchRepoTree(owner, repo, token),
    fetchLanguages(owner, repo, token),
  ]);

  const blobs = tree.filter(f => f.type === "blob");
  const allPaths = blobs.map(f => f.path);
  const codeExts = ["ts", "tsx", "js", "jsx", "py", "go", "rs", "css", "scss", "vue", "svelte"];

  // Build nodes
  const nodes: FileNode[] = blobs.map(f => {
    const parts = f.path.split("/");
    const name = parts[parts.length - 1];
    const ext = name.includes(".") ? name.split(".").pop()! : "";
    return {
      id: f.path,
      path: f.path,
      name,
      ext,
      size: f.size,
      imports: [],
      importedBy: [],
      directory: parts.slice(0, -1).join("/"),
      color: getExtColor(ext),
    };
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Parse imports for code files (limit to avoid API rate limits)
  const codeFiles = blobs.filter(f => {
    const ext = f.path.split(".").pop() || "";
    return codeExts.includes(ext);
  }).slice(0, 150); // Increased limit for better coverage

  const edges: FileEdge[] = [];
  const edgeSet = new Set<string>();

  // Fetch content and parse imports in batches
  const BATCH_SIZE = 15;
  for (let i = 0; i < codeFiles.length; i += BATCH_SIZE) {
    const batch = codeFiles.slice(i, i + BATCH_SIZE);
    const contents = await Promise.all(
      batch.map(f => fetchFileContent(owner, repo, f.path, token))
    );

    for (let j = 0; j < batch.length; j++) {
      const file = batch[j];
      const content = contents[j];
      if (!content) continue;

      const rawImports = parseImports(content, file.path);
      for (const rawImport of rawImports) {
        const resolved = resolveImportPath(rawImport, allPaths);
        if (resolved && resolved !== file.path) {
          const node = nodeMap.get(file.path);
          const targetNode = nodeMap.get(resolved);
          if (node && targetNode) {
            node.imports.push(resolved);
            targetNode.importedBy.push(file.path);
            const edgeKey = `${file.path}->${resolved}`;
            if (!edgeSet.has(edgeKey)) {
              edgeSet.add(edgeKey);
              edges.push({ source: file.path, target: resolved });
            }
          }
        }
      }
    }
  }

  // Detect circular dependencies
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const stack: string[] = [];

  function dfs(nodeId: string) {
    if (cycles.length >= 10) return; // Cap at 10 cycles
    visited.add(nodeId);
    inStack.add(nodeId);
    stack.push(nodeId);

    const node = nodeMap.get(nodeId);
    if (node) {
      for (const imp of node.imports) {
        if (!visited.has(imp)) {
          dfs(imp);
        } else if (inStack.has(imp)) {
          // Found a cycle
          const cycleStart = stack.indexOf(imp);
          if (cycleStart >= 0) {
            cycles.push([...stack.slice(cycleStart), imp]);
          }
        }
      }
    }

    stack.pop();
    inStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id) && node.imports.length > 0) {
      dfs(node.id);
    }
  }

  return {
    nodes,
    edges,
    languages,
    totalFiles: blobs.length,
    totalSize: blobs.reduce((s, f) => s + f.size, 0),
    cycles,
  };
}
