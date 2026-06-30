"use client";

import { useState, useEffect } from "react";
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
import { COMPANIES, TOPICS, DIFFICULTY_LABELS } from "@/lib/types";
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

function LoadingExperience({ difficulty }: { difficulty: string }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const stages = [
    { icon: "🔍", text: "Analyzing your target companies..." },
    { icon: "📊", text: "Scanning 914 curated problems..." },
    { icon: "⚖️", text: "Balancing topics across weeks..." },
    { icon: "🎯", text: "Weighting by company frequency..." },
    { icon: "📅", text: "Building your week-by-week schedule..." },
    { icon: "✨", text: "Almost there — finalizing your roadmap..." },
  ];

  const difficultyMessages: Record<string, string> = {
    VERY_EASY: "Starting you off easy — building confidence first.",
    EASY: "Keeping it approachable while you build momentum.",
    MEDIUM: "Balancing challenge with steady progress.",
    HARD: "You picked Hard — give us a moment to curate the toughest problems.",
    VERY_HARD: "Maximum difficulty selected. This takes a bit longer to get right.",
  };

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => Math.min(prev + 1, stages.length - 1));
    }, 2200);

    const elapsedInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(elapsedInterval);
    };
  }, []);

  const isTakingLong = elapsed > 40;
  const isHardDifficulty = difficulty === "HARD" || difficulty === "VERY_HARD";

  return (
    <div className="max-w-md w-full mx-4 text-center relative">
      <div
        className="absolute inset-0 loading-bg-pulse"
        style={{
          background: 'radial-gradient(circle at center, rgba(99,102,241,0.1), transparent 70%)',
        }}
      />
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">
          {stages[stageIndex].icon}
        </div>
      </div>

      <p
        key={stageIndex}
        className="text-white font-semibold text-lg mb-2 animate-in fade-in duration-300"
      >
        {stages[stageIndex].text}
      </p>

      {isHardDifficulty && (
        <p className="text-indigo-300/70 text-sm mb-4">
          {difficultyMessages[difficulty]}
        </p>
      )}

      <div className="flex items-center justify-center gap-1.5 mb-6">
        {stages.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === stageIndex ? '24px' : '6px',
              background: i <= stageIndex
                ? 'var(--accent, #6366f1)'
                : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>

      {isTakingLong && (
        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-400 text-xs">
            This is taking a bit longer than usual — we&apos;re making sure your
            roadmap is perfectly tailored. Hang tight!
          </p>
        </div>
      )}

      <p className="text-slate-600 text-xs mt-4">
        {elapsed}s elapsed
      </p>
    </div>
  );
}

const steps = [
  { id: 1, title: "Experience", icon: Brain },
  { id: 2, title: "Timeline", icon: Calendar },
  { id: 3, title: "Hours/Week", icon: Clock },
  { id: 4, title: "Companies", icon: Building2 },
  { id: 5, title: "Topics", icon: BookOpen },
  { id: 6, title: "Difficulty", icon: Gauge },
];

