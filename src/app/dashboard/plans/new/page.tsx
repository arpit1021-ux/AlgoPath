"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { COMPANIES, TOPICS, RECOMMENDED_TOPICS, DIFFICULTY_LABELS } from "@/lib/types";
import type {
  ExperienceLevel,
  DifficultyPreference,
} from "@/lib/types";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  Brain,
  Clock,
  Calendar,
  Building2,
  BookOpen,
  Gauge,
  Sparkles,
  Plus,
} from "lucide-react";

const AnimatedStep = dynamic(
  () => import("@/components/wizard/animated-step").then((m) => m.AnimatedStep),
  { ssr: false }
);

/* ─── STATE 1: Loading with step-by-step progress ─── */

function LoadingExperience({ difficulty }: { difficulty: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      label: "Checking your settings",
      detail: "Experience level, timeline, hours and target companies",
      duration: 1200,
    },
    {
      label: "Creating your plan",
      detail: "Saving your preferences so the roadmap can be built from them",
      duration: 2000,
    },
    {
      label: "Handing off to the roadmap builder",
      detail:
        difficulty === "VERY_HARD" || difficulty === "HARD"
          ? "You chose a hard mix — we'll weight the schedule towards it"
          : difficulty === "VERY_EASY" || difficulty === "EASY"
            ? "We'll start you on approachable problems and build up"
            : "We'll balance difficulty across your timeline",
      duration: 2000,
    },
  ];

  useEffect(() => {
    const advanceStep = (stepIndex: number) => {
      if (stepIndex >= steps.length - 1) return;
      stepTimerRef.current = setTimeout(() => {
        setCurrentStep(stepIndex + 1);
        advanceStep(stepIndex + 1);
      }, steps[stepIndex].duration);
    };

    advanceStep(0);

    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
      clearInterval(elapsedTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No percentage: nothing here measures real progress, and a bar that stalls
  // at 95% reads as broken. The checked-off step list carries the information
  // honestly; an indeterminate bar carries the motion.

  return (
    <div className="max-w-lg w-full mx-4">
      <div className="text-center mb-8">
        <h2
          className="text-xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Saving your plan
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
          Then we&apos;ll build your roadmap on the next screen
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
          style={{
            width: "35%",
            background: "linear-gradient(90deg, #86868b, #a1a1a6)",
          }}
        />
      </div>

      <div className="space-y-3 mb-6">
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isActive = i === currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={i}
              className="flex items-start gap-3 transition-all duration-300"
              style={{ opacity: isPending ? 0.35 : 1 }}
            >
              <div
                className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                style={{
                  background: isDone
                    ? "var(--success)"
                    : isActive
                      ? "var(--accent)"
                      : "var(--border)",
                  transition: "background 0.3s ease",
                }}
              >
                {isDone ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--text-muted)" }}
                  />
                )}
              </div>

              <div>
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isDone
                      ? "var(--text-muted)"
                      : isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                  }}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {elapsed > 15 && (
        <div
          className="rounded-xl px-4 py-3 text-center"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--accent-text)" }}>
            Taking longer than usual — complex roadmaps take up to 30 seconds.
            Please don&apos;t close this tab.
          </p>
        </div>
      )}

      <p
        className="text-center text-xs mt-4"
        style={{ color: "var(--text-muted)" }}
      >
        {elapsed}s
      </p>
    </div>
  );
}

/* ─── Wizard step definitions ─── */

const steps = [
  { id: 1, title: "Experience", icon: Brain },
  { id: 2, title: "Timeline", icon: Calendar },
  { id: 3, title: "Hours/Week", icon: Clock },
  { id: 4, title: "Companies", icon: Building2 },
  { id: 5, title: "Topics", icon: BookOpen },
  { id: 6, title: "Difficulty", icon: Gauge },
];

/* ─── Main component ─── */

