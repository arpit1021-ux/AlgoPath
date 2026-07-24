"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { SpaceBackground } from "@/components/landing/space-background";
import { GlowCard } from "@/components/landing/glow-card";
import { FAQAccordion } from "@/components/landing/faq-accordion";

const companies = [
  "Google", "Meta", "Amazon", "Microsoft", "Apple",
  "Goldman Sachs", "Bloomberg", "Adobe", "Uber", "Netflix",
  "Stripe", "TCS", "Infosys", "Wipro",
];

const personas = [
  {
    tag: "CS STUDENTS",
    title: "Crack your campus placement.",
    description:
      "Build a structured DSA foundation with problems weighted by actual interview frequency. Walk in prepared, not panicked.",
    squares: ["#86868b", "#94a3b8", "#d2d2d7", "#e8e8ed"],
    barGradient: "linear-gradient(90deg, #a1a1a6, #d2d2d7)",
  },
  {
    tag: "WORKING PROS",
    title: "Switch to a top company.",
    description:
      "Short on time? Our AI fits the right problems into your schedule. Show up to interviews with a readiness score that proves it.",
    squares: ["#64748b", "#86868b", "#94a3b8", "#d2d2d7"],
    barGradient: "linear-gradient(90deg, #86868b, #a1a1a6)",
  },
  {
    tag: "CAREER SWITCH",
    title: "Break into tech with confidence.",
    description:
      "New to coding? Start from fundamentals and ramp up. Our progression system adapts to your pace.",
    squares: ["#94a3b8", "#c7c7cc", "#d2d2d7", "#e8e8ed"],
    barGradient: "linear-gradient(90deg, #c7c7cc, #d2d2d7)",
  },
  {
    tag: "COMPETITIVE CODERS",
    title: "Sharpen your edge.",
    description:
      "Already strong? Target specific company patterns, fill topic gaps, and build a streak that keeps you sharp.",
    squares: ["#48484a", "#64748b", "#86868b", "#94a3b8"],
    barGradient: "linear-gradient(90deg, #6e6e73, #86868b)",
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [autoStep, setAutoStep] = useState(0);
  const [isMouseOverSteps, setIsMouseOverSteps] = useState(false);
  const [hoveredPersona, setHoveredPersona] = useState<number | null>(null);
  const [autoPersona, setAutoPersona] = useState(0);
  const [isMouseOverPersonas, setIsMouseOverPersonas] = useState(false);

  // Auto-cycle for step cards (1→2→3→4, 2s each)
  useEffect(() => {
    if (isMouseOverSteps) return;
    const timer = setInterval(() => {
      setAutoStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, [isMouseOverSteps]);

  // Auto-cycle for persona cards (1→2→3→4, 2s each)
  useEffect(() => {
    if (isMouseOverPersonas) return;
    const timer = setInterval(() => {
      setAutoPersona((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, [isMouseOverPersonas]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".anim").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#1a1a1a", color: "#e2e8f0" }}>
      <SpaceBackground />

      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(0,0,0,0.72)" : "transparent",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
          backdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" rx="20" fill="url(#logo-grad)" />
              <path
                d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#ffa116" />
                  <stop offset="100%" stopColor="#ff6b35" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col">
              <span
                className="font-bold text-lg leading-tight"
                style={{
                  color: "#e2e8f0",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                AlgoPath
              </span>
              <span
                className="text-[9px] uppercase tracking-[0.2em] leading-none"
                style={{ color: "#64748b" }}
              >
                BY ALGOPATH.DEV
              </span>
            </div>
          </Link>

          {/* Center nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Steps", href: "#steps" },
              { label: "Who It's For", href: "#who" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm transition-colors hover:text-[#fafafa]"
                style={{
                  color: "#94a3b8",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-full transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full transition-all"
              style={{
                background: "linear-gradient(135deg, #ffa116 0%, #ff6b35 100%)",
                color: "#1a1a1a",
              }}
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            style={{ color: "#94a3b8" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden px-6 py-4 space-y-3"
            style={{
              background: "rgba(0,0,0,0.72)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(16px)",
            }}
          >
            {[
              { label: "Steps", href: "#steps" },
              { label: "Who It's For", href: "#who" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-sm"
                style={{ color: "#94a3b8" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div
              className="pt-2 flex flex-col gap-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Link
                href="/login"
                className="text-sm"
                style={{ color: "#94a3b8" }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="glass-btn text-center flex items-center justify-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16" id="steps">
        {/* Hero orb */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] pointer-events-none"
          style={{
            top: "20%",
            right: "10%",
            background: "radial-gradient(circle, rgba(245,245,247,0.03) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Left — Headline */}
            <div className="flex-1 text-center lg:text-left">
              <h1
                className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6"
                style={{ fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif" }}
              >
                <span style={{ color: "#e2e8f0" }}>Stop Grinding</span>
                <br />
                <span style={{ color: "#e2e8f0" }}>Randomly.</span>
                <br />
                <span className="gradient-text">
                  Grind SMART.
                </span>
              </h1>

              <p
                className="text-lg max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0"
                style={{ color: "#94a3b8" }}
              >
                Tell us your target companies and available time. We build your personalized
                week-by-week roadmap from 900+ curated problems.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #ffa116 0%, #ff6b35 100%)",
                    color: "#1a1a1a",
                    boxShadow: "0 2px 12px rgba(255, 161, 22, 0.3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 161, 22, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(255, 161, 22, 0.3)";
                  }}
                >
                  Start For Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#steps"
                  className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                  style={{
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-hover)";
                    e.currentTarget.style.background = "var(--bg-input)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  See How It Works
                </a>
              </div>

              <div className="flex flex-wrap gap-8 items-center justify-center lg:justify-start">
                {[
                  { num: "900+", label: "Problems" },
                  { num: "100+", label: "Companies" },
                  { num: "4-Stage", label: "Revision" },
                  { num: "100%", label: "Free" },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 && (
                      <div className="h-8 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                    )}
                    <div className="text-center lg:text-left">
                      <div
                        className="text-3xl font-bold"
                        style={{
                          color: "#e2e8f0",
                          fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                        }}
                      >
                        {s.num}
                      </div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: "#64748b" }}>
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Step Cards */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div
                className="grid grid-cols-2 gap-4"
                onMouseEnter={() => setIsMouseOverSteps(true)}
                onMouseLeave={() => { setIsMouseOverSteps(false); setHoveredCard(null); }}
              >
                <GlowCard
                  index={0}
                  total={4}
                  number="01"
                  title="Pick Your Path"
                  description="Choose your experience level, timeline, and target companies. Our AI builds the perfect strategy."
                  iconSquares={["#86868b", "#94a3b8", "#d2d2d7", "#e8e8ed"]}
                  accentWord="Pick"
                  wide
                  isHovered={isMouseOverSteps ? hoveredCard !== null : autoStep === 0}
                  hasHover={isMouseOverSteps ? hoveredCard !== null : true}
                  onHover={() => setHoveredCard(0)}
                />
                <GlowCard
                  index={1}
                  total={4}
                  number="02"
                  title="Get Roadmap"
                  description="Receive a personalized week-by-week study plan with curated problems matched to your goals."
                  iconSquares={["#64748b", "#86868b", "#94a3b8", "#d2d2d7"]}
                  accentWord="Get"
                  isHovered={isMouseOverSteps ? hoveredCard !== null : autoStep === 1}
                  hasHover={isMouseOverSteps ? hoveredCard !== null : true}
                  onHover={() => setHoveredCard(1)}
                />
                <GlowCard
                  index={2}
                  total={4}
                  number="03"
                  title="Do Problems"
                  description="Work through problems on LeetCode, track progress with a single click, and get AI study notes."
                  iconSquares={["#94a3b8", "#c7c7cc", "#d2d2d7", "#e8e8ed"]}
                  accentWord="Do"
                  isHovered={isMouseOverSteps ? hoveredCard !== null : autoStep === 2}
                  hasHover={isMouseOverSteps ? hoveredCard !== null : true}
                  onHover={() => setHoveredCard(2)}
                />
                <GlowCard
                  index={3}
                  total={4}
                  number="04"
                  title="Get Hired"
                  description="Spaced repetition at 2d, 7d, 21d, 45d intervals ensures you never forget what you learned."
                  iconSquares={["#48484a", "#64748b", "#86868b", "#94a3b8"]}
                  accentWord="Get"
                  wide
                  isHovered={isMouseOverSteps ? hoveredCard !== null : autoStep === 3}
                  hasHover={isMouseOverSteps ? hoveredCard !== null : true}
                  onHover={() => setHoveredCard(3)}
                />
              </div>

              {/* Meta strip */}
              <div
                className="mt-4 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] font-semibold"
                style={{ color: "#64748b" }}
              >
                <span>ALGOPATH</span>
                <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                <span>VERIFIED PROOF OF SKILLS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Company Logos Marquee ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
      <section className="py-16 overflow-hidden">
        <p
          className="text-center text-xs mb-8 uppercase tracking-wider font-medium"
          style={{ color: "#64748b" }}
        >
          Trusted by developers from
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #000000, transparent)" }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #000000, transparent)" }}
          />

          {/* Row 1 — forward */}
          <div className="flex whitespace-nowrap mb-4" style={{ animation: "marquee 30s linear infinite" }}>
            {[...companies, ...companies].map((name, i) => (
              <span
                key={`r1-${i}`}
                className="mx-6 px-5 py-2 rounded-full text-sm font-semibold shrink-0"
                style={{
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {name}
              </span>
            ))}
          </div>

          {/* Row 2 — reverse */}
          <div className="flex whitespace-nowrap" style={{ animation: "marqueeReverse 35s linear infinite" }}>
            {[...companies, ...companies].reverse().map((name, i) => (
              <span
                key={`r2-${i}`}
                className="mx-6 px-5 py-2 rounded-full text-sm font-semibold shrink-0"
                style={{
                  color: "#94a3b8",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* ── Who Is It For ── */}
      <section id="who" className="relative py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-12">
            <h2
              className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
              style={{
                color: "#e2e8f0",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
              Who is it for?
            </h2>
            <p className="text-lg" style={{ color: "#94a3b8" }}>
              Preparing for placements? OA rounds? Building problem-solving skills?
              AlgoPath is built for you.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            onMouseEnter={() => setIsMouseOverPersonas(true)}
            onMouseLeave={() => setIsMouseOverPersonas(false)}
          >
            {personas.map((card, i) => {
              const isActive = isMouseOverPersonas ? hoveredPersona !== null : autoPersona === i;
              const isBlurred = isMouseOverPersonas
                ? hoveredPersona !== null && !isActive
                : autoPersona !== i;
              return (
              <div
                key={card.tag}
                className="group relative rounded-2xl p-6 transition-all duration-500 cursor-pointer"
                style={{
                  background: isActive ? "rgba(255, 255, 255, 0.08)" : "var(--bg-card)",
                  border: isActive ? "1px solid var(--border-hover)" : "1px solid var(--border)",
                  boxShadow: isActive ? "var(--shadow-md)" : "none",
                  backdropFilter: "blur(12px)",
                  opacity: isBlurred ? 0.3 : 1,
                  filter: isBlurred ? "blur(4px)" : "none",
                  transform: isActive ? "scale(1.02)" : isBlurred ? "scale(0.97)" : "none",
                }}
                onMouseEnter={() => setHoveredPersona(i)}
                onMouseLeave={() => setHoveredPersona(null)}
              >
                {/* Icon grid */}
                <div className="flex items-start justify-between mb-6">
                  <div className="grid grid-cols-2 gap-1">
                    {card.squares.map((color, j) => (
                      <div
                        key={j}
                        className="w-4 h-4 rounded-sm transition-all duration-500"
                        style={{
                          background: color,
                          opacity: isActive ? 1 : 0.6,
                        }}
                      />
                    ))}
                  </div>
                  <div
                    className="w-2 h-2 rounded-full transition-all duration-500"
                    style={{
                      background: isActive ? "rgba(255, 161, 22, 0.5)" : "rgba(255,255,255,0.1)",
                      boxShadow: isActive ? "0 0 6px rgba(255, 161, 22, 0.3)" : "none",
                    }}
                  />
                </div>

                {/* Label */}
                <p
                  className="text-xs font-semibold tracking-[0.15em] uppercase mb-2"
                  style={{ color: "#94a3b8" }}
                >
                  {card.tag}
                </p>

                {/* Title */}
                <h3
                  className="text-xl font-semibold mb-3"
                  style={{
                    color: "#e2e8f0",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed transition-colors duration-500" style={{ color: isActive ? "#d2d2d7" : "#94a3b8" }}>
                  {card.description}
                </p>

                {/* Bottom progress bar */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full mt-6"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full origin-left transition-all duration-500"
                    style={{
                      width: "100%",
                      background: isActive
                        ? "linear-gradient(90deg, #ffa116, #94a3b8)"
                        : card.barGradient,
                      opacity: isActive ? 0.8 : 0.5,
                      transform: "scaleX(1)",
                    }}
                  />
                </div>

                {/* Corner accent */}
                <div
                  className="absolute top-6 right-6 w-2 h-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                />
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* ── FAQ ── */}
      <section id="faq" className="relative py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <FAQAccordion />
        </div>
      </section>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* ── Final CTA ── */}
      <section className="relative py-20 flex items-center justify-center">
        {/* CTA orb */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-[0.05] pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(245,245,247,0.03) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 w-full relative z-10">
          <div
            className="rounded-2xl p-12 md:p-16 relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative z-10">
              <h2
                className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
                style={{
                  color: "#e2e8f0",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Ready to start?
              </h2>
              <p className="text-lg mb-2" style={{ color: "#94a3b8" }}>
                Ready to prove what you can do?
              </p>
              <p className="text-base mb-10 max-w-xl" style={{ color: "#64748b" }}>
                Pick a problem set, follow the roadmap, track your progress. Your first
                personalized interview prep starts here.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, #ffa116 0%, #ff6b35 100%)",
                    color: "#1a1a1a",
                  }}
                >
                  Sign In / Sign Up
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#steps"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
                  style={{
                    border: "1px solid var(--border-strong)",
                    color: "var(--text-primary)",
                  }}
                >
                  View Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          padding: "3rem 1.5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "2rem",
              marginBottom: "2rem",
            }}
          >
            {/* Brand */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" rx="20" fill="url(#footer-logo-grad)" />
                  <path
                    d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="footer-logo-grad" x1="0" y1="0" x2="100" y2="100">
                      <stop offset="0%" stopColor="#ffa116" />
                      <stop offset="100%" stopColor="#ff6b35" />
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#e2e8f0",
                      fontSize: "0.95rem",
                      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                    }}
                  >
                    AlgoPath
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "8px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#64748b",
                    }}
                  >
                    SMART LEETCODE PREP
                  </span>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.8rem", maxWidth: 220, lineHeight: 1.6 }}>
                Personalized DSA roadmaps for placement and OA preparation. Free forever.
              </p>
            </div>

            {/* Links columns */}
            <div style={{ display: "flex", gap: "3rem", flexWrap: "wrap" }}>
              <div>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Product
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { label: "Features", href: "#steps" },
                    { label: "Who It's For", href: "#who" },
                    { label: "FAQ", href: "#faq" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        color: "#64748b",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Legal
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Cookie Policy", href: "/cookies" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        color: "#64748b",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p
                  style={{
                    color: "#e2e8f0",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Connect
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {[
                    { label: "GitHub", href: "https://github.com/arpit1021-ux/AlgoPath" },
                    { label: "LinkedIn", href: "https://linkedin.com" },
                    { label: "Contact", href: "mailto:hello@algopath.dev" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      style={{
                        color: "#64748b",
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "1.5rem 0" }} />

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
              &copy; 2026 AlgoPath. All rights reserved. Built for developers preparing for
              placements and OA rounds.
            </p>
            <p style={{ color: "#64748b", fontSize: "0.75rem" }}>
              Not affiliated with LeetCode or any company mentioned.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
