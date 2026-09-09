"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-message";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto py-12">
      <ErrorState
        title="We couldn't load this page"
        message="The request to our database didn't come back. Your plans and progress are safe — this is a loading problem. Try again, or use the sidebar to go somewhere else."
        onRetry={reset}
      />
    </div>
  );
}
