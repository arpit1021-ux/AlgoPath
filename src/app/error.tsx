"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--bg-primary)" }}
    >
      <div role="alert" className="max-w-md w-full text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: "var(--danger-dim)", border: "2px solid var(--danger)" }}
        >
          <span style={{ color: "var(--danger)", fontSize: "1.5rem", fontWeight: 700 }}>!</span>
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          This page didn&apos;t load
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Something broke while we were putting this page together. Your plans and progress
          are safe — this is a display problem, not a data one.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
            <Home className="w-4 h-4" aria-hidden="true" />
            Back to plans
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
            Reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
