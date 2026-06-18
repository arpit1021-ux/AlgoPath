import { SEED_PROBLEMS, type SeedProblem } from "./seed-data";

export interface LeetCodeProblem {
  title: string;
  titleSlug: string;
  frontendQuestionId: string;
  difficulty: string;
  acRate: number;
  likes: number;
  dislikes: number;
  topicTags: Array<{ name: string; slug: string }>;
  isPaidOnly: boolean;
}

export function getAllProblems(): SeedProblem[] {
  return SEED_PROBLEMS;
}

export function mapDifficulty(
  difficulty: string
): "EASY" | "MEDIUM" | "HARD" {
  return difficulty.toUpperCase() as "EASY" | "MEDIUM" | "HARD";
}

export function getLeetCodeUrl(titleSlug: string): string {
  return `https://leetcode.com/problems/${titleSlug}/`;
}
