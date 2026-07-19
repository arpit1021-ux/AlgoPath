"use client";

import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer border ${className}`}
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
      ) : (
        <Moon className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
      )}
    </button>
  );
}
