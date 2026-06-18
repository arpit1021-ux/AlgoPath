import { z } from "zod";

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type DifficultyPreference =
  | "VERY_EASY"
  | "EASY"
  | "MEDIUM"
  | "HARD"
  | "VERY_HARD";
export type PlanStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED";
export type ProblemStatus = "TODO" | "ATTEMPTED" | "SOLVED" | "SKIPPED";
export type RevisionStatus =
  | "PENDING"
  | "COMPLETED"
  | "MISSED"
  | "SKIPPED";

export const wizardStep1Schema = z.object({
  experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
});

export const wizardStep2Schema = z.object({
  timelineWeeks: z.number().min(1).max(24),
});

export const wizardStep3Schema = z.object({
  weeklyHours: z.number().min(2).max(40),
});

export const wizardStep4Schema = z.object({
  targetCompanies: z.array(z.string()).min(1, "Select at least one company"),
});

export const wizardStep5Schema = z.object({
  topicMode: z.enum(["ALL", "RECOMMENDED", "CUSTOM"]),
  selectedTopics: z.array(z.string()),
});

export const wizardStep6Schema = z.object({
  difficultyPreference: z.enum([
    "VERY_EASY",
    "EASY",
    "MEDIUM",
    "HARD",
    "VERY_HARD",
  ]),
});

export const planWizardSchema = wizardStep1Schema
  .merge(wizardStep2Schema)
  .merge(wizardStep3Schema)
  .merge(wizardStep4Schema)
  .merge(wizardStep5Schema)
  .merge(wizardStep6Schema)
  .extend({
    name: z.string().min(1, "Plan name is required").max(100),
    description: z.string().optional(),
  });

export type PlanWizardInput = z.infer<typeof planWizardSchema>;

export const COMPANIES = [
  { id: "google", name: "Google", slug: "google" },
  { id: "meta", name: "Meta", slug: "meta" },
  { id: "amazon", name: "Amazon", slug: "amazon" },
  { id: "microsoft", name: "Microsoft", slug: "microsoft" },
  { id: "apple", name: "Apple", slug: "apple" },
  { id: "uber", name: "Uber", slug: "uber" },
  { id: "airbnb", name: "Airbnb", slug: "airbnb" },
  { id: "atlassian", name: "Atlassian", slug: "atlassian" },
  { id: "bloomberg", name: "Bloomberg", slug: "bloomberg" },
  { id: "adobe", name: "Adobe", slug: "adobe" },
  { id: "netflix", name: "Netflix", slug: "netflix" },
  { id: "bytedance", name: "ByteDance", slug: "bytedance" },
  { id: "linkedin", name: "LinkedIn", slug: "linkedin" },
  { id: "salesforce", name: "Salesforce", slug: "salesforce" },
  { id: "oracle", name: "Oracle", slug: "oracle" },
  { id: "samsung", name: "Samsung", slug: "samsung" },
  { id: "paypal", name: "PayPal", slug: "paypal" },
  { id: "stripe", name: "Stripe", slug: "stripe" },
  { id: "spotify", name: "Spotify", slug: "spotify" },
  { id: "twitter", name: "Twitter/X", slug: "twitter" },
] as const;

export const TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Linked List",
  "Stack",
  "Queue",
  "Trees",
  "Graphs",
  "Heap",
  "Trie",
  "Greedy",
  "Backtracking",
  "Dynamic Programming",
  "Sliding Window",
  "Binary Search",
  "Bit Manipulation",
  "Math",
  "Two Pointers",
  "Sorting",
  "BFS/DFS",
] as const;

export const DIFFICULTY_LABELS: Record<string, string> = {
  VERY_EASY: "Very Easy",
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  VERY_HARD: "Very Hard",
};

export const BADGES = {
  "50_problems": {
    name: "50 Problems Solved",
    icon: "🎯",
    description: "Solved 50 problems",
  },
  "100_problems": {
    name: "100 Problems Solved",
    icon: "🏆",
    description: "Solved 100 problems",
  },
  "250_problems": {
    name: "250 Problems Solved",
    icon: "👑",
    description: "Solved 250 problems",
  },
  "7_day_streak": {
    name: "7 Day Streak",
    icon: "🔥",
    description: "7 consecutive days",
  },
  "30_day_streak": {
    name: "30 Day Streak",
    icon: "💪",
    description: "30 consecutive days",
  },
  dp_master: {
    name: "DP Master",
    icon: "🧩",
    description: "Solved 20+ DP problems",
  },
  graph_expert: {
    name: "Graph Expert",
    icon: "🕸️",
    description: "Solved 20+ Graph problems",
  },
  tree_whiz: {
    name: "Tree Whiz",
    icon: "🌳",
    description: "Solved 20+ Tree problems",
  },
  first_plan: {
    name: "First Plan",
    icon: "📋",
    description: "Created first plan",
  },
  revision_champion: {
    name: "Revision Champion",
    icon: "📚",
    description: "Completed 50 revisions",
  },
} as const;

export type BadgeType = keyof typeof BADGES;

export interface ReadinessScore {
  overall: number;
  topicCoverage: number;
  difficultyCoverage: number;
  revisionCompletion: number;
  companyCoverage: number;
  consistency: number;
  companyScores: Record<string, number>;
}

export interface WeeklyProgress {
  week: number;
  solved: number;
  attempted: number;
  skipped: number;
  totalAssigned: number;
}
