"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

function InfinityMark({ className = "w-11 h-11" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <rect width="100" height="100" rx="22" fill="url(#auth-mark)" />
      <path
        d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
        stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <defs>
        <linearGradient id="auth-mark" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#ffa116" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Branded frame around Clerk's widget, and the fix for sign-ins that appeared
 * to do nothing.
 *
 * Clerk sets the session on the client, but /dashboard is a server component:
 * Next can serve it from the router cache with the signed-out payload, so the
 * user stays on the login screen until something forces a re-fetch — which is
 * why clicking "Sign in" a second time "worked". Watching isSignedIn and
 * pairing replace() with refresh() invalidates that cache, so the redirect
 * lands the first time.
 */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  // Derived, not stored: the veil is showing exactly while a session that
  // Clerk has confirmed waits for the redirect to land. Holding this in state
  // would mean a setState inside the effect and an extra render on every
  // sign-in for a value the render already knows.
  const leaving = isLoaded && isSignedIn === true;

  useEffect(() => {
    if (!leaving) return;
    // refresh() drops the cached signed-out RSC payload; replace() keeps the
    // login page out of history so Back doesn't return to it.
    router.refresh();
    const t = setTimeout(() => router.replace("/dashboard"), 260);
    return () => clearTimeout(t);
  }, [leaving, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Ambient wash — purely decorative, sits behind everything. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute w-[520px] h-[520px] rounded-full opacity-50 auth-drift"
          style={{
            background: "radial-gradient(circle, rgba(255,161,22,0.07) 0%, transparent 70%)",
            top: "-15%", left: "50%", transform: "translateX(-50%)",
          }}
        />
      </div>

      <div className={`relative w-full max-w-[400px] ${leaving ? "auth-exit" : "auth-enter"}`}>
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-5 auth-mark-in" aria-label="AlgoPath home">
            <InfinityMark />
          </Link>
          <h1
            className="text-[1.6rem] font-bold leading-tight"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {title}
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            {subtitle}
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-7"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {children}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-[var(--accent-text)]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--accent-text)]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Announced, not just drawn, so it isn't a silent transition. */}
      {leaving && (
        <div
          className="absolute inset-0 flex items-center justify-center auth-veil"
          style={{ background: "var(--bg-primary)" }}
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4">
            <InfinityMark className="w-12 h-12 auth-mark-pulse" />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Signing you in&hellip;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
