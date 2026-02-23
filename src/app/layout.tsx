import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Architect — See any codebase as a living map",
  description: "Paste a GitHub URL, instantly visualize architecture, dependencies, and complexity hotspots.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg-0 text-text-0 antialiased">{children}</body>
    </html>
  );
}
