import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-[48px] font-bold text-text-0 mb-2">404</h1>
        <p className="text-[13px] text-text-2 mb-6">This page doesn&apos;t exist.</p>
        <Link href="/" className="text-accent text-[13px] hover:underline">← Back to Architect</Link>
      </div>
    </div>
  );
}
