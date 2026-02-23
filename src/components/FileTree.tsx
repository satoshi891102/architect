"use client";

import { useState } from "react";
import type { FileNode } from "@/lib/github";

type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
  file?: FileNode;
  isDir: boolean;
};

function buildTree(files: FileNode[]): TreeNode {
  const root: TreeNode = { name: "/", path: "", children: [], isDir: true };

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      let child = current.children.find(c => c.name === part);
      if (!child) {
        child = {
          name: part,
          path: parts.slice(0, i + 1).join("/"),
          children: [],
          isDir: !isLast,
          file: isLast ? file : undefined,
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  // Sort: directories first, then alphabetical
  const sortTree = (node: TreeNode) => {
    node.children.sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortTree);
  };
  sortTree(root);

  return root;
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedId?: string;
  onSelect: (file: FileNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isSelected = node.file && node.file.id === selectedId;

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 w-full text-left py-0.5 hover:bg-bg-0 rounded px-1 transition-colors"
          style={{ paddingLeft: `${depth * 12 + 4}px` }}
        >
          <span className="text-text-3 text-[10px] w-3 shrink-0">{expanded ? "▾" : "▸"}</span>
          <span className="text-[11px] text-text-2">{node.name}/</span>
        </button>
        {expanded && node.children.map(child => (
          <TreeItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelect(node.file)}
      className={`flex items-center gap-1 w-full text-left py-0.5 rounded px-1 transition-colors ${
        isSelected ? "bg-accent/10 text-accent" : "hover:bg-bg-0 text-text-3"
      }`}
      style={{ paddingLeft: `${depth * 12 + 4}px` }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: node.file?.color || "#6b7280" }}
      />
      <span className="text-[11px] truncate">{node.name}</span>
    </button>
  );
}

export default function FileTree({
  files,
  selectedId,
  onSelect,
}: {
  files: FileNode[];
  selectedId?: string;
  onSelect: (file: FileNode) => void;
}) {
  const tree = buildTree(files);

  return (
    <div className="py-1">
      {tree.children.map(child => (
        <TreeItem
          key={child.path}
          node={child}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
