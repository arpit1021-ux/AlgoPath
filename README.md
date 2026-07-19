# AlgoPath — Personalized DSA Interview Prep Platform

Most interview platforms give everyone the same list of questions.

I wanted to build something that understands who you're preparing for, how much time you actually have, and what you're struggling with.

AlgoPath isn't just another DSA sheet — it generates a personalized week-by-week roadmap based on your target company, available hours, and skill level. Then it tracks your progress, schedules revisions, and tells you exactly how ready you are.

**[Live Demo](https://algo-path-five.vercel.app)** · **Next.js · TypeScript · PostgreSQL · Prisma**

---

## The Problem

With 2000+ LeetCode problems, students don't know where to start. Most tools just filter by tag and return a flat list.

But a student targeting Amazon and a student targeting Google should solve different problems — even with the same skill level. The roadmap should adapt to you, not the other way around.

---

## How It Works

```
Select target company + study hours
            ↓
   Scheduling engine generates
   personalized week-by-week plan
            ↓
   Track progress as you solve
            ↓
   Spaced repetition schedules
   revision sessions automatically
            ↓
   Readiness score tells you
   exactly where you stand
```

---

## Features

- **Company-Weighted Roadmaps** — Your 1st-choice company gets higher priority in problem selection than your 2nd or 3rd
- **Time-Aware Scheduling** — Calculates exact problem counts per week based on your hours and per-difficulty solving speeds
- **Topic Balancing** — No more than 3 consecutive problems from the same topic to keep learning varied
- **Spaced Repetition** — Automatically schedules revision sessions so you don't forget what you've solved
- **Readiness Scoring** — Weighted score across topic coverage, difficulty mix, revision completion, company prep, and consistency
- **Weak Topic Detection** — Identifies your weakest areas so you know exactly what to focus on

---

## Engineering Highlights

- **Custom scheduling algorithm** that balances company priority, difficulty distribution, time budgets, and topic variety simultaneously
- **Company-weighted scoring** using linear decay — 1st company scores 100, 2nd scores 85, 3rd scores 70
- **Batch database operations** reduced roadmap generation from ~2s to ~200ms
- **Spaced repetition engine** with composite-indexed queries for fast daily revision lookups
- **Redis rate limiting** via Upstash for serverless-compatible per-user throttling

---

## The Hardest Problem I Solved

The algorithm was "technically correct" but the roadmaps didn't feel personalized. A user selecting "Very Hard" still got many easy problems.

The issue wasn't in the algorithm itself — it was that the user's preference traveled through React, API, validation, and finally the scheduling engine. A small mismatch in one layer silently caused the whole system to fall back to defaults.

I redesigned the pipeline so difficulty distribution drives time allocation, which drives problem selection. Every preference now flows through the entire system. The lesson: users don't care if an algorithm is correct. They care if the product keeps its promise.

---

## Tech Stack

| | |
|-|-|
| **Frontend** | Next.js 14, React, TypeScript, Tailwind CSS |
| **Database** | PostgreSQL, Prisma ORM |
| **Auth** | Clerk |
| **Rate Limiting** | Redis (Upstash) |
| **Background Jobs** | Inngest |
| **Deployment** | Vercel |

---

## Run Locally

```bash
git clone https://github.com/arpit1021-ux/AlgoPath.git
cd AlgoPath && npm install
cp .env.example .env
npx prisma db push && npx prisma db seed
npm run dev
```

---

Built by [Arpit Singh](https://linkedin.com/in/arpitsingh05)
