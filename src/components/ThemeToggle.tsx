"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  // 🛠️ استدعاء resolvedTheme بدلاً من theme فقط
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`p-2 rounded-full transition-colors relative w-9 h-9 ${className || "text-foreground hover:bg-muted"}`}>
        <div className="w-5 h-5 rounded-full" />
      </button>
    );
  }

  // معرفة هل الوضع الحالي الحقيقي مظلم أم لا
  const isDark = resolvedTheme === "dark";

  return (
    <button
      // 🛠️ التبديل بناءً على الوضع الحقيقي المعروض على الشاشة
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-2 rounded-full transition-colors relative ${className || "text-foreground hover:bg-muted"}`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-[#fbc70f]" />
      ) : (
        <Moon className="h-5 w-5 text-[#093f89]" />
      )}
    </button>
  );
}