"use client";

import { SlidersHorizontal, ImageOff } from "lucide-react";

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
}: PokedexFilterProps) {
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
    <div className="sticky top-0 z-40 bg-pokemon-dark">
      <div className="max-w-7xl mx-auto py-4 px-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-3 bg-pokemon-card border border-pokemon-border rounded-xl focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
          <button
            onClick={() => onShowFiltersChange(!showFilters)}
            className={`px-4 py-3 bg-pokemon-card border border-solid rounded-xl transition flex items-center gap-2 text-sm font-semibold ${
              showFilters
                ? "border-pokemon-red bg-blue-500 bg-opacity-10"
                : "border-pokemon-border"
            }`}
          >
            <SlidersHorizontal size={18} />
            Filters
            {filterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-pokemon-red text-white rounded-full text-xs font-bold">
                {filterCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onHideImagesChange(!hideImages)}
            className={`px-4 py-3 border border-solid rounded-xl transition flex items-center justify-center ${
              hideImages
                ? "bg-pokemon-red text-white"
                : "border-pokemon-border bg-pokemon-card text-gray-400 hover:border-pokemon-red"
            }`}
            title="Hide images"
          >
            <ImageOff size={18} />
          </button>
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="space-y-4 mt-4 px-4 py-4 bg-pokemon-card border border-pokemon-border rounded-xl">
            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Status</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => onCaughtFilterChange("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "all"
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => onCaughtFilterChange("caught")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "caught"
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
                  }`}
                >
                  Caught
                </button>
                <button
                  onClick={() => onCaughtFilterChange("uncaught")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    caughtFilter === "uncaught"
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
                  }`}
                >
                  Uncaught
                </button>
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Types</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleTypeFilter("all")}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    typeFilter.size === 0
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
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
                        ? "bg-pokemon-red text-white"
                        : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Generations</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleGenFilter(0)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    genFilter.size === 0
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
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
                          ? "bg-pokemon-red text-white"
                          : "bg-pokemon-dark border border-pokemon-border text-gray-300 hover:border-pokemon-red"
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
              <div className="pt-4 border-t border-pokemon-border">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      onTypeFilterChange(new Set());
                      onGenFilterChange(new Set());
                      onCaughtFilterChange("all");
                    }}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition bg-pokemon-dark border border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
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
