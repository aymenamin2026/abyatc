"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={`p-2 rounded-full transition-all duration-300 relative w-9 h-9 ${className || "text-foreground hover:bg-muted"}`}>
        <div className="w-5 h-5 rounded-full" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`group p-2 rounded-full transition-all duration-500 ease-in-out relative overflow-hidden ${className || "text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10"}`}
      aria-label="Toggle theme"
    >
      {/* تأثير دائري ناعم في الخلفية عند مرور الماوس */}
      <span className="absolute inset-0 rounded-full bg-current opacity-0 group-hover:opacity-10 scale-50 group-hover:scale-100 transition-all duration-300 ease-out" />

      {/* العنصر الحاوي للأيقونة مع تأثير دوران وتكبير ناعم */}
      <div className="relative z-10 transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110">
        {isDark ? (
          <Sun className="h-5 w-5 text-brand-gold drop-shadow-md transition-colors" />
        ) : (
          <Moon className="h-5 w-5 text-brand-blue drop-shadow-md transition-colors" />
        )}
      </div>
    </button>
  );
}