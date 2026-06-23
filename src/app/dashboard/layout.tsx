"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  BarChart3,
  Trophy,
  User,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BookOpen, label: "My Plans", href: "/dashboard/plans" },
  { icon: RotateCcw, label: "Revisions", href: "/dashboard/revisions" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Trophy, label: "Badges", href: "/dashboard/badges" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
];

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/plans": "My Plans",
  "/dashboard/plans/new": "Create Plan",
  "/dashboard/profile": "Profile",
  "/dashboard/analytics": "Analytics",
  "/dashboard/badges": "Badges",
  "/dashboard/revisions": "Revisions",
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[0] === "dashboard" && segments[1] === "plans") {
    if (segments.length === 3) {
      if (segments[2] === "analytics") return "Analytics";
      if (segments[2] === "revisions") return "Revisions";
      return "Plan Roadmap";
    }
  }
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

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-white/[0.06]">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          aria-label="InterviewPilot Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white -rotate-12" />
          </div>
          <span className="font-bold text-lg text-[#f0f0f5] tracking-tight">
            InterviewPilot
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[rgba(139,92,246,0.08)] text-[#8b5cf6] border-l-2 border-[#8b5cf6]"
                  : "text-[#8b8d9e] hover:bg-[#1a1b26] hover:text-[#f0f0f5]"
              )}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "cursor-pointer w-8 h-8 rounded-full overflow-hidden",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#f0f0f5] truncate">
              Account
            </p>
            <p className="text-xs text-[#4b4d5e] truncate">Manage settings</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0b0f]">
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[110] w-10 h-10 rounded-lg bg-[#12131a] border border-white/[0.06] flex items-center justify-center text-[#f0f0f5]"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] min-h-screen bg-[#12131a] border-r border-white/[0.06] flex-col fixed left-0 top-0 z-[100]">
        <NavContent />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[105]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[#12131a] flex flex-col">
            <NavContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-[260px] min-h-screen">
        {/* Top header bar */}
        <div className="sticky top-0 z-50 bg-[#0a0b0f]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 lg:px-10 h-14 flex items-center">
          <h2 className="text-sm font-semibold text-[#f0f0f5] capitalize ml-12 lg:ml-0">
            {pageTitle}
          </h2>
        </div>
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
