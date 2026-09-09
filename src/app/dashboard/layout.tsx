"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  RotateCcw,
  BarChart3,
  Trophy,
  User,
  Menu,
  X,
  Map,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const planSlug = useMemo(() => getPlanSlugFromPath(pathname), [pathname]);
  const inPlan = planSlug !== null;

  const planNavItems = useMemo(
    () => (planSlug ? getPlanNavItems(planSlug) : []),
    [planSlug]
  );

  const NavContent = () => (
    <>
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" rx="20" fill="url(#sidebar-logo-grad)" />
            <path
              d="M50,30 C50,15 30,15 30,30 C30,45 50,45 50,30 C50,15 70,15 70,30 C70,45 50,45 50,30 Z"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <defs>
              <linearGradient id="sidebar-logo-grad" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#ffa116" />
                <stop offset="100%" stopColor="#ff6b35" />
              </linearGradient>
            </defs>
          </svg>
          {!collapsed && (
            <div>
              <span
                className="font-bold text-lg leading-tight block"
                style={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                }}
              >
                AlgoPath
              </span>
              <span
                className="text-[8px] uppercase tracking-[0.15em] leading-none"
                style={{ color: "var(--text-muted)" }}
              >
                SMART LEETCODE PREP
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0"
          style={{
            color: "var(--text-muted)",
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
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
              {!collapsed && "All Plans"}
            </Link>
            {!collapsed && (
              <div className="px-3 py-1.5 mb-1">
                <p
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  This Plan
                </p>
              </div>
            )}
            {planNavItems.map((item) => {
              const isActive = item.href === `/dashboard/plans/${planSlug}` ? pathname === `/dashboard/plans/${planSlug}` : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    padding: collapsed ? "10px 0" : "10px 12px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    background: isActive ? "var(--sidebar-item-active)" : "transparent",
                    color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                    borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                    fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {!collapsed && item.label}
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
              className="w-full flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                padding: collapsed ? "10px 0" : "10px 12px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "var(--sidebar-item-active)" : "transparent",
                color: isActive ? "var(--accent-text)" : "var(--text-secondary)",
                borderLeft: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
              }}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer"
          style={{
            background: "var(--sidebar-item-hover)",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <UserButton appearance={{ elements: { avatarBox: "cursor-pointer w-8 h-8 rounded-full overflow-hidden" } }} />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>Account</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>Manage settings</p>
            </div>
          )}
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

      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 z-[100] transition-all duration-300"
        style={{
          width: collapsed ? "64px" : "260px",
          minHeight: "100vh",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--sidebar-border)",
        }}
      >
        <NavContent />
      </aside>

      <div className={`lg:hidden fixed inset-0 z-[105] transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[260px] flex flex-col transition-transform duration-300 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
        >
          <NavContent />
        </div>
      </div>

      <main
        className={`flex-1 min-w-0 min-h-screen transition-[margin] duration-300 ${
          collapsed ? "lg:ml-16" : "lg:ml-[260px]"
        }`}
      >
        <div
          className="sticky top-0 z-50 px-6 lg:px-10 h-14 flex items-center justify-between"
          style={{
            background: "var(--navbar-bg)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-sm font-semibold capitalize ml-12 lg:ml-0"
            style={{
              color: "var(--text-primary)",
              fontFamily: "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {pageTitle}
          </h2>
          <div className="flex items-center gap-3">
            {pathname !== "/dashboard/plans/new" && (
              <Link
                href="/dashboard/plans/new"
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                + New Plan
              </Link>
            )}
            <UserButton appearance={{ elements: { avatarBox: "cursor-pointer w-8 h-8 rounded-full overflow-hidden" } }} />
          </div>
        </div>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
