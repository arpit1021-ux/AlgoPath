"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ChevronRight, Check, ArrowRight, Menu, X } from "lucide-react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      { threshold: 0.1 }
    );
    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.08]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
              InterviewPilot
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
              Pricing
            </a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/60 hover:text-white transition-colors font-medium px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
          <button
            className="md:hidden text-white/60 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.08] px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-sm text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>Pricing</a>
            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              <Link href="/login" className="text-sm text-white/60 hover:text-white" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-24">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#7c3aed]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-[#2563eb]/8 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="animate-on-scroll inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/5 mb-8">
            <span className="text-[#a78bfa] text-xs">✦</span>
            <span className="text-xs font-medium text-[#a78bfa]">AI-Powered Interview Prep</span>
          </div>

          {/* H1 */}
          <h1 className="animate-on-scroll text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] mb-6">
            <span className="text-white">Stop Grinding</span>
            <br />
            <span className="text-white">Randomly.</span>
            <br />
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
              Grind SMART.
            </span>
          </h1>

          {/* Subtext */}
          <p className="animate-on-scroll text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tell us your target companies and available time. We build your personalized
            week-by-week roadmap from 3,000+ curated problems.
          </p>

          {/* CTAs */}
          <div className="animate-on-scroll flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/register"
              className="text-base font-semibold text-white px-8 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start For Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#how-it-works"
              className="text-base font-medium text-white/60 px-8 py-4 rounded-xl border border-white/[0.08] hover:bg-white/[0.04] transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div className="animate-on-scroll flex flex-wrap justify-center gap-6 sm:gap-8 text-sm text-white/40">
            <span>914 Problems Curated</span>
            <span className="text-white/10">|</span>
            <span>100+ Target Companies</span>
            <span className="text-white/10">|</span>
            <span>4-Stage Revision</span>
            <span className="text-white/10">|</span>
            <span>100% Free</span>
          </div>

          {/* Hero Mockup */}
          <div className="animate-on-scroll mt-16 mx-auto max-w-xl">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <div className="w-3 h-3 rounded-full bg-white/10" />
                <span className="ml-2 text-xs text-white/30">Your Roadmap</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/50 w-16 shrink-0">Week 1</span>
                  <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#7c3aed]/20 to-[#7c3aed]/5 flex items-center px-3">
                    <div className="h-1.5 w-3/4 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#2563eb]/15 text-[#60a5fa] border border-[#2563eb]/20">Google</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/50 w-16 shrink-0">Week 2</span>
                  <div className="flex-1 h-8 rounded-lg bg-gradient-to-r from-[#2563eb]/20 to-[#2563eb]/5 flex items-center px-3">
                    <div className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#f97316]/15 text-[#fb923c] border border-[#f97316]/20">Amazon</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/50 w-16 shrink-0">Week 3</span>
                  <div className="flex-1 h-8 rounded-lg bg-white/[0.04] flex items-center px-3">
                    <div className="h-1.5 w-1/3 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/20">Meta</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-white/50 w-16 shrink-0">Week 4</span>
                  <div className="flex-1 h-8 rounded-lg bg-white/[0.04] flex items-center px-3">
                    <div className="h-1.5 w-2/5 rounded-full bg-white/10" />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/20">Apple</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <section className="py-12 overflow-hidden border-t border-white/[0.04]">
        <p className="text-center text-xs text-white/30 mb-6 uppercase tracking-wider font-medium">Trusted by developers from</p>
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {["Google", "Meta", "Amazon", "Microsoft", "Apple", "TCS", "Infosys", "Wipro", "Goldman Sachs", "Bloomberg", "Adobe", "Uber", "Netflix", "Stripe"].map((name) => (
              <span key={name} className="mx-8 text-lg font-bold text-white/10 shrink-0">{name}</span>
            ))}
            {["Google", "Meta", "Amazon", "Microsoft", "Apple", "TCS", "Infosys", "Wipro", "Goldman Sachs", "Bloomberg", "Adobe", "Uber", "Netflix", "Stripe"].map((name) => (
              <span key={name + "2"} className="mx-8 text-lg font-bold text-white/10 shrink-0">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="animate-on-scroll inline-block text-xs font-semibold tracking-[0.2em] text-[#7c3aed] mb-4 uppercase">
              Powerful Features
            </span>
            <h2 className="animate-on-scroll text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
                Ace Your Interview
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "🧠",
                title: "AI-Driven Scheduling",
                desc: "Time-boxed to YOUR schedule. 8h/week? We fit exactly the right problems.",
                delay: "0.1s",
              },
              {
                emoji: "🏢",
                title: "FAANG Targeting",
                desc: "Filter by Google, Meta, Amazon. Weighted by actual interview frequency.",
                delay: "0.2s",
              },
              {
                emoji: "📈",
                title: "Smart Progression",
                desc: "Easy → Medium → Hard. Ramps difficulty as your interview approaches.",
                delay: "0.3s",
              },
              {
                emoji: "🔄",
                title: "Spaced Repetition",
                desc: "Auto-schedules reviews at 2d, 7d, 21d, 45d intervals. Never forget a solution.",
                delay: "0.1s",
              },
              {
                emoji: "📊",
                title: "Readiness Score",
                desc: "Real-time score across topic coverage, difficulty, consistency, and company fit.",
                delay: "0.2s",
              },
              {
                emoji: "✅",
                title: "Topic Balancing",
                desc: "No DP burnout. Automatically mixes Arrays, Graphs, Trees, and more.",
                delay: "0.3s",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="animate-on-scroll rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-8 hover:bg-white/[0.05] transition-colors"
                style={{ animationDelay: f.delay }}
              >
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="animate-on-scroll text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              From Zero to
              <br />
              <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
                Interview Ready
              </span>
            </h2>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="animate-on-scroll flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="text-[120px] font-black text-white/[0.04] leading-none mb-2 select-none">1</div>
                <h3 className="text-2xl font-bold text-white mb-3">Set Your Goals</h3>
                <p className="text-white/40 leading-relaxed max-w-md">
                  Choose your experience level, timeline, weekly hours, and target companies.
                  Our AI analyzes your inputs to build the perfect preparation strategy.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 space-y-5">
                  <div>
                    <div className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Experience</div>
                    <div className="flex gap-2">
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40">Beginner</span>
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#a78bfa]">Intermediate ✓</span>
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-white/[0.08] text-white/40">Expert</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Timeline</div>
                    <div className="h-2 rounded-full bg-white/[0.06]">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-1">
                      <span>1 week</span>
                      <span className="text-[#a78bfa]">4 Weeks</span>
                      <span>24 weeks</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 mb-2 uppercase tracking-wider">Target Companies</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[10px] px-2 py-1 rounded bg-[#2563eb]/10 text-[#60a5fa] border border-[#2563eb]/20">Google</span>
                      <span className="text-[10px] px-2 py-1 rounded bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/20">Amazon</span>
                      <span className="text-[10px] px-2 py-1 rounded bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20">Meta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="animate-on-scroll flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="text-[120px] font-black text-white/[0.04] leading-none mb-2 select-none">2</div>
                <h3 className="text-2xl font-bold text-white mb-3">Get Your Roadmap</h3>
                <p className="text-white/40 leading-relaxed max-w-md">
                  Receive a personalized week-by-week study plan with carefully curated
                  problems matched to your goals.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-white/50">Week 1</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]" />
                      </div>
                      <span className="text-[10px] text-white/30">3/8</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[{ name: "Two Sum", diff: "Easy", diffColor: "text-[#22c55e]/70" }, { name: "Valid Parentheses", diff: "Medium", diffColor: "text-[#f59e0b]/70" }, { name: "Trapping Rain Water", diff: "Hard", diffColor: "text-[#ef4444]/70" }].map((p) => (
                      <div key={p.name} className="flex items-center gap-3 py-1.5">
                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center shrink-0" />
                        <span className="text-xs text-white/60 flex-1">{p.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.diffColor}`}>{p.diff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="animate-on-scroll flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="text-[120px] font-black text-white/[0.04] leading-none mb-2 select-none">3</div>
                <h3 className="text-2xl font-bold text-white mb-3">Solve & Track</h3>
                <p className="text-white/40 leading-relaxed max-w-md">
                  Work through problems directly on LeetCode, track your progress
                  with a single click, and get AI-generated study notes.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                      </div>
                      <span className="text-xs text-white/30 line-through flex-1">Two Sum</span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                      </div>
                      <span className="text-xs text-white/30 line-through flex-1">Valid Parentheses</span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center shrink-0" />
                      <span className="text-xs text-white/60 flex-1">Merge Intervals</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40">Arrays</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40">Hashing</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#22c55e]">7/54 SOLVED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="animate-on-scroll flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="text-[120px] font-black text-white/[0.04] leading-none mb-2 select-none">4</div>
                <h3 className="text-2xl font-bold text-white mb-3">Revise & Master</h3>
                <p className="text-white/40 leading-relaxed max-w-md">
                  Our spaced repetition engine automatically schedules revisions at
                  optimal intervals to ensure you never forget what you learned.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-white/50">Due Today: 3</span>
                  </div>
                  <div className="space-y-2">
                    {[{ problem: "Two Sum" }, { problem: "Valid Parentheses" }].map((r) => (
                      <div key={r.problem} className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-white/50">{r.problem}</span>
                        <button className="text-[10px] px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Done</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-white/30">Revision Intervals</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {["2d", "7d", "21d", "45d"].map((d, i) => (
                        <span key={d} className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/40">{d}</span>
                          {i < 3 && <span className="text-[10px] text-white/20">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/10 via-[#2563eb]/10 to-[#7c3aed]/10" />
        <div className="absolute inset-0 border-y border-white/[0.08]" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "914", label: "Problems Curated" },
              { value: "100+", label: "Target Companies" },
              { value: "4", label: "Stage Revision System" },
              { value: "100%", label: "Free" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-sm text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="animate-on-scroll rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 to-[#2563eb]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Ready to Grind{" "}
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
                  SMART?
                </span>
              </h2>
              <p className="text-white/40 max-w-md mx-auto mb-8">
                No credit card required. No subscription needed.
                Start building your personalized interview roadmap today.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-white">InterviewPilot</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} InterviewPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