export default function NewPlanPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planCreated, setPlanCreated] = useState(false);

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
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName || "My Interview Plan",
          description: "",
          experienceLevel,
          timelineWeeks,
          weeklyHours,
          targetCompanies: selectedCompanies,
          topicMode,
          selectedTopics:
            topicMode === "ALL" ? [...TOPICS] : selectedTopics,
          difficultyPreference,
        }),
      });

      if (response.status === 429) {
        const data = await response.json();
        setError(data.message || "You've created too many plans today. Please try again tomorrow.");
        setIsGenerating(false);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setPlanCreated(true);
        setTimeout(() => {
          router.push(`/dashboard/plans/${data.plan.slug}`);
        }, 1500);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Failed to create plan. Please try again.");
        setIsGenerating(false);
        return;
      }
    } catch (error) {
      console.error("Failed to create plan:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Create New Plan</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Set up your personalized interview preparation roadmap.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          ⚠️ {error}
        </div>
      )}

      <div className={cn("flex flex-col gap-2", isGenerating && "pointer-events-none select-none")}>
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Step {currentStep} of {steps.length}</p>
        <div className="flex items-center justify-between w-full overflow-x-auto gap-1 px-2 py-3 rounded-2xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className="flex items-center gap-1.5 shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: currentStep === step.id ? "var(--accent)" : currentStep > step.id ? "var(--bg-input-hover)" : "transparent",
                  color: currentStep === step.id ? "#ffffff" : currentStep > step.id ? "var(--text-secondary)" : "var(--text-muted)",
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
                <div className="flex-1 h-px min-w-[12px] max-w-[40px] mx-1" style={{ background: "var(--border)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("space-y-8", isGenerating && "pointer-events-none select-none opacity-60")}>
      <AnimatedStep stepKey={currentStep}>
          {currentStep === 1 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                  <Brain className="h-5 w-5" />
                  What&apos;s your experience level?
                </CardTitle>
                <CardDescription style={{ color: "var(--text-secondary)" }}>
                  This determines the difficulty distribution of your roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Plan Name
                  </label>
                  <Input
                    placeholder="e.g., Google SDE Preparation"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
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
                        borderColor: experienceLevel === level ? "var(--accent)" : "var(--border)",
                        background: experienceLevel === level ? "var(--accent-dim)" : "var(--bg-card)",
                      }}
                    >
                      <div className="font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{level.toLowerCase()}</div>
                      <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                        {level === "BEGINNER" && "More easy problems, fundamentals first"}
                        {level === "INTERMEDIATE" && "Balanced mix of difficulties"}
                        {level === "EXPERT" && "Hard-heavy, advanced patterns"}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
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
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Weeks</span>
                    <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {timelineWeeks} weeks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: "var(--bg-input)" }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>1 week</span>
                    <span style={{ color: "var(--accent-text)" }}>12 weeks</span>
                    <span>24 weeks</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: "var(--bg-input)" }}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)" }}>{timelineWeeks} weeks</strong> gives you{" "}
                    <strong style={{ color: "var(--text-primary)" }}>{timelineWeeks * weeklyHours} total hours</strong>{" "}
                    of study time.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
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
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Hours/Week</span>
                    <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {weeklyHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ background: "var(--bg-input)" }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>2 hours</span>
                    <span style={{ color: "var(--accent-text)" }}>20 hours</span>
                    <span>40 hours</span>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: "var(--bg-input)" }}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    At <strong style={{ color: "var(--text-primary)" }}>{weeklyHours} hours/week</strong> for{" "}
                    <strong style={{ color: "var(--text-primary)" }}>{timelineWeeks} weeks</strong>, you&apos;ll have{" "}
                    <strong style={{ color: "var(--text-primary)" }}>{timelineWeeks * weeklyHours} total hours</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
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
                        <span className="text-xs opacity-60">#{idx + 1}</span>{" "}
                        {getCompanyName(id)} ×
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  <Input
                    placeholder="Search companies (Google, TCS, Microsoft...)"
                    value={companySearch}
                    onChange={(e) => {
                      setCompanySearch(e.target.value);
                      setShowCompanyDropdown(true);
                    }}
                    onFocus={() => setShowCompanyDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
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
                        borderColor: selectedCompanies.includes(company.id) ? "var(--accent)" : "var(--border)",
                        background: selectedCompanies.includes(company.id) ? "var(--accent-dim)" : "var(--bg-card)",
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

          {currentStep === 5 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
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
                          borderColor: selectedTopics.includes(topic) ? "var(--accent)" : "var(--border)",
                          background: selectedTopics.includes(topic) ? "var(--accent-dim)" : "var(--bg-card)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
                {topicMode === "RECOMMENDED" && (
                  <div className="p-4 rounded-lg" style={{ background: "var(--bg-input)" }}>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      Based on your selected companies, we recommend:{" "}
                      <strong style={{ color: "var(--text-primary)" }}>
                        Arrays, Trees, Graphs, Dynamic Programming, Hashing,
                        Binary Search
                      </strong>
                    </p>
                  </div>
                )}
                {topicMode === "ALL" && (
                  <div className="p-4 rounded-lg" style={{ background: "var(--bg-input)" }}>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      All {TOPICS.length} topics will be included in your
                      roadmap with balanced coverage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
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
                      onClick={() => setDifficultyPreference(diff)}
                      className="p-4 rounded-lg border-2 text-center transition-all hover:border-primary cursor-pointer"
                      style={{
                        borderColor: difficultyPreference === diff ? "var(--accent)" : "var(--border)",
                        background: difficultyPreference === diff ? "var(--accent-dim)" : "var(--bg-card)",
                      }}
                    >
                      <div className="font-semibold text-sm" style={{ color: difficultyPreference === diff ? "var(--accent-text)" : "var(--text-primary)" }}>
                        {DIFFICULTY_LABELS[diff]}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 rounded-lg space-y-2" style={{ background: "var(--bg-input)" }}>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Plan Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </AnimatedStep>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {currentStep < 6 ? (
          <Button
            className="cursor-pointer"
            onClick={() => setCurrentStep((s) => Math.min(6, s + 1))}
            disabled={!canProceed()}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Roadmap...
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

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <LoadingExperience difficulty={difficultyPreference} />
        </div>
      )}

      {planCreated && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-5xl mb-2">🚀</div>
          <p className="text-white font-bold text-xl">Your roadmap is ready!</p>
          <p className="text-slate-400 text-sm">Redirecting you now...</p>
        </div>
      )}
    </div>
  );
}
