"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a1a",
          color: "#e2e8f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div role="alert" style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", margin: "0 0 8px" }}>AlgoPath ran into a problem</h1>
          <p style={{ fontSize: "0.9rem", color: "#94a3b8", margin: "0 0 24px", lineHeight: 1.6 }}>
            The app failed to start up. Reloading usually fixes it. If it keeps happening, try
            again in a few minutes — your data is unaffected.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#ffa116",
              color: "#1a1a1a",
              border: 0,
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload AlgoPath
          </button>
          {error.digest && (
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 24 }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
