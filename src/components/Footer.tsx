"use client";

import { useEffect, useState } from "react";

export function Footer() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDarkMode = document.documentElement.classList.contains("dark");
    setTheme(isDarkMode ? "dark" : "light");

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-950" : "bg-white";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";
  const textClass = isDark ? "text-gray-500" : "text-gray-600";

  return (
    <footer className={`${bgClass} border-t ${borderClass} mt-12`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`text-center text-sm ${textClass}`}>
          <p>&copy; 2025 Pokédex Tracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
