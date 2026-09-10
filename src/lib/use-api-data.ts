"use client";

import { useCallback, useEffect, useState } from "react";

export type ApiErrorKind = "offline" | "unauthorized" | "notFound" | "server" | "network";

export interface ApiError {
  kind: ApiErrorKind;
  title: string;
  message: string;
}

function classify(status: number | null): ApiError {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return {
      kind: "offline",
      title: "You're offline",
      message:
        "Your device isn't connected right now. Reconnect and try again — nothing you've done has been lost.",
    };
  }
  if (status === 401 || status === 403) {
    return {
      kind: "unauthorized",
      title: "Your session expired",
      message: "Sign in again to pick up where you left off.",
    };
  }
  if (status === 404) {
    return {
      kind: "notFound",
      title: "We couldn't find this",
      message: "It may have been deleted, or the link is out of date.",
    };
  }
  if (status !== null) {
    return {
      kind: "server",
      title: "Our server had a problem",
      message: `The request came back with an error (${status}). This is usually temporary — try again in a moment.`,
    };
  }
  return {
    kind: "network",
    title: "We couldn't reach the server",
    message:
      "The request didn't get through. Check your connection and try again — your data is safe.",
  };
}

/** What a finished request left behind, tagged with the request it answered. */
interface Settled<T> {
  key: string | null;
  data: T | null;
  error: ApiError | null;
}

/**
 * Fetch JSON with the four states the UI actually needs: loading, data,
 * a typed error, and a retry that re-runs the request.
 *
 * Replaces the `.catch(console.error)` pattern, which left `data` at its
 * initial value and made every failure render as an empty state.
 *
 * `loading` is derived, not stored: a request is in flight exactly when the
 * last settled result does not belong to the current request key. That keeps
 * the effect free of synchronous setState (no cascading render on mount) and
 * makes a stale response impossible to display — it carries the wrong key.
 */
export function useApiData<T>(url: string | null, deps: unknown[] = []) {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T>>({
    key: null,
    data: null,
    error: null,
  });

  // Identity of the request the caller is currently asking for. Bumping
  // `attempt` mints a new one, which is what makes retry re-fetch.
  const key = url === null ? null : `${url} ${JSON.stringify(deps)} ${attempt}`;

  useEffect(() => {
    if (url === null || key === null) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(url);
        if (cancelled) return;
        if (!res.ok) {
          setSettled({ key, data: null, error: classify(res.status) });
          return;
        }
        const json = (await res.json()) as T;
        if (!cancelled) setSettled({ key, data: json, error: null });
      } catch {
        if (!cancelled) setSettled({ key, data: null, error: classify(null) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, key]);

  const fresh = settled.key === key;
  const loading = key !== null && !fresh;

  const retry = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setSettled((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  return {
    data: fresh ? settled.data : null,
    loading,
    error: fresh ? settled.error : null,
    retry,
    setData,
  };
}

/**
 * POST/PATCH/DELETE helper that treats a non-2xx response as a failure.
 * The bug this exists to prevent: `await fetch(...)` resolves normally on a
 * 500, so an optimistic update is never rolled back.
 */
export async function mutate(
  url: string,
  init: RequestInit = {}
): Promise<{ ok: true; data: unknown } | { ok: false; error: ApiError; status: number | null }> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = classify(res.status);
      // Routes may supply their own user-facing copy; never their raw internals.
      const supplied = (body as { message?: string }).message;
      return {
        ok: false,
        status: res.status,
        error: supplied ? { ...err, message: supplied } : err,
      };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch {
    return { ok: false, status: null, error: classify(null) };
  }
}
