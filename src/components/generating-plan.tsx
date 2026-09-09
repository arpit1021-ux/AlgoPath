"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

interface GeneratingPlanProps {
  planId: string;
}

export function GeneratingPlan({ planId }: GeneratingPlanProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [failMessage, setFailMessage] = useState<string | null>(null);
  // Step 0 ("Plan saved") is already done by the time this mounts — the wizard
  // did it. Start at 1 so the user sees a continuation, not a restart.
  const [step, setStep] = useState(1);

  const triggerGeneration = useCallback(async () => {
    try {
      const res = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
      });

      // 409 means the plan finished generating already — that is success, not
      // failure. Treating it as failure was what left retries stuck.
      if (res.status === 409) {
        router.refresh();
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setFailMessage(
          typeof body.message === "string" ? body.message : null
        );
        setStep(1);
        setFailed(true);
        return;
      }

      // Step through loading messages
      // Advance through the remaining build steps while we poll.
      const stepTimer = setInterval(() => {
        setStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 6000);

      // Poll lightweight status endpoint every 3 seconds
      let pollCount = 0;
      const pollInterval = setInterval(async () => {
        pollCount++;
        try {
          const planRes = await fetch(`/api/plans/${planId}/status`);
          const data = await planRes.json();
          if (data.status === "ACTIVE") {
            clearInterval(pollInterval);
            clearInterval(stepTimer);
            router.refresh();
          } else if (data.status === "FAILED") {
            clearInterval(pollInterval);
            clearInterval(stepTimer);
            setFailed(true);
          }
        } catch {
          // keep polling
        }

        // Stop after 5 minutes
        if (pollCount > 100) {
          clearInterval(pollInterval);
          clearInterval(stepTimer);
          setFailed(true);
        }
      }, 3000);
    } catch {
      setFailed(true);
    }
  }, [planId, router]);

  // StrictMode runs effects twice in dev. Without this guard both runs POST
  // /generate at the same time and the two roadmap builds collide.
  const hasTriggered = useRef(false);
  useEffect(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    triggerGeneration();
  }, [triggerGeneration]);

  if (failed) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center min-h-[400px] text-center px-6"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "var(--danger-dim)",
            border: "2px solid var(--danger)",
          }}
        >
          <span style={{ color: "var(--danger)", fontSize: "1.5rem", fontWeight: 700 }}>!</span>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Roadmap generation failed
        </h3>
        <p className="text-sm mb-4 max-w-sm" style={{ color: "var(--text-muted)" }}>
          {failMessage ??
            "We couldn't build your roadmap. Your plan and its settings are saved — retrying usually works."}
        </p>
        <button
          onClick={() => { setFailMessage(null); setFailed(false); hasTriggered.current = true; triggerGeneration(); }}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          style={{ background: "var(--accent)" }}
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  /*
   * Continues the wizard's narrative rather than restarting it. Saving the plan
   * and building the roadmap are two server phases; showing "Building your
   * roadmap" for both made it look like the app had started over. Step 1 is
   * already complete when this mounts, so the user sees one process advancing.
   */
  const buildSteps = [
    { label: "Plan saved", detail: "Your settings are stored" },
    { label: "Matching problems to your companies", detail: "Ranking by interview frequency" },
    { label: "Sequencing your curriculum", detail: "Ordering patterns so each builds on the last" },
    { label: "Scheduling your weeks", detail: "Balancing difficulty across your timeline" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Building your roadmap
          </h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This usually takes 15&ndash;30 seconds. You can leave this page &mdash;
            it keeps building.
          </p>
        </div>

        <div
          className="rounded-full overflow-hidden mb-6 relative"
          style={{ height: "4px", background: "var(--border)" }}
          role="progressbar"
          aria-label="Building your roadmap"
        >
          <div
            className="absolute inset-y-0 rounded-full indeterminate-bar"
            style={{ width: "35%", background: "var(--accent)" }}
          />
        </div>

        <div className="space-y-3" role="status" aria-live="polite">
          {buildSteps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={s.label}
                className="flex items-start gap-3 transition-opacity duration-300"
                style={{ opacity: i > step ? 0.35 : 1 }}
              >
                <div
                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: done
                      ? "var(--success)"
                      : active
                        ? "var(--accent)"
                        : "var(--border)",
                  }}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-muted)" }} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium"
                     style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}>
                    {s.label}
                  </p>
                  {active && (
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {s.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
