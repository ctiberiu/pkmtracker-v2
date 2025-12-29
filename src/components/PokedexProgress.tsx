"use client";

import { useEffect, useState } from "react";

interface PokedexProgressProps {
  caughtCount: number;
  totalCount: number;
  pokedexName: string;
}

export function PokedexProgress({ caughtCount, totalCount, pokedexName }: PokedexProgressProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const percentage = totalCount > 0 ? Math.round((caughtCount / totalCount) * 100) : 0;

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
  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-gray-500" : "text-gray-600";
  const progressBgClass = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-300 border-gray-400";

  return (
    <div className={`pt-4 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 flex gap-4">
        {/* Pokedex Name Section */}
        <div className={`px-4 py-3 ${cardBgClass} border rounded-xl flex flex-col`}>
          <p className={`text-xs ${secondaryTextClass} mb-1`}>NAME</p>
          <h1 className={`text-2xl font-bold leading-none ${textClass}`}>{pokedexName}</h1>
        </div>

        <div className={`px-4 py-3 ${cardBgClass} border rounded-xl flex-1 flex flex-col justify-center`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-semibold ${textClass}`}>{caughtCount} / {totalCount} caught</span>
            <span className="text-sm font-semibold text-green-500">{percentage}%</span>
          </div>
          <div className={`w-full ${progressBgClass} rounded-full h-2 overflow-hidden border`}>
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
