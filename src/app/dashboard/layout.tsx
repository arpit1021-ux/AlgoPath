"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BookOpen,
  RotateCcw,
  BarChart3,
  Trophy,
  User,
  Zap,
  Menu,
  X,
  Map,
  LayoutDashboard,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const globalNavItems = [
  { icon: BookOpen, label: "My Plans", href: "/dashboard" },
  { icon: RotateCcw, label: "Revisions", href: "/dashboard/revisions" },
  { icon: Trophy, label: "Badges", href: "/dashboard/badges" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

function getPlanSlugFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "dashboard" && segments[1] === "plans" && segments[2] && segments[2] !== "new") {
    return segments[2];
  }
  return null;
}

function getPlanNavItems(planSlug: string) {
  return [
    { icon: LayoutDashboard, label: "Dashboard", href: `/dashboard/plans/${planSlug}` },
    { icon: Map, label: "Roadmap", href: `/dashboard/plans/${planSlug}/roadmap` },
    { icon: BarChart3, label: "Analytics", href: `/dashboard/plans/${planSlug}/analytics` },
    { icon: RotateCcw, label: "Revisions", href: `/dashboard/plans/${planSlug}/revisions` },
  ];
}

const routeTitles: Record<string, string> = {
  "/dashboard": "My Plans",
  "/dashboard/plans/new": "Create Plan",
  "/dashboard/profile": "Profile",
  "/dashboard/badges": "Badges",
  "/dashboard/revisions": "Revisions",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] === "dashboard" && segments[1] === "plans" && segments[2]) {
    const sub = segments[3];
    if (sub === "analytics") return "Analytics";
    if (sub === "revisions") return "Revisions";
    if (sub === "roadmap") return "Roadmap";
    if (sub === "new") return "Create Plan";
    return "Plan Dashboard";
  }
  if (pathname === "/dashboard/analytics") return "Analytics";
  return "Dashboard";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const planSlug = useMemo(() => getPlanSlugFromPath(pathname), [pathname]);
  const inPlan = planSlug !== null;

  const planNavItems = useMemo(
    () => (planSlug ? getPlanNavItems(planSlug) : []),
    [planSlug]
  );

  const NavContent = () => (
    <>
      <div className="p-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            InterviewPilot
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {inPlan && (
          <>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <ChevronLeft className="w-4 h-4" />
              All Plans
            </Link>
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>This Plan</p>
            </div>
            {planNavItems.map((item) => {
              const isActive = item.href === `/dashboard/plans/${planSlug}` ? pathname === `/dashboard/plans/${planSlug}` : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? "var(--sidebar-item-active)" : "transparent",
                    color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                    borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                  }}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
            <div className="mx-3 my-3" style={{ borderTop: "1px solid var(--sidebar-border)" }} />
          </>
        )}

        {globalNavItems.map((item) => {
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                background: isActive ? "var(--sidebar-item-active)" : "transparent",
                color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
              }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer" style={{ background: "var(--sidebar-item-hover)" }}>
          <UserButton appearance={{ elements: { avatarBox: "cursor-pointer w-8 h-8 rounded-full overflow-hidden" } }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Account</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>Manage settings</p>
          </div>
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <button
        className="lg:hidden fixed top-4 left-4 z-[110] w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className="hidden lg:flex w-[260px] min-h-screen flex-col fixed left-0 top-0 z-[100]" style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}>
        <NavContent />
      </aside>

      <div className={`lg:hidden fixed inset-0 z-[105] transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[260px] flex flex-col transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}>
          <NavContent />
        </div>
      </div>

      <main className="flex-1 lg:ml-[260px] min-h-screen">
        <div className="sticky top-0 z-50 px-6 lg:px-10 h-14 flex items-center justify-between" style={{ background: "var(--navbar-bg)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-sm font-semibold capitalize ml-12 lg:ml-0" style={{ color: "var(--text-primary)" }}>{pageTitle}</h2>
          <div className="flex items-center gap-3">
            {pathname !== "/dashboard/plans/new" && (
              <Link href="/dashboard/plans/new" className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                + New Plan
              </Link>
            )}
            <ThemeToggle />
            <UserButton appearance={{ elements: { avatarBox: "cursor-pointer w-8 h-8 rounded-full overflow-hidden" } }} />
          </div>
        </div>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
