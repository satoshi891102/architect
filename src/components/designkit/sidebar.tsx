"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface SidebarItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  header?: ReactNode;
}

export function Sidebar({ items, header }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-screen w-64 flex-col border-r"
      style={{
        backgroundColor: "#141414",
        borderColor: "#2e3040",
      }}
    >
      {header && (
        <div className="flex h-16 items-center border-b px-5" style={{ borderColor: "#2e3040" }}>
          {header}
        </div>
      )}

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={{
                fontFamily: "var(--font-body)",
                backgroundColor: active ? "#f0f1fe" : "transparent",
                color: active ? "#5E6AD2" : "#b4b5c0",
              }}
            >
              {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4" style={{ borderColor: "#2e3040" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full" style={{ backgroundColor: "#e0e2fd" }} />
          <div>
            <p className="text-sm font-medium" style={{ color: "#f1f2f4", fontFamily: "var(--font-body)" }}>User Name</p>
            <p className="text-xs" style={{ color: "#6b6f76", fontFamily: "var(--font-body)" }}>user@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
