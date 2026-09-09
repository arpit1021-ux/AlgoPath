import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,12,0.6)",
        padding: "3rem 1.5rem 2rem",
      }}
    >
      <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" rx="20" fill="url(#pf-logo-grad)" />
                <path
                  d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="pf-logo-grad" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#ffa116" />
                    <stop offset="100%" stopColor="#ff6b35" />
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  AlgoPath
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "8px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                >
                  SMART LEETCODE PREP
                </span>
              </div>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", maxWidth: 220, lineHeight: 1.6 }}>
              AI-powered interview preparation for ambitious engineers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/arpit1021-ux/AlgoPath"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--text-muted)" }}
                className="hover:opacity-80 transition-opacity"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/arpit1021-ux"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--text-muted)" }}
                className="hover:opacity-80 transition-opacity"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4
              style={{
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Product
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "New Plan", href: "/dashboard/plans/new" },
                { label: "Revisions", href: "/dashboard/revisions" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  className="hover:text-[var(--text-secondary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4
              style={{
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Legal
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/cookies" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  className="hover:text-[var(--text-secondary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            &copy; 2026 AlgoPath. All rights reserved.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
            Not affiliated with LeetCode or any company mentioned.
          </p>
        </div>
      </div>
    </footer>
  );
}
