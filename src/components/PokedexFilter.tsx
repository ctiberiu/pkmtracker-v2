"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, ImageOff, MoveLeft } from "lucide-react";

interface PokedexFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  genFilter: Set<number>;
  onGenFilterChange: (value: Set<number>) => void;
  typeFilter: Set<string>;
  onTypeFilterChange: (value: Set<string>) => void;
  caughtFilter: string;
  onCaughtFilterChange: (value: string) => void;
  hideImages: boolean;
  onHideImagesChange: (value: boolean) => void;
  showFilters: boolean;
  onShowFiltersChange: (value: boolean) => void;
  typeList: string[];
  genRanges: Array<{ gen: number; s: number; e: number }>;
  selectedGenerations: number[];
  onBack: () => void;
}

export function PokedexFilter({
  search,
  onSearchChange,
  genFilter,
  onGenFilterChange,
  typeFilter,
  onTypeFilterChange,
  caughtFilter,
  onCaughtFilterChange,
  hideImages,
  onHideImagesChange,
  showFilters,
  onShowFiltersChange,
  typeList,
  genRanges,
  selectedGenerations,
  onBack,
}: PokedexFilterProps) {
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
  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const inputBgClass = isDark ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-300 text-gray-900";
  const buttonBgClass = isDark ? "bg-gray-900 border-gray-800 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-700";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-gray-400" : "text-gray-600";
  const borderClass = isDark ? "border-gray-800" : "border-gray-300";

  const toggleTypeFilter = (type: string) => {
    if (type === "all") {
      onTypeFilterChange(new Set());
    } else {
      const newSet = new Set(typeFilter);
      newSet.delete("all");
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      onTypeFilterChange(newSet);
    }
  };

  const toggleGenFilter = (gen: number) => {
    if (gen === 0) {
      onGenFilterChange(new Set());
    } else {
      const newSet = new Set(genFilter);
      newSet.delete(0);
      if (newSet.has(gen)) {
        newSet.delete(gen);
      } else {
        newSet.add(gen);
      }
      onGenFilterChange(newSet);
    }
  };

  const filterCount = typeFilter.size + genFilter.size + (caughtFilter !== "all" ? 1 : 0);

  return (
    <div className={`sticky top-0 z-40 ${bgClass}`}>
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="flex gap-4 items-center">
          <button
            onClick={onBack}
            className={`px-4 py-3 ${cardBgClass} border border-solid rounded-xl transition flex items-center justify-center hover:border-red-500 ${textClass}`}
            title="Back to dashboard"
          >
            <MoveLeft size={18} />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full px-4 py-3 ${inputBgClass} border rounded-xl focus:outline-none focus:border-red-500 text-sm`}
            />
          </div>
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className={`px-4 py-3 border border-solid rounded-xl transition flex items-center gap-2 text-sm font-semibold ${
              showFilters
                ? "bg-red-500 text-white border-red-500"
                : `${cardBgClass} border hover:border-red-500 ${textClass}`
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
            {filterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs font-bold">
                {filterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onHideImagesChange(!hideImages)}
            className={`px-4 py-3 border border-solid rounded-xl transition flex items-center justify-center ${
              hideImages
                ? "bg-red-500 text-white border-red-500"
                : `${cardBgClass} border hover:border-red-500 ${secondaryTextClass}`
            }`}
            title="Hide images"
          >
            <ImageOff size={18} />
          </button>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className={`space-y-4 mt-4 px-4 py-4 ${cardBgClass} border rounded-xl`}>
            {/* Status Filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${textClass}`}>Status</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onCaughtFilterChange("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "all"
                      ? "bg-red-500 text-white border-red-500"
                      : `${buttonBgClass} border hover:border-red-500`
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => onCaughtFilterChange("caught")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "caught"
                      ? "bg-red-500 text-white border-red-500"
                      : `${buttonBgClass} border hover:border-red-500`
                  }`}
                >
                  Caught
                </button>
                <button
                  onClick={() => onCaughtFilterChange("uncaught")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "uncaught"
                      ? "bg-red-500 text-white border-red-500"
                      : `${buttonBgClass} border hover:border-red-500`
                  }`}
                >
                  Uncaught
                </button>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${textClass}`}>Types</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleTypeFilter("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    typeFilter.size === 0
                      ? "bg-red-500 text-white border-red-500"
                      : `${buttonBgClass} border hover:border-red-500`
                  }`}
                >
                  All
                </button>
                {typeList.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTypeFilter(t)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      typeFilter.has(t)
                        ? "bg-red-500 text-white border-red-500"
                        : `${buttonBgClass} border hover:border-red-500`
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Filter */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${textClass}`}>Generations</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleGenFilter(0)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    genFilter.size === 0
                      ? "bg-red-500 text-white border-red-500"
                      : `${buttonBgClass} border hover:border-red-500`
                  }`}
                >
                  All
                </button>
                {genRanges.map((r) => (
                  selectedGenerations.includes(r.gen) && (
                    <button
                      key={r.gen}
                      onClick={() => toggleGenFilter(r.gen)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        genFilter.has(r.gen)
                          ? "bg-red-500 text-white border-red-500"
                          : `${buttonBgClass} border hover:border-red-500`
                      }`}
                    >
                      Gen {r.gen}
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Clear All Filters */}
            {(typeFilter.size > 0 || genFilter.size > 0 || caughtFilter !== "all") && (
              <div className={`pt-4 border-t ${borderClass}`}>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      onTypeFilterChange(new Set());
                      onGenFilterChange(new Set());
                      onCaughtFilterChange("all");
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition border border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${isDark ? "bg-gray-900" : "bg-white"}`}
                  >
                    ✕ Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
