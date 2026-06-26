"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap, ChevronRight, Check, ArrowRight, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [counters, setCounters] = useState({ problems: 0, companies: 0, stages: 0, free: 0 });
  const statsRef = useState<HTMLElement | null>(null);
  const statsAnimated = useState(false);

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

  useEffect(() => {
    const statsEl = document.getElementById("stats-banner");
    if (!statsEl) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !statsAnimated[0]) {
        statsAnimated[1](true);
        const targets = { problems: 900, companies: 100, stages: 4, free: 100 };
        const duration = 1800;
        const start = performance.now();
        const tick = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCounters({
            problems: Math.round(ease * targets.problems),
            companies: Math.round(ease * targets.companies),
            stages: Math.round(ease * targets.stages),
            free: Math.round(ease * targets.free),
          });
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(statsEl);
    return () => obs.disconnect();
  }, [statsAnimated]);

  useEffect(() => {
    const grid = document.getElementById("hero-iso-grid");
    const wrapper = document.getElementById("hero-iso-wrapper");
    if (!grid || !wrapper) return;

    let targetX = -22;
    let targetY = 18;
    let currentX = -22;
    let currentY = 18;
    let animId: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = -22 + x * 18;
      targetY = 18 - y * 14;
    };

    const animate = () => {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);
      grid.style.transform = `rotateX(${currentY}deg) rotateY(${currentX}deg)`;
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallax || "0.1");
            const rect = el.getBoundingClientRect();
            if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
              el.style.transform = `translateY(${scrollY * speed}px)`;
            }
          });
          document.querySelectorAll<HTMLElement>("[data-parallax-x]").forEach((el) => {
            const speed = parseFloat(el.dataset.parallaxX || "0.05");
            el.style.transform = `translateX(${scrollY * speed}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <style jsx global>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 30s linear infinite; }

        .feature-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }
        .feature-card:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 30%, #c4b5fd 50%, #818cf8 70%, #2563eb 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .cta-glow {
          position: relative;
          overflow: hidden;
        }
        .cta-glow::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, #7c3aed, #2563eb, #7c3aed);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          z-index: -1;
          opacity: 0.5;
          filter: blur(12px);
        }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
      `}</style>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "var(--navbar-bg)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "none",
          backdropFilter: scrolled ? "blur(16px)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>InterviewPilot</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>Features</a>
            <a href="#how-it-works" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>How It Works</a>
            <a href="#pricing" className="text-sm transition-colors" style={{ color: "var(--text-secondary)" }}>Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium px-4 py-2 transition-colors" style={{ color: "var(--text-secondary)" }}>Sign In</Link>
            <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 transition-opacity">Get Started</Link>
          </div>
          <button className="md:hidden" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden px-6 py-4 space-y-3" style={{ background: "var(--navbar-bg)", borderTop: "1px solid var(--border)", backdropFilter: "blur(16px)" }}>
            <a href="#features" className="block text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#pricing" className="block text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>Pricing</a>
            <div className="pt-2 flex flex-col gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <Link href="/login" className="text-sm" style={{ color: "var(--text-secondary)" }} onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/register" className="text-sm font-semibold text-white px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#2563eb] text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16 pb-24">
        {/* Background layers */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7c3aed]/8 rounded-full blur-[140px] float-1" data-parallax="-0.05" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#2563eb]/6 rounded-full blur-[120px] float-2" data-parallax="0.08" />

        {/* Floating accent orbs */}
        <div className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-[#7c3aed]/30 float-3" data-parallax="-0.12" />
        <div className="absolute bottom-[20%] left-[8%] w-2 h-2 rounded-full bg-[#2563eb]/25 float-4" data-parallax="0.15" />
        <div className="absolute top-[60%] right-[20%] w-1.5 h-1.5 rounded-full bg-[#a78bfa]/20 float-1" data-parallax="-0.08" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — Headline */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="anim from-bottom text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] mb-6">
                <span style={{ color: "var(--text-primary)" }}>Stop Grinding</span>
                <br />
                <span style={{ color: "var(--text-primary)" }}>Randomly.</span>
                <br />
                <span className="hero-gradient-text">
                  Grind SMART.
                </span>
              </h1>

              <p className="anim from-bottom anim-d3 text-lg max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0" style={{ color: "var(--text-secondary)" }}>
                Tell us your target companies and available time. We build your personalized
                week-by-week roadmap from 900+ curated problems.
              </p>

              <div className="anim from-bottom anim-d4 flex flex-col sm:flex-row items-center gap-4 mb-10 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="cta-glow text-base font-semibold text-white px-8 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:brightness-110 transition-all flex items-center gap-2"
                >
                  Start For Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="text-base font-medium px-8 py-4 rounded-xl transition-all"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                >
                  See How It Works
                </a>
              </div>

              <div className="anim from-bottom anim-d5 flex flex-wrap gap-8 items-center justify-center lg:justify-start">
                {[
                  { num: "900+", label: "Problems" },
                  { num: "100+", label: "Companies" },
                  { num: "4-Stage", label: "Revision" },
                  { num: "100%", label: "Free" },
                ].map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 && <div className="h-8 w-px" style={{ background: "var(--border)" }} />}
                    <div className="text-center lg:text-left">
                      <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{s.num}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — 3D Isometric Grid with mouse parallax */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none anim from-scale anim-d3" id="hero-iso-wrapper">
              <div
                id="hero-iso-scene"
                className="relative w-full aspect-square max-w-[520px] mx-auto"
                style={{ perspective: "1200px" }}
              >
                <div
                  id="hero-iso-grid"
                  className="w-full h-full relative"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "rotateX(18deg) rotateY(-22deg)",
                  }}
                >
                  {/* Isometric grid floor */}
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(37,99,235,0.04) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      transform: "translateZ(-20px)",
                    }}
                  />

                  {/* Grid lines */}
                  <div className="absolute inset-0 rounded-3xl overflow-hidden" style={{ transform: "translateZ(-10px)" }}>
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                      backgroundSize: "52px 52px",
                    }} />
                  </div>

                  {/* Floating glass cells — layer 1 (far) */}
                  <div className="iso-cell absolute top-[8%] left-[5%] w-[42%] rounded-2xl p-4 backdrop-blur-xl float-1" style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(37,99,235,0.08) 100%)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    transform: "translateZ(30px)",
                    boxShadow: "0 8px 32px rgba(124,58,237,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#22c55e]/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#22c55e]" />
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Week Progress</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--border)] mb-2 overflow-hidden">
                      <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#22c55e] to-[#22c55e]/60 transition-all duration-1000" />
                    </div>
                    <div className="flex justify-between text-[9px] text-[var(--muted-foreground)]">
                      <span>9/12 solved</span>
                      <span className="text-[#22c55e]">72%</span>
                    </div>
                  </div>

                  {/* Floating glass cells — layer 2 */}
                  <div className="iso-cell absolute top-[5%] right-[2%] w-[48%] rounded-2xl p-4 backdrop-blur-xl float-2" style={{
                    background: "linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(6,182,212,0.06) 100%)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    transform: "translateZ(55px)",
                    boxShadow: "0 12px 40px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Current Week</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#7c3aed]/20 text-[#a78bfa] font-semibold uppercase">Active</span>
                    </div>
                    <div className="space-y-1.5">
                      {["Two Sum", "Valid Parentheses", "LRU Cache"].map((name, i) => (
                        <div key={name} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm flex items-center justify-center ${i < 2 ? "bg-[#22c55e]/20 border border-[#22c55e]/30" : "border border-white/10"}`}>
                            {i < 2 && <Check className="w-2 h-2 text-[#22c55e]" />}
                          </div>
                          <span className={`text-[10px] ${i < 2 ? "line-through" : ""}`} style={{ color: i < 2 ? "var(--text-muted)" : "var(--text-secondary)" }}>{name}</span>
                          <span className={`text-[8px] ml-auto ${i === 2 ? "text-[#ef4444]" : "text-[#22c55e]"}`}>{i === 2 ? "Hard" : "Easy"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating glass cells — layer 3 (near, large) */}
                  <div className="iso-cell absolute bottom-[12%] left-[2%] w-[55%] rounded-2xl p-4 backdrop-blur-xl float-3" style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(37,99,235,0.05) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transform: "translateZ(70px)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-md bg-[#7c3aed]/20 flex items-center justify-center">
                        <span className="text-[10px]">🎯</span>
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Readiness Score</span>
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-bold text-[var(--foreground)]">73</span>
                      <span className="text-xs text-[#22c55e] mb-1">/100</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { label: "Topics", val: 82, color: "#7c3aed" },
                        { label: "Diff.", val: 65, color: "#2563eb" },
                        { label: "Rev.", val: 78, color: "#22c55e" },
                        { label: "Company", val: 70, color: "#f59e0b" },
                      ].map((m) => (
                        <div key={m.label} className="text-center">
                          <div className="h-12 rounded-md relative overflow-hidden bg-white/[0.04] mb-1">
                            <div className="absolute bottom-0 left-0 right-0 rounded-md transition-all duration-1000" style={{ height: `${m.val}%`, background: `${m.color}33` }} />
                          </div>
                          <span className="text-[7px] text-[var(--muted-foreground)]">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Floating glass cells — layer 4 */}
                  <div className="iso-cell absolute bottom-[8%] right-[4%] w-[40%] rounded-2xl p-4 backdrop-blur-xl float-4" style={{
                    background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(239,68,68,0.05) 100%)",
                    border: "1px solid rgba(245,158,11,0.15)",
                    transform: "translateZ(45px)",
                    boxShadow: "0 10px 36px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px]">🔄</span>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>Revisions Due</span>
                    </div>
                    <div className="text-xl font-bold text-[var(--foreground)] mb-1">3</div>
                    <div className="flex items-center gap-1">
                      {["2d", "7d", "21d", "45d"].map((d, i) => (
                        <span key={d} className="flex items-center gap-0.5">
                          <span className={`text-[7px] px-1 py-0.5 rounded ${i === 0 ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "bg-[var(--border)] text-[var(--muted-foreground)]"}`}>{d}</span>
                          {i < 3 && <span className="text-[7px] text-[var(--muted-foreground)]">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Floating particle accents */}
                  <div className="absolute top-[35%] left-[48%] w-2 h-2 rounded-full bg-[#7c3aed]/40 animate-pulse float-2" style={{ transform: "translateZ(90px)" }} />
                  <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 rounded-full bg-[#2563eb]/50 animate-pulse float-3" style={{ transform: "translateZ(80px)" }} />
                  <div className="absolute top-[20%] right-[35%] w-1 h-1 rounded-full bg-[#22c55e]/40 animate-pulse float-1" style={{ transform: "translateZ(100px)" }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Company Logos Marquee */}
      <div className="section-divider" />
      <section className="py-16 overflow-hidden" data-parallax="0.03">
        <p className="anim from-bottom text-center text-xs mb-8 uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>Trusted by developers from</p>
        <div className="relative">
          <div className="flex marquee-track whitespace-nowrap">
            {["Google", "Meta", "Amazon", "Microsoft", "Apple", "TCS", "Infosys", "Wipro", "Goldman Sachs", "Bloomberg", "Adobe", "Uber", "Netflix", "Stripe"].map((name) => (
              <span key={name} className="mx-8 text-lg font-bold shrink-0 transition-colors duration-500" style={{ color: "var(--text-muted)" }}>{name}</span>
            ))}
            {["Google", "Meta", "Amazon", "Microsoft", "Apple", "TCS", "Infosys", "Wipro", "Goldman Sachs", "Bloomberg", "Adobe", "Uber", "Netflix", "Stripe"].map((name) => (
              <span key={name + "2"} className="mx-8 text-lg font-bold shrink-0 transition-colors duration-500" style={{ color: "var(--text-muted)" }}>{name}</span>
            ))}
          </div>
        </div>
      </section>
      <div className="section-divider" />

      {/* Features */}
      <section id="features" className="relative py-20" data-parallax="-0.02">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <span className="anim from-bottom inline-block text-xs font-semibold tracking-[0.2em] mb-4 uppercase" style={{ color: "var(--accent-text)" }}>Powerful Features</span>
            <h2 className="anim from-bottom anim-d1 text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
              Everything You Need to
              <br />
              <span className="hero-gradient-text">Ace Your Interview</span>
            </h2>
            <p className="anim from-bottom anim-d2 max-w-lg mx-auto" style={{ color: "var(--text-secondary)" }}>
              No more guessing what to study. InterviewPilot gives you a complete system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: "🧠", title: "AI-Driven Scheduling", desc: "Time-boxed to YOUR schedule. 8h/week? We fit exactly the right problems.", d: "anim-d1" },
              { emoji: "🏢", title: "FAANG Targeting", desc: "Filter by Google, Meta, Amazon. Weighted by actual interview frequency.", d: "anim-d2" },
              { emoji: "📈", title: "Smart Progression", desc: "Easy → Medium → Hard. Ramps difficulty as your interview approaches.", d: "anim-d3" },
              { emoji: "🔄", title: "Spaced Repetition", desc: "Auto-schedules reviews at 2d, 7d, 21d, 45d intervals. Never forget a solution.", d: "anim-d4" },
              { emoji: "📊", title: "Readiness Score", desc: "Real-time score across topic coverage, difficulty, consistency, and company fit.", d: "anim-d5" },
              { emoji: "✅", title: "Topic Balancing", desc: "No DP burnout. Automatically mixes Arrays, Graphs, Trees, and more.", d: "anim-d6" },
            ].map((f) => (
              <div key={f.title} className={`anim from-bottom feature-card p-7 ${f.d}`}>
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20" data-parallax="0.02">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <span className="anim from-bottom inline-block text-xs font-semibold tracking-[0.2em] text-[#7c3aed] mb-4 uppercase">
              How It Works
            </span>
            <h2 className="anim from-bottom anim-d1 text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
              From Zero to
              <br />
              <span className="bg-gradient-to-r from-[#7c3aed] to-[#2563eb] bg-clip-text text-transparent">
                Interview Ready
              </span>
            </h2>
          </div>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="anim from-left flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="gradient-text leading-none mb-2 select-none" style={{ fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 900, opacity: 0.2 }}>1</div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Set Your Goals</h3>
                <p className="leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                  Choose your experience level, timeline, weekly hours, and target companies.
                  Our AI analyzes your inputs to build the perfect preparation strategy.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] p-6 space-y-5" style={{ border: "1px solid var(--border)", background: "var(--card)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", borderRadius: 16 }}>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Experience</div>
                    <div className="flex gap-2">
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)]">Beginner</span>
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#a78bfa]">Intermediate ✓</span>
                      <span className="text-[11px] px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)]">Expert</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Timeline</div>
                    <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]" />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
                      <span>1 week</span>
                      <span className="text-[#a78bfa]">4 Weeks</span>
                      <span>24 weeks</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-2 uppercase tracking-wider">Target Companies</div>
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
            <div className="anim from-right flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="gradient-text leading-none mb-2 select-none" style={{ fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 900, opacity: 0.2 }}>2</div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Get Your Roadmap</h3>
                <p className="leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                  Receive a personalized week-by-week study plan with carefully curated
                  problems matched to your goals.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] p-6" style={{ border: "1px solid var(--border)", background: "var(--card)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", borderRadius: 16 }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">Week 1</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#2563eb]" />
                      </div>
                      <span className="text-[10px] text-[var(--muted-foreground)]">3/8</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[{ name: "Two Sum", diff: "Easy", diffColor: "text-[#22c55e]/70" }, { name: "Valid Parentheses", diff: "Medium", diffColor: "text-[#f59e0b]/70" }, { name: "Trapping Rain Water", diff: "Hard", diffColor: "text-[#ef4444]/70" }].map((p) => (
                      <div key={p.name} className="flex items-center gap-3 py-1.5">
                        <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center shrink-0" />
                        <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>{p.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${p.diffColor}`}>{p.diff}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="anim from-left flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="gradient-text leading-none mb-2 select-none" style={{ fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 900, opacity: 0.2 }}>3</div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Solve & Track</h3>
                <p className="leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                  Work through problems directly on LeetCode, track your progress
                  with a single click, and get AI-generated study notes.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] p-6" style={{ border: "1px solid var(--border)", background: "var(--card)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", borderRadius: 16 }}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] line-through flex-1">Two Sum</span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)] line-through flex-1">Valid Parentheses</span>
                    </div>
                    <div className="flex items-center gap-3 py-1.5">
                      <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center shrink-0" />
                        <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>Merge Intervals</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted-foreground)]">Arrays</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted-foreground)]">Hashing</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#22c55e]">7/54 SOLVED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="anim from-right flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-16">
              <div className="flex-1">
                <div className="gradient-text leading-none mb-2 select-none" style={{ fontSize: "clamp(6rem, 15vw, 10rem)", fontWeight: 900, opacity: 0.2 }}>4</div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Revise & Master</h3>
                <p className="leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
                  Our spaced repetition engine automatically schedules revisions at
                  optimal intervals to ensure you never forget what you learned.
                </p>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-full max-w-[340px] p-6" style={{ border: "1px solid var(--border)", background: "var(--card)", backdropFilter: "blur(12px)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", borderRadius: 16 }}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">Due Today: 3</span>
                  </div>
                  <div className="space-y-2">
                    {[{ problem: "Two Sum" }, { problem: "Valid Parentheses" }].map((r) => (
                      <div key={r.problem} className="flex items-center justify-between py-1.5">
                        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.problem}</span>
                        <button className="text-[10px] px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">Done</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--muted-foreground)]">Revision Intervals</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {["2d", "7d", "21d", "45d"].map((d, i) => (
                        <span key={d} className="flex items-center gap-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--border)] text-[var(--muted-foreground)]">{d}</span>
                          {i < 3 && <span className="text-[10px] text-[var(--muted-foreground)]">→</span>}
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
      <div className="section-divider" />
      <section id="stats-banner" className="relative py-20 overflow-hidden" data-parallax="-0.01">
        <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, var(--accent-dim), transparent, var(--accent-dim))" }} />
        <div className="absolute inset-0" style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: counters.problems, suffix: "+", label: "Curated Problems" },
              { value: counters.companies, suffix: "+", label: "Target Companies" },
              { value: counters.stages, suffix: "-Stage", label: "Revision System" },
              { value: counters.free, suffix: "%", label: "Free Forever" },
            ].map((s) => (
              <div key={s.label} className="text-center anim from-bottom py-4">
                <div className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {s.value}{s.suffix}
                </div>
                <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="section-divider" />

      {/* CTA */}
      <section className="relative py-20 flex items-center justify-center min-h-[50vh]" id="pricing" data-parallax="0.02">
        <div className="max-w-3xl mx-auto px-6 text-center w-full">
          <div className="anim from-scale p-12 md:p-16 relative overflow-hidden" style={{ animation: "glow 4s ease-in-out infinite", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#7c3aed]/5 to-[#2563eb]/5" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: "var(--text-primary)" }}>
                Ready to Grind{" "}
                <span className="hero-gradient-text">SMART?</span>
              </h2>
              <p className="max-w-md mx-auto mb-8" style={{ color: "var(--text-secondary)" }}>
                No credit card required. No subscription needed.
                Start building your personalized interview roadmap today.
              </p>
              <Link href="/dashboard" className="cta-glow inline-flex items-center gap-2 text-base font-semibold text-white px-8 py-4 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:brightness-110 transition-all">
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#2563eb] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>InterviewPilot</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            <a href="#features" className="transition-colors" style={{ color: "inherit" }}>Features</a>
            <a href="#how-it-works" className="transition-colors" style={{ color: "inherit" }}>How It Works</a>
            <a href="https://github.com/arpit1021-ux" target="_blank" rel="noopener noreferrer" className="transition-colors" style={{ color: "inherit" }}>GitHub</a>
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} InterviewPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
