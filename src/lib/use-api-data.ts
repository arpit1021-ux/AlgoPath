"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

interface State<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/**
 * Fetch JSON with the four states the UI actually needs: loading, data,
 * a typed error, and a retry that re-runs the request.
 *
 * Replaces the `.catch(console.error)` pattern, which left `data` at its
 * initial value and made every failure render as an empty state.
 */
export function useApiData<T>(url: string | null, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const reqId = useRef(0);

  const load = useCallback(async () => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const id = ++reqId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(url);
      if (!res.ok) {
        if (id === reqId.current) {
          setState({ data: null, loading: false, error: classify(res.status) });
        }
        return;
      }
      const json = (await res.json()) as T;
      if (id === reqId.current) {
        setState({ data: json, loading: false, error: null });
      }
    } catch {
      if (id === reqId.current) {
        setState({ data: null, loading: false, error: classify(null) });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    load();
    return () => {
      // invalidate any in-flight response for this mount
      reqId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setState((prev) => ({ ...prev, data: updater(prev.data) }));
  }, []);

  return { ...state, retry: load, setData };
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
