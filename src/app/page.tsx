import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthCTA, AuthCTASecondary, AuthCTAFooter } from "@/components/landing/auth-cta";
import {
  ArrowRight,
  Brain,
  Target,
  Calendar,
  BarChart3,
  Zap,
  Trophy,
  Sparkles,
  Code2,
  Users,
  ChevronRight,
  Rocket,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Roadmaps",
    description:
      "AI-generated study plans adapted to your experience, timeline, and target companies.",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Target,
    title: "Company Targeting",
    description:
      "Prioritize questions from Google, Meta, Amazon with real company frequency data.",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Calendar,
    title: "Spaced Repetition",
    description:
      "Automatic revision scheduling at +2, +7, +21, +45 day intervals for lasting retention.",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description:
      "Track readiness scores, weak topics, and weekly progress with rich dashboards.",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Zap,
    title: "AI Study Notes",
    description:
      "Generate complexity analysis, patterns, and interview tips for every problem.",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description:
      "Earn badges, maintain streaks, and track achievements as you prepare.",
    bgColor: "bg-amber-500/10",
  },
];

const stats = [
  { label: "Problems Mapped", value: "2000+", icon: Code2 },
  { label: "Companies Tracked", value: "20+", icon: Target },
  { label: "Topics Covered", value: "20", icon: Brain },
  { label: "Users Preparing", value: "1000+", icon: Users },
];

const howItWorks = [
  {
    step: "01",
    title: "Set Your Goals",
    description: "Choose your experience level, timeline, and target companies.",
  },
  {
    step: "02",
    title: "Get Your Roadmap",
    description:
      "Receive a personalized week-by-week study plan with the right problems.",
  },
  {
    step: "03",
    title: "Solve & Track",
    description:
      "Work through problems, track progress, and get AI-generated notes.",
  },
  {
    step: "04",
    title: "Revise & Master",
    description:
      "Automatic spaced repetition ensures you never forget what you learned.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer"
            aria-label="InterviewPilot Home"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              InterviewPilot
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="cursor-pointer">
              <Button variant="ghost" size="sm" className="font-medium cursor-pointer">
                Log In
              </Button>
            </Link>
            <Link href="/register" className="cursor-pointer">
              <Button
                size="sm"
                className="font-medium cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg shadow-primary/20"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 py-28 md:py-36">
            <div className="max-w-4xl mx-auto text-center">
              <Badge
                variant="secondary"
                className="mb-6 px-4 py-1.5 text-sm font-medium border border-primary/20 bg-primary/5"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                AI-Powered Interview Preparation
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Ace Your Next
                <br />
                <span className="gradient-text">Coding Interview</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Stop grinding random LeetCode problems. Get a personalized
                roadmap with company-specific questions, spaced repetition
                revision, and AI-powered study guidance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <AuthCTA />
                <AuthCTASecondary />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-8 z-10">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge
                variant="secondary"
                className="mb-4 px-3 py-1 text-xs font-medium"
              >
                Features
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                Everything You Need to
                <br />
                <span className="gradient-text">Crack the Interview</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                A complete toolkit designed to replace random practice with
                structured, data-driven preparation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-6 card-hover group"
                  role="article"
                >
                  <div
                    className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge
                variant="secondary"
                className="mb-4 px-3 py-1 text-xs font-medium"
              >
                How It Works
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                From Zero to
                <br />
                <span className="gradient-text">Interview Ready</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Four simple steps to transform your interview preparation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="text-center relative">
                  <div className="text-6xl font-bold gradient-text/10 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {index < howItWorks.length - 1 && (
                    <ChevronRight className="hidden lg:block h-5 w-5 text-muted-foreground/30 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-4 text-center">
            <div className="glass-card rounded-3xl p-12 md:p-16 max-w-3xl mx-auto">
              <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Preparation?
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of engineers who replaced random practice with
                structured, data-driven interview preparation.
              </p>
              <AuthCTAFooter />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 cursor-pointer"
              aria-label="InterviewPilot Home"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Rocket className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">InterviewPilot</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Built for engineers, by engineers. &copy; 2024 InterviewPilot.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
