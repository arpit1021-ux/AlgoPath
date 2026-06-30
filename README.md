# AlgoPath — Personalized DSA Interview Prep Platform

> A full-stack platform that generates personalized LeetCode roadmaps based on your target company, available study time, and experience level.

**Live Demo:** [algo-path-five.vercel.app](https://algo-path-five.vercel.app)

## What It Does

AlgoPath solves a real problem: DSA interview prep is overwhelming. With 2000+ LeetCode problems, students don't know where to start or what to focus on.

AlgoPath fixes this by:
- Generating a **personalized study roadmap** based on your target company (e.g., Amazon, Google, Microsoft)
- Creating **time-bound plans** based on how many hours/day you can study
- Tracking your **progress** with readiness scoring
- Sending **spaced-repetition reminders** so you don't forget solved problems

## Key Features

- **Company-Wise Roadmaps** — Select your target company and get a curated problem list based on frequency data from 900+ problems
- **Scheduling Algorithm** — Custom algorithm that distributes problems across your available study time with topic balancing
- **Spaced Repetition** — Intelligent revision scheduling using spaced-repetition principles to maximize retention
- **Readiness Score** — Real-time scoring algorithm that tells you how prepared you are for interviews
- **Analytics Dashboard** — Track problems solved, time spent, topic coverage, and streak data
- **Secure Authentication** — Clerk-based auth with session management
- **Rate Limiting** — Redis-based rate limiting via Upstash to prevent abuse

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, REST APIs |
| Database | PostgreSQL, Prisma ORM |
| Auth | Clerk |
| Caching | Redis (Upstash) |
| Deployment | Vercel |

## Architecture

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components (UI, charts, forms)
├── lib/
│   ├── prisma.ts     # Database client
│   ├── redis.ts      # Rate limiting
│   └── utils.ts      # Scheduling algorithm, scoring
└── prisma/
    └── schema.prisma # Database schema
```

## How the Scheduling Algorithm Works

1. User selects target company → system fetches company-specific problem frequency data
2. User inputs available hours per day and target completion date
3. Algorithm distributes 900+ problems across the timeline, balancing:
   - Topic variety (arrays, trees, graphs, DP, etc.)
   - Difficulty progression (easy → medium → hard)
   - Company frequency weights (higher frequency = higher priority)
4. Generates daily study plans with specific problems to solve

## Getting Started

```bash
git clone https://github.com/arpit1021-ux/AlgoPath.git
cd AlgoPath
npm install
cp .env.example .env  # Add your Clerk, PostgreSQL, Upstash keys
npx prisma db push
npm run dev
```

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## What I Learned Building This

- Designing scheduling algorithms that balance multiple constraints
- Optimizing PostgreSQL queries for large problem datasets
- Implementing spaced-repetition systems from scratch
- Building production-grade Next.js apps with TypeScript

---

Built by [Arpit Singh](https://linkedin.com/in/arpitsingh05)
