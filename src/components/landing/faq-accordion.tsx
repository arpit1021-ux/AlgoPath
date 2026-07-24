"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is AlgoPath?",
    answer:
      "AlgoPath is a smart interview preparation platform that generates personalized week-by-week LeetCode roadmaps based on your target companies, experience level, and available time. We analyze 900+ curated problems weighted by actual interview frequency to build your optimal study plan.",
  },
  {
    question: "How does AlgoPath work?",
    answer:
      "Tell us your target companies, experience level, timeline, and weekly hours. Our AI analyzes your inputs against our database of 900+ curated problems and builds a personalized week-by-week study plan. The plan balances difficulty progression, topic variety, and company-specific patterns to maximize your interview readiness.",
  },
  {
    question: "Is AlgoPath right for my preparation?",
    answer:
      "AlgoPath is designed for anyone preparing for coding interviews — whether you're a CS student preparing for campus placements, a working professional targeting FAANG companies, a career switcher breaking into tech, or a competitive coder sharpening your edge. The platform adapts to your experience level and goals.",
  },
  {
    question: "How can I set up my account for AlgoPath?",
    answer:
      "Simply sign up for free, then create your first plan by selecting your experience level, target companies, timeline, and weekly study hours. Our AI will generate a personalized roadmap in seconds. No credit card required, no hidden fees — AlgoPath is completely free.",
  },
  {
    question: "What companies are covered?",
    answer:
      "We cover 100+ companies including Google, Meta, Amazon, Microsoft, Apple, Goldman Sachs, Bloomberg, Adobe, Uber, Netflix, Stripe, TCS, Infosys, and many more. Problems are weighted by actual interview frequency at each company, so you focus on what matters most for your targets.",
  },
  {
    question: "How does spaced repetition work?",
    answer:
      "After you solve a problem, our system automatically schedules reviews at optimal intervals (2 days, 7 days, 21 days, 45 days). This spaced repetition ensures you retain solutions long-term without manual tracking, so you never forget what you learned.",
  },
  {
    question: "Do I need a LeetCode Premium subscription?",
    answer:
      "No. AlgoPath works with the free LeetCode tier. All problems in our roadmap are available on the free plan. We link directly to each problem so you can solve them without switching contexts.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* FAQ Title */}
      <div className="text-center mb-12">
        <h2
          className="text-5xl md:text-6xl font-bold mb-4"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
          }}
        >
          FAQ
        </h2>
        {/* Decorative underline */}
        <div className="flex justify-center">
          <svg width="200" height="8" viewBox="0 0 200 8" fill="none">
            <path
              d="M2 6C40 2 80 4 100 4C120 4 160 2 198 6"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="flex flex-col">
        {faqData.map((item, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              borderBottom: "1px solid var(--border)",
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
            >
              <span
                className="text-lg font-semibold pr-4 transition-colors group-hover:text-[var(--accent)]"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {item.question}
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                style={{
                  border: "1px solid var(--border-strong)",
                  background: openIndex === i ? "var(--accent)" : "transparent",
                  color: openIndex === i ? "#1a1a1a" : "var(--text-secondary)",
                }}
              >
                {openIndex === i ? (
                  <Minus className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </div>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: openIndex === i ? "300px" : "0px",
                opacity: openIndex === i ? 1 : 0,
              }}
            >
              <p
                className="pb-6 text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
