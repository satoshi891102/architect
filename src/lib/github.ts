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

  let match;
  for (const regex of [importRegex, requireRegex, sideEffectRegex]) {
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
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".css"]) {
    if (allPaths.includes(importPath + ext)) return importPath + ext;
  }
  // Try /index
  for (const ext of [".ts", ".tsx", ".js", ".jsx"]) {
    if (allPaths.includes(importPath + "/index" + ext)) return importPath + "/index" + ext;
  }
  return null;
}

export async function analyzeRepo(owner: string, repo: string, token?: string): Promise<{
  nodes: FileNode[];
  edges: FileEdge[];
  languages: Record<string, number>;
  totalFiles: number;
  totalSize: number;
}> {
  const [tree, languages] = await Promise.all([
    fetchRepoTree(owner, repo, token),
    fetchLanguages(owner, repo, token),
  ]);

  const blobs = tree.filter(f => f.type === "blob");
  const allPaths = blobs.map(f => f.path);
  const codeExts = ["ts", "tsx", "js", "jsx", "py", "go", "rs"];

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
  }).slice(0, 80); // Limit API calls

  const edges: FileEdge[] = [];
  const edgeSet = new Set<string>();

  // Fetch content and parse imports in batches
  const BATCH_SIZE = 10;
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

  return {
    nodes,
    edges,
    languages,
    totalFiles: blobs.length,
    totalSize: blobs.reduce((s, f) => s + f.size, 0),
  };
}
