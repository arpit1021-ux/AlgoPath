"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  BookOpen,
  Calendar,
  LayoutDashboard,
  Trophy,
  User,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "My Plans", href: "/dashboard/plans", icon: BookOpen },
  { title: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Badges", href: "/dashboard/badges", icon: Trophy },
  { title: "Profile", href: "/dashboard/profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-sm flex flex-col">
        <div className="p-5 border-b border-border/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 cursor-pointer"
            aria-label="InterviewPilot Dashboard"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Rocket className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              InterviewPilot
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Main navigation">
          {sidebarNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive ? "text-primary" : ""
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "cursor-pointer",
                },
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Account</p>
              <p className="text-xs text-muted-foreground truncate">
                Manage settings
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
