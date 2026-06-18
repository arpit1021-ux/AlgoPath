"use client";

import { useState } from "react";
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
} from "lucide-react";

const AnimatedStep = dynamic(
  () => import("@/components/wizard/animated-step").then((m) => m.AnimatedStep),
  { ssr: false }
);

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

  const [planName, setPlanName] = useState("");
  const [experienceLevel, setExperienceLevel] =
    useState<ExperienceLevel>("INTERMEDIATE");
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [topicMode, setTopicMode] = useState<"ALL" | "RECOMMENDED" | "CUSTOM">(
    "ALL"
  );
  const [selectedTopics, setSelectedTopics] = useState<string[]>([
    ...TOPICS,
  ]);
  const [difficultyPreference, setDifficultyPreference] =
    useState<DifficultyPreference>("MEDIUM");

  const filteredCompanies = COMPANIES.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
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

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/plans/${data.plan.id}`);
      }
    } catch (error) {
      console.error("Failed to create plan:", error);
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
        <h1 className="text-3xl font-bold">Create New Plan</h1>
        <p className="text-muted-foreground mt-1">
          Set up your personalized interview preparation roadmap.
        </p>
      </div>

      <div className="flex items-center justify-between glass-card rounded-2xl p-4 border-border/50">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                currentStep === step.id
                  ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/20"
                  : currentStep > step.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              <span className="hidden md:inline">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 mx-2 transition-colors",
                  currentStep > step.id ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatedStep stepKey={currentStep}>
          {currentStep === 1 && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  What&apos;s your experience level?
                </CardTitle>
                <CardDescription>
                  This determines the difficulty distribution of your roadmap.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
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
                      className={cn(
                        "p-4 rounded-lg border-2 text-left transition-all hover:border-primary cursor-pointer",
                        experienceLevel === level
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="font-semibold capitalize">{level.toLowerCase()}</div>
                      <div className="text-sm text-muted-foreground mt-1">
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
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Interview Timeline
                </CardTitle>
                <CardDescription>
                  How many weeks until your interview?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weeks</span>
                    <span className="text-2xl font-bold">
                      {timelineWeeks} weeks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 week</span>
                    <span>12 weeks</span>
                    <span>24 weeks</span>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>{timelineWeeks} weeks</strong> gives you{" "}
                    <strong>{timelineWeeks * weeklyHours} total hours</strong>{" "}
                    of study time.{" "}
                    {timelineWeeks <= 4
                      ? "Consider extending if possible for better coverage."
                      : timelineWeeks <= 12
                        ? "A solid timeframe for focused preparation."
                        : "Plenty of time for comprehensive coverage."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Weekly Study Hours
                </CardTitle>
                <CardDescription>
                  How many hours per week can you dedicate?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Hours/Week</span>
                    <span className="text-2xl font-bold">
                      {weeklyHours} hours
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={40}
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>2 hours</span>
                    <span>20 hours</span>
                    <span>40 hours</span>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    At <strong>{weeklyHours} hours/week</strong> for{" "}
                    <strong>{timelineWeeks} weeks</strong>, you&apos;ll have{" "}
                    <strong>{timelineWeeks * weeklyHours} total hours</strong>{" "}
                    = ~{Math.round((timelineWeeks * weeklyHours) / 35)} problems
                    estimated.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Target Companies
                </CardTitle>
                <CardDescription>
                  Select companies you&apos;re preparing for. Problems asked by
                  these companies will be prioritized.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {selectedCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCompanies.map((id) => {
                      const company = COMPANIES.find((c) => c.id === id);
                      return company ? (
                        <Badge
                          key={id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => toggleCompany(id)}
                        >
                          {company.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => toggleCompany(company.id)}
                      className={cn(
                        "p-3 rounded-lg border text-left text-sm transition-all hover:border-primary cursor-pointer",
                        selectedCompanies.includes(company.id)
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Topic Selection
                </CardTitle>
                <CardDescription>
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
                        className={cn(
                          "p-3 rounded-lg border text-left text-sm transition-all hover:border-primary cursor-pointer",
                          selectedTopics.includes(topic)
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
                {topicMode === "RECOMMENDED" && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <Sparkles className="h-4 w-4 inline mr-1" />
                      Based on your selected companies, we recommend:{" "}
                      <strong>
                        Arrays, Trees, Graphs, Dynamic Programming, Hashing,
                        Binary Search
                      </strong>
                    </p>
                  </div>
                )}
                {topicMode === "ALL" && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      All {TOPICS.length} topics will be included in your
                      roadmap with balanced coverage.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 6 && (
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Difficulty Preference
                </CardTitle>
                <CardDescription>
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
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-all hover:border-primary cursor-pointer",
                        difficultyPreference === diff
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="font-semibold text-sm">
                        {DIFFICULTY_LABELS[diff]}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Plan Summary</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
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
  );
}