export default function NewPlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  // Under ~1s an overlay just flickers and makes the action feel slower, so it
  // is held back for 400ms — by CSS (`.overlay-delayed`), not a timer. Tying
  // it to `submitting` alone means every exit path takes it down: success,
  // each error branch, the network catch, with no cleanup of its own.
  const [error, setError] = useState<string | null>(null);
  const [planCreated, setPlanCreated] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [planName, setPlanName] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("INTERMEDIATE");
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [topicMode, setTopicMode] = useState<"ALL" | "RECOMMENDED" | "CUSTOM">(
    "ALL"
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    ...TOPICS,
  ]);
  const [difficultyPreference, setDifficultyPreference] =
    useState<DifficultyPreference>("MEDIUM");

  /* ─── Company helpers ─── */

  const filteredCompanies = COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(companySearch.toLowerCase())
  ).filter((c) => !selectedCompanies.includes(c.id));

  const isCustomCompany =
    companySearch.trim().length > 0 &&
    !COMPANIES.some(
      (c) => c.name.toLowerCase() === companySearch.trim().toLowerCase()
    );

  const addCustomCompany = () => {
    const name = companySearch.trim();
    if (!name) return;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!selectedCompanies.includes(slug)) {
      setSelectedCompanies((prev) => [...prev, slug]);
    }
    setCompanySearch("");
    setShowCompanyDropdown(false);
  };

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
    setCompanySearch("");
    setStepError(null);
  };

  const getCompanyName = (slug: string) => {
    const found = COMPANIES.find((c) => c.id === slug);
    if (found) return found.name;
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
    setStepError(null);
  };

  /* ─── STATE 4: Step validation ─── */

  const getStepError = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!planName.trim())
          return "Please enter a name for your plan.";
        return null;
      case 2:
        if (!timelineWeeks || timelineWeeks < 1)
          return "Please set a study duration.";
        return null;
      case 3:
        if (!weeklyHours || weeklyHours < 1)
          return "Please set your weekly study hours.";
        return null;
      case 4:
        return null;
      case 5:
        return null;
      case 6:
        if (!difficultyPreference)
          return "Please select a difficulty preference.";
        return null;
      default:
        return null;
    }
  };

  /* ─── STATE 3: Error handling ─── */

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName.trim() || "My Interview Plan",
          description: "",
          experienceLevel,
          timelineWeeks,
          weeklyHours,
          targetCompanies: selectedCompanies,
          topicMode,
          selectedTopics:
            topicMode === "ALL"
              ? [...TOPICS]
              : topicMode === "RECOMMENDED"
                ? [...RECOMMENDED_TOPICS]
                : selectedTopics,
          difficultyPreference,
        }),
      });

      if (res.status === 429) {
        setError(
          "You've created too many plans today. You can create up to 10 plans per day. Try again tomorrow."
        );
        setSubmitting(false);
        return;
      }

      if (res.status === 400) {
        const data = await res.json();
        setError(
          `Some information is missing or invalid: ${data.details ? Object.values(data.details.fieldErrors ?? {}).flat().join(", ") : "Please check your inputs and try again."}`
        );
        setSubmitting(false);
        return;
      }

      if (res.status === 503) {
        setError(
          "Our problem database is being set up. This usually takes a minute. Please try again in 60 seconds."
        );
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setError(
          "We couldn't create your plan right now. This is usually a temporary problem on our side — please try again in a moment."
        );
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      setSubmitting(false);
      setPlanCreated(true);
      // Short enough to register, short enough not to feel like a second wait.
      setTimeout(() => router.push(`/dashboard/plans/${data.plan.id}`), 450);
    } catch {
      setError(
        "Connection failed. Please check your internet connection and try again."
      );
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 4:
        return selectedCompanies.length > 0;
      case 5:
        return topicMode === "ALL" || selectedTopics.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const err = getStepError(currentStep);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setCurrentStep((s) => Math.min(6, s + 1));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Create New Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Set up your personalized interview preparation roadmap.
        </p>
      </div>

      {/* Persistent error banner */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: "var(--danger-dim)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          <div
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
            style={{ background: "var(--danger)" }}
          >
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium mb-0.5"
              style={{ color: "var(--danger)" }}
            >
              Plan creation failed
            </p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {error}
            </p>
          </div>
          <button
            onClick={() => setError(null)}
            className="shrink-0 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step indicator */}
      <div
        className={cn(
          "flex flex-col gap-2",
          submitting && "pointer-events-none select-none"
        )}
      >
        <p
          className="text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          Step {currentStep} of {steps.length}
        </p>
        <div
          className="flex items-center justify-between w-full overflow-x-auto gap-1 px-2 py-3 rounded-2xl"
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border)",
          }}
        >
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background:
                    currentStep === step.id
                      ? "var(--accent)"
                      : currentStep > step.id
                        ? "var(--bg-input-hover)"
                        : "transparent",
                  color:
                    currentStep === step.id
                      ? "#1a1a1a"
                      : currentStep > step.id
                        ? "var(--text-secondary)"
                        : "var(--text-muted)",
                }}
              >
                {currentStep > step.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <step.icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden md:inline">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="flex-1 h-px min-w-[12px] max-w-[40px] mx-1"
                  style={{ background: "var(--border)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard steps */}
      <div
        className={cn(
          "space-y-8",
          submitting && "pointer-events-none select-none opacity-60"
        )}
      >
        <AnimatedStep stepKey={currentStep}>
          {/* Step 1: Experience + Plan Name */}
          {currentStep === 1 && (
            <Card style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Brain className="h-5 w-5" />
                  What&apos;s your experience level?
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  This determines the difficulty distribution of your roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    className="text-sm font-medium mb-2 block"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Plan Name
                    <span
                      style={{ color: "var(--danger)", marginLeft: "2px" }}
                    >
                      *
                    </span>
                  </label>
                  <div
                    style={{
                      outline:
                        stepError && !planName.trim()
                          ? "2px solid var(--danger)"
                          : "none",
                      borderRadius: "8px",
                    }}
                  >
                    <Input
                      placeholder="e.g., Google SDE Preparation"
                      value={planName}
                      onChange={(e) => {
                        setPlanName(e.target.value);
                        setStepError(null);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    ["BEGINNER", "INTERMEDIATE", "EXPERT"] as ExperienceLevel[]
                  ).map((level) => (
                    <button
                      key={level}
                      onClick={() => setExperienceLevel(level)}
                      className="p-4 rounded-lg border-2 text-left transition-all hover:border-primary cursor-pointer"
                      style={{
                        borderColor:
                          experienceLevel === level
                            ? "var(--accent)"
                            : "var(--border)",
                        background:
                          experienceLevel === level
                            ? "var(--accent-dim)"
                            : "var(--bg-card)",
                      }}
                    >
                      <div
                        className="font-semibold capitalize"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {level.toLowerCase()}
                      </div>
                      <div
                        className="text-sm mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {level === "BEGINNER" &&
                          "More easy problems, fundamentals first"}
                        {level === "INTERMEDIATE" &&
                          "Balanced mix of difficulties"}
                        {level === "EXPERT" && "Hard-heavy, advanced patterns"}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Timeline */}
          {currentStep === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Calendar className="h-5 w-5" />
                  Interview Timeline
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  How many weeks until your interview?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Weeks
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {timelineWeeks} weeks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={timelineWeeks}
                    onChange={(e) => {
                      setTimelineWeeks(Number(e.target.value));
                      setStepError(null);
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: "var(--bg-input)" }}
                  />
                  <div
                    className="flex justify-between text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>1 week</span>
                    <span style={{ color: "var(--accent-text)" }}>
                      12 weeks
                    </span>
                    <span>24 weeks</span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-input)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>
                      {timelineWeeks} weeks
                    </strong>{" "}
                    gives you{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {timelineWeeks * weeklyHours} total hours
                    </strong>{" "}
                    of study time.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Hours/Week */}
          {currentStep === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Clock className="h-5 w-5" />
                  Weekly Study Hours
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  How many hours per week can you dedicate?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Hours/Week
                    </span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {weeklyHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => {
                      setWeeklyHours(Number(e.target.value));
                      setStepError(null);
                    }}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: "var(--bg-input)" }}
                  />
                  <div
                    className="flex justify-between text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span>2 hours</span>
                    <span style={{ color: "var(--accent-text)" }}>
                      20 hours
                    </span>
                    <span>40 hours</span>
                  </div>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "var(--bg-input)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    At{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {weeklyHours} hours/week
                    </strong>{" "}
                    for{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {timelineWeeks} weeks
                    </strong>
                    , you&apos;ll have{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {timelineWeeks * weeklyHours} total hours
                    </strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Companies */}
          {currentStep === 4 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Building2 className="h-5 w-5" />
                  Target Companies
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  Select companies you&apos;re preparing for. Problems asked by
                  these companies will be prioritized.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Companies are ordered by priority. First selected = highest
                  priority.
                </p>
                {selectedCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCompanies.map((id, idx) => (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive/10 hover:text-destructive gap-1"
                        onClick={() => toggleCompany(id)}
                      >
                        <span className="text-xs opacity-60">
                          #{idx + 1}
                        </span>{" "}
                        {getCompanyName(id)} ×
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <Input
                    placeholder="Search companies (Google, TCS, Microsoft...)"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowCompanyDropdown(false), 200)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && companySearch.trim()) {
                        e.preventDefault();
                        if (filteredCompanies.length > 0) {
                          toggleCompany(filteredCompanies[0].id);
                        } else if (isCustomCompany) {
                          addCustomCompany();
                        }
                      }
                    }}
                    className="pl-10"
                  />
                  {showCompanyDropdown &&
                    (filteredCompanies.length > 0 || isCustomCompany) && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCompanies.slice(0, 12).map((company) => (
                          <button
                            key={company.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleCompany(company.id);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                          >
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                            {company.name}
                          </button>
                        ))}
                        {isCustomCompany && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addCustomCompany();
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2 border-t border-border text-primary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add &quot;{companySearch.trim()}&quot; as custom
                            company
                          </button>
                        )}
                      </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredCompanies.slice(0, 24).map((company) => (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className="p-3 rounded-lg border text-left text-sm transition-all hover:border-primary cursor-pointer"
                      style={{
                        borderColor: selectedCompanies.includes(company.id)
                          ? "var(--accent)"
                          : "var(--border)",
                        background: selectedCompanies.includes(company.id)
                          ? "var(--accent-dim)"
                          : "var(--bg-card)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Topics */}
          {currentStep === 5 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <BookOpen className="h-5 w-5" />
                  Topic Selection
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  Choose which topics to include in your roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {(["ALL", "RECOMMENDED", "CUSTOM"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={topicMode === mode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTopicMode(mode);
                        if (mode === "ALL") setSelectedTopics([...TOPICS]);
                        setStepError(null);
                      }}
                    >
                      {mode === "ALL" && "All Topics"}
                      {mode === "RECOMMENDED" && "Recommended"}
                      {mode === "CUSTOM" && "Custom"}
                    </Button>
                  ))}
                </div>
                {topicMode === "CUSTOM" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className="p-3 rounded-lg border text-left text-sm transition-all hover:border-primary cursor-pointer"
                        style={{
                          borderColor: selectedTopics.includes(topic)
                            ? "var(--accent)"
                            : "var(--border)",
                          background: selectedTopics.includes(topic)
                            ? "var(--accent-dim)"
                            : "var(--bg-card)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
                {topicMode === "RECOMMENDED" && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--bg-input)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      A core set covering the patterns interviewers ask most —{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        {RECOMMENDED_TOPICS.length} topics
                      </strong>
                      : {RECOMMENDED_TOPICS.join(", ")}
                    </p>
                  </div>
                )}
                {topicMode === "ALL" && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: "var(--bg-input)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      All {TOPICS.length} topics will be included in your
                      roadmap with balanced coverage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Difficulty + Review */}
          {currentStep === 6 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle
                  className="flex items-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Gauge className="h-5 w-5" />
                  Difficulty Preference
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  Set your preferred starting difficulty level.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {(
                    [
                      "VERY_EASY",
                      "EASY",
                      "MEDIUM",
                      "HARD",
                      "VERY_HARD",
                    ] as DifficultyPreference[]
                  ).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setDifficultyPreference(diff);
                        setStepError(null);
                      }}
                      className="p-4 rounded-lg border-2 text-center transition-all hover:border-primary cursor-pointer"
                      style={{
                        borderColor:
                          difficultyPreference === diff
                            ? "var(--accent)"
                            : "var(--border)",
                        background:
                          difficultyPreference === diff
                            ? "var(--accent-dim)"
                            : "var(--bg-card)",
                      }}
                    >
                      <div
                        className="font-semibold text-sm"
                        style={{
                          color:
                            difficultyPreference === diff
                              ? "var(--accent-text)"
                              : "var(--text-primary)",
                        }}
                      >
                        {DIFFICULTY_LABELS[diff]}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Plan summary */}
                <div
                  className="p-4 rounded-lg space-y-2"
                  style={{ background: "var(--bg-input)" }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Plan Summary
                  </p>
                  <div
                    className="grid grid-cols-2 gap-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>Plan: {planName || "My Interview Plan"}</span>
                    <span>Experience: {experienceLevel.toLowerCase()}</span>
                    <span>Timeline: {timelineWeeks} weeks</span>
                    <span>Hours/week: {weeklyHours}h</span>
                    <span>
                      Companies: {selectedCompanies.length} selected
                    </span>
                    <span>
                      Topics:{" "}
                      {topicMode === "ALL"
                        ? "All"
                        : `${selectedTopics.length} selected`}
                    </span>
                    <span>
                      Difficulty: {DIFFICULTY_LABELS[difficultyPreference]}
                    </span>
                    <span>
                      Total: {timelineWeeks * weeklyHours}h study time
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </AnimatedStep>

        {/* Step validation error */}
        {stepError && (
          <div
            className="rounded-lg px-3 py-2 flex items-center gap-2"
            style={{
              background: "var(--danger-dim)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: "var(--danger)", fontSize: "10px" }}
            >
              !
            </span>
            <p className="text-xs" style={{ color: "var(--danger)" }}>
              {stepError}
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => {
              setStepError(null);
              setError(null);
              setCurrentStep((s) => Math.max(1, s - 1));
            }}
            disabled={currentStep === 1 || submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < 6 ? (
            <Button
              className="cursor-pointer"
              onClick={handleNext}
              disabled={!canProceed() || submitting}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              size="lg"
              className="cursor-pointer bg-[#1d1d1f] hover:bg-[#424245] text-white shadow-lg"
            >
              {submitting ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Roadmap
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* STATE 1: Loading overlay */}
      {submitting && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm overlay-delayed"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <LoadingExperience difficulty={difficultyPreference} />
        </div>
      )}

      {/* STATE 2: Success overlay */}
      {planCreated && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div className="text-center max-w-sm mx-4">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: "var(--success-dim)",
                border: "2px solid var(--success)",
                animation: "scale-in 0.3s ease-out",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M8 16l6 6 10-12"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: "40",
                    animation: "draw-check 0.4s ease-out 0.2s both",
                  }}
                />
              </svg>
            </div>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Plan saved
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Now building your roadmap — this continues on the next screen.
            </p>

            <div
              className="mt-6 rounded-full overflow-hidden"
              style={{ height: "2px", background: "var(--border)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: "var(--success)",
                  animation: "fill-bar 1s linear forwards",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
