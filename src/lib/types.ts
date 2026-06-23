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
  // FAANG+ / Top US Tech
  { id: "google", name: "Google", slug: "google" },
  { id: "meta", name: "Meta", slug: "meta" },
  { id: "amazon", name: "Amazon", slug: "amazon" },
  { id: "apple", name: "Apple", slug: "apple" },
  { id: "microsoft", name: "Microsoft", slug: "microsoft" },
  { id: "netflix", name: "Netflix", slug: "netflix" },
  { id: "nvidia", name: "NVIDIA", slug: "nvidia" },
  { id: "tesla", name: "Tesla", slug: "tesla" },
  { id: "openai", name: "OpenAI", slug: "openai" },

  // Big Tech / Enterprise
  { id: "ibm", name: "IBM", slug: "ibm" },
  { id: "oracle", name: "Oracle", slug: "oracle" },
  { id: "salesforce", name: "Salesforce", slug: "salesforce" },
  { id: "adobe", name: "Adobe", slug: "adobe" },
  { id: "sap", name: "SAP", slug: "sap" },
  { id: "cisco", name: "Cisco", slug: "cisco" },
  { id: "intel", name: "Intel", slug: "intel" },
  { id: "amd", name: "AMD", slug: "amd" },
  { id: "qualcomm", name: "Qualcomm", slug: "qualcomm" },

  // Indian IT / Consulting
  { id: "tcs", name: "TCS", slug: "tcs" },
  { id: "infosys", name: "Infosys", slug: "infosys" },
  { id: "wipro", name: "Wipro", slug: "wipro" },
  { id: "hcl", name: "HCL Technologies", slug: "hcl" },
  { id: "tech-mahindra", name: "Tech Mahindra", slug: "tech-mahindra" },
  { id: "cognizant", name: "Cognizant", slug: "cognizant" },
  { id: "accenture", name: "Accenture", slug: "accenture" },
  { id: "capgemini", name: "Capgemini", slug: "capgemini" },
  { id: "mindtree", name: "Mindtree", slug: "mindtree" },
  { id: "mphasis", name: "Mphasis", slug: "mphasis" },
  { id: "ltimindtree", name: "LTIMindtree", slug: "ltimindtree" },

  // Ride-hailing / Delivery
  { id: "uber", name: "Uber", slug: "uber" },
  { id: "lyft", name: "Lyft", slug: "lyft" },
  { id: "doordash", name: "DoorDash", slug: "doordash" },
  { id: "instacart", name: "Instacart", slug: "instacart" },
  { id: "grab", name: "Grab", slug: "grab" },
  { id: "ola", name: "Ola", slug: "ola" },

  // Fintech
  { id: "goldman-sachs", name: "Goldman Sachs", slug: "goldman-sachs" },
  { id: "jpmorgan", name: "JPMorgan Chase", slug: "jpmorgan" },
  { id: "morgan-stanley", name: "Morgan Stanley", slug: "morgan-stanley" },
  { id: "visa", name: "Visa", slug: "visa" },
  { id: "mastercard", name: "Mastercard", slug: "mastercard" },
  { id: "paypal", name: "PayPal", slug: "paypal" },
  { id: "stripe", name: "Stripe", slug: "stripe" },
  { id: "square", name: "Block (Square)", slug: "square" },
  { id: "coinbase", name: "Coinbase", slug: "coinbase" },
  { id: "bloomberg", name: "Bloomberg", slug: "bloomberg" },
  { id: "barclays", name: "Barclays", slug: "barclays" },
  { id: "wells-fargo", name: "Wells Fargo", slug: "wells-fargo" },

  // Social / Messaging
  { id: "snapchat", name: "Snapchat", slug: "snapchat" },
  { id: "pinterest", name: "Pinterest", slug: "pinterest" },
  { id: "reddit", name: "Reddit", slug: "reddit" },
  { id: "twitter", name: "Twitter/X", slug: "twitter" },
  { id: "discord", name: "Discord", slug: "discord" },
  { id: "telegram", name: "Telegram", slug: "telegram" },
  { id: "tumblr", name: "Tumblr", slug: "tumblr" },

  // Travel / Hospitality
  { id: "airbnb", name: "Airbnb", slug: "airbnb" },
  { id: "booking", name: "Booking.com", slug: "booking" },
  { id: "expedia", name: "Expedia", slug: "expedia" },
  { id: "tripadvisor", name: "TripAdvisor", slug: "tripadvisor" },

  // Cloud / SaaS
  { id: "salesforce", name: "Salesforce", slug: "salesforce" },
  { id: "databricks", name: "Databricks", slug: "databricks" },
  { id: "snowflake", name: "Snowflake", slug: "snowflake" },
  { id: "cloudflare", name: "Cloudflare", slug: "cloudflare" },
  { id: "fastly", name: "Fastly", slug: "fastly" },
  { id: "twilio", name: "Twilio", slug: "twilio" },
  { id: "shopify", name: "Shopify", slug: "shopify" },
  { id: "atlassian", name: "Atlassian", slug: "atlassian" },
  { id: "zoom", name: "Zoom", slug: "zoom" },
  { id: "slack", name: "Slack", slug: "slack" },
  { id: "notion", name: "Notion", slug: "notion" },

  // E-commerce / Retail
  { id: "flipkart", name: "Flipkart", slug: "flipkart" },
  { id: "walmart", name: "Walmart", slug: "walmart" },
  { id: "target", name: "Target", slug: "target" },
  { id: "costco", name: "Costco", slug: "costco" },
  { id: "alibaba", name: "Alibaba", slug: "alibaba" },
  { id: "jd", name: "JD.com", slug: "jd" },
  { id: "meesho", name: "Meesho", slug: "meesho" },
  { id: "zomato", name: "Zomato", slug: "zomato" },
  { id: "swiggy", name: "Swiggy", slug: "swiggy" },

  // Streaming / Media
  { id: "spotify", name: "Spotify", slug: "spotify" },
  { id: "disney", name: "Disney+", slug: "disney" },
  { id: "hulu", name: "Hulu", slug: "hulu" },
  { id: "youtube", name: "YouTube", slug: "youtube" },

  // Cybersecurity
  { id: "palo-alto", name: "Palo Alto Networks", slug: "palo-alto" },
  { id: "crowdstrike", name: "CrowdStrike", slug: "crowdstrike" },
  { id: "fortinet", name: "Fortinet", slug: "fortinet" },

  // AI / ML
  { id: "anthropic", name: "Anthropic", slug: "anthropic" },
  { id: "hugging-face", name: "Hugging Face", slug: "hugging-face" },
  { id: "deepmind", name: "DeepMind", slug: "deepmind" },

  // Hardware / Semiconductor
  { id: "samsung", name: "Samsung", slug: "samsung" },
  { id: "bytedance", name: "ByteDance", slug: "bytedance" },
  { id: "xiaomi", name: "Xiaomi", slug: "xiaomi" },
  { id: "huawei", name: "Huawei", slug: "huawei" },

  // Gaming
  { id: "ea", name: "Electronic Arts", slug: "ea" },
  { id: "riot", name: "Riot Games", slug: "riot" },
  { id: "roblox", name: "Roblox", slug: "roblox" },
  { id: "epic-games", name: "Epic Games", slug: "epic-games" },

  // Logistics
  { id: "fedex", name: "FedEx", slug: "fedex" },
  { id: "ups", name: "UPS", slug: "ups" },
  { id: "dhl", name: "DHL", slug: "dhl" },

  // Telecom
  { id: "verizon", name: "Verizon", slug: "verizon" },
  { id: "att", name: "AT&T", slug: "att" },
  { id: "t-mobile", name: "T-Mobile", slug: "t-mobile" },

  // Other notable
  { id: "linkedin", name: "LinkedIn", slug: "linkedin" },
  { id: "twitter", name: "Twitter/X", slug: "twitter" },
  { id: "twitch", name: "Twitch", slug: "twitch" },
  { id: "figma", name: "Figma", slug: "figma" },
  { id: "canva", name: "Canva", slug: "canva" },
  { id: "dropbox", name: "Dropbox", slug: "dropbox" },
  { id: "github", name: "GitHub", slug: "github" },
  { id: "vmware", name: "VMware", slug: "vmware" },
  { id: "palantir", name: "Palantir", slug: "palantir" },
  { id: "servicenow", name: "ServiceNow", slug: "servicenow" },
  { id: "workday", name: "Workday", slug: "workday" },
  { id: "splunk", name: "Splunk", slug: "splunk" },
  { id: "redis", name: "Redis", slug: "redis" },
  { id: "mongodb", name: "MongoDB", slug: "mongodb" },
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
