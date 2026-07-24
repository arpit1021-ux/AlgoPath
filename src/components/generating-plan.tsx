"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

interface GeneratingPlanProps {
  planId: string;
}

export function GeneratingPlan({ planId }: GeneratingPlanProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const [step, setStep] = useState(0);

  const steps = [
    "Analyzing your preferences",
    "Filtering problem database",
    "Building your personalized roadmap",
    "Almost ready...",
  ];

  const triggerGeneration = useCallback(async () => {
    try {
      const res = await fetch(`/api/plans/${planId}/generate`, {
        method: "POST",
      });

      if (!res.ok) {
        setFailed(true);
        return;
      }

      // Step through loading messages
      const stepTimer = setInterval(() => {
        setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 8000);

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

  useEffect(() => {
    triggerGeneration();
  }, [triggerGeneration]);

  if (failed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
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
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Something went wrong while building your roadmap. Your plan has been saved — try regenerating it.
        </p>
        <button
          onClick={() => { setFailed(false); triggerGeneration(); }}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          style={{ background: "var(--accent)" }}
        >
          <RotateCcw className="w-4 h-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
      <div className="relative w-16 h-16 mb-6">
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{
            borderColor: "var(--accent-dim)",
            borderTopColor: "var(--accent)",
          }}
        />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        Building your roadmap
      </h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
        {steps[step]}...
      </p>

      <div className="w-full max-w-lg mt-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl animate-pulse"
            style={{
              background: "var(--border)",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
