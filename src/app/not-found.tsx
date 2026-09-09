import Link from "next/link";
import { Home, Compass } from "lucide-react";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-md w-full text-center">
        <p
          className="text-6xl font-bold mb-3"
          style={{
            color: "var(--accent)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          404
        </p>
        <h1
          className="text-2xl font-bold mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          We can&apos;t find that page
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          The link may be out of date, or the plan it pointed to was deleted. Everything else
          is where you left it.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to plans
          </Link>
          <Link href="/" className="btn-secondary inline-flex items-center gap-2">
            <Compass className="w-4 h-4" aria-hidden="true" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
