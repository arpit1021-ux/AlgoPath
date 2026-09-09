"use client";

import { AlertTriangle, RotateCcw, WifiOff } from "lucide-react";

interface ErrorStateProps {
  /** What went wrong, in the user's terms. */
  title?: string;
  /** Why it happened and what it means for them. */
  message?: string;
  /** Retry handler. Omit to hide the button. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Renders the offline variant with its own copy. */
  offline?: boolean;
  className?: string;
}

/**
 * The single error primitive for the app. Every error says three things:
 * what happened, why, and what to do next.
 */
export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  offline = false,
  className,
}: ErrorStateProps) {
  const isOffline = offline || (typeof navigator !== "undefined" && navigator.onLine === false);

  const resolvedTitle =
    title ?? (isOffline ? "You're offline" : "We couldn't load this");
  const resolvedMessage =
    message ??
    (isOffline
      ? "Your device isn't connected right now. Reconnect and try again — nothing you've done has been lost."
      : "The request didn't reach our server. This is usually temporary.");

  return (
    <div
      role="alert"
      className={`rounded-xl p-5 flex items-start gap-3 ${className ?? ""}`}
      style={{
        background: "var(--danger-dim)",
        border: "1px solid rgba(239,68,68,0.25)",
      }}
    >
      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.15)", color: "var(--danger)" }}
      >
        {isOffline ? (
          <WifiOff className="w-4 h-4" aria-hidden="true" />
        ) : (
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--danger)" }}>
          {resolvedTitle}
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {resolvedMessage}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Full-page variant for a surface that has nothing else to show. */
export function ErrorPage(props: ErrorStateProps) {
  return (
    <div className="max-w-lg mx-auto py-16">
      <ErrorState {...props} />
    </div>
  );
}

/** Back-compat with the original one-line component. */
export function ErrorMessage({ message }: { message: string }) {
  return <ErrorState message={message} title="Something went wrong" />;
}
