"use client";

import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md" style={{ borderColor: "#2e3040" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: "#f1f2f4" }}>
          Logo
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {["Features", "Pricing", "Docs", "Blog"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ fontFamily: 'var(--font-body)', color: "#b4b5c0" }}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
            style={{ fontFamily: 'var(--font-body)', color: "#f1f2f4" }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ fontFamily: 'var(--font-body)', backgroundColor: "#5E6AD2", borderRadius: "var(--radius-lg)" }}
          >
            Get Started
          </Link>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t px-6 py-4 md:hidden" style={{ borderColor: "#2e3040" }}>
          {["Features", "Pricing", "Docs", "Blog"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="block py-2 text-sm font-medium"
              style={{ color: "#b4b5c0" }}
            >
              {item}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium" style={{ color: "#f1f2f4" }}>Log in</Link>
            <Link
              href="/signup"
              className="rounded-lg px-4 py-2 text-center text-sm font-medium text-white"
              style={{ backgroundColor: "#5E6AD2" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
