"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CreatePokedexModal } from "@/components/CreatePokedexModal";
import { Header } from "@/components/Header";
import { genRanges } from "@/constants/pokemon";
import { useUserStore } from "@/store/userStore";
import { usePokedexStore } from "@/store/pokedexStore";

const getTotalPokemonForGenerations = (generations: number[]): number => {
  let total = 0;
  for (const gen of generations) {
    const range = genRanges.find((r) => r.gen === gen);
    if (range) {
      total += range.e - range.s + 1;
    }
  }
  return total;
};

interface PokedexStats {
  [key: string]: {
    total: number;
    caught: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: userLoading, fetchUser } = useUserStore();
  const { pokedexes, loading: pokedexLoading, fetchPokedexes, createPokedex, deletePokedex } = usePokedexStore();
  const [stats, setStats] = useState<PokedexStats>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    }

    // Listen for theme changes via MutationObserver
    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setTheme(isDarkMode ? "dark" : "light");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    setMounted(true);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      await fetchUser();
    };

    initializeUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const loadPokedexes = async () => {
      await fetchPokedexes(user.id);
    };

    loadPokedexes();
  }, [user, fetchPokedexes, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (pokedexes.length === 0) {
        setStats({});
        return;
      }

      const statsMap: PokedexStats = {};
      for (const pokedex of pokedexes) {
        const { data, error } = await fetch(`/api/pokedex/${pokedex.id}/stats`).then((r) => r.json());

        if (!error && data) {
          const generations = pokedex.generations || [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const total = getTotalPokemonForGenerations(generations);

          statsMap[pokedex.id] = {
            caught: data.count || 0,
            total,
          };
        }
      }
      setStats(statsMap);
    };

    fetchStats();
  }, [pokedexes]);

  const handleCreatePokedex = async (name: string, generations: number[]) => {
    if (!user) return;

    try {
      await createPokedex(user.id, name, generations);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Failed to create pokedex:", err);
      throw err;
    }
  };

  const handleDeletePokedex = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Pokédex?")) return;

    setDeletingId(id);
    try {
      await deletePokedex(id);
      const newStats = { ...stats };
      delete newStats[id];
      setStats(newStats);
    } catch (err) {
      console.error("Failed to delete pokedex:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const loading = userLoading || pokedexLoading;

  if (!mounted || loading) {
    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-gray-950" : "bg-white";
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgClass}`}>
        <div className={`text-xl ${isDark ? "text-white" : "text-gray-900"}`}>Loading...</div>
      </div>
    );
  }

  const totalCaught = Object.values(stats).reduce((sum, s) => sum + s.caught, 0);
  const totalPossible = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-950" : "bg-gradient-to-b from-white to-gray-50";
  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <main className={`min-h-screen ${bgClass}`}>
      <Header title="Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overall Stats */}
        <div className={`mb-12 ${cardBgClass} border rounded-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Overall Progress</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className={`${secondaryTextClass} text-sm mb-2`}>Total Pokédexes</p>
              <p className={`text-4xl font-bold ${textClass}`}>{pokedexes.length}</p>
            </div>
            <div>
              <p className={`${secondaryTextClass} text-sm mb-2`}>Pokémon Caught</p>
              <p className={`text-4xl font-bold ${textClass}`}>{totalCaught}</p>
            </div>
            <div>
              <p className={`${secondaryTextClass} text-sm mb-2`}>Total Available</p>
              <p className={`text-4xl font-bold ${textClass}`}>{totalPossible}</p>
            </div>
          </div>
        </div>

        {/* Create New Pokédex */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${textClass}`}>My Pokédexes</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Create New Pokédex
            </button>
          </div>

          {pokedexes.length === 0 ? (
            <div className={`text-center py-12 ${secondaryTextClass}`}>
              <p className="mb-4">No pokedexes yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pokedexes.map((pokedex) => {
                const pokeStats = stats[pokedex.id] || { caught: 0, total: 1025 };
                const percentage = Math.round(
                  (pokeStats.caught / pokeStats.total) * 100
                );

                return (
                  <div
                    key={pokedex.id}
                    className={`${cardBgClass} border rounded-lg p-6 hover:border-blue-500 transition`}
                  >
                    <Link href={`/pokedex/${pokedex.id}`}>
                      <h3 className={`text-xl font-bold mb-2 hover:text-blue-400 ${textClass}`}>
                        {pokedex.name}
                      </h3>
                    </Link>
                    <p className={`${secondaryTextClass} text-sm mb-4`}>
                      Created {new Date(pokedex.created_at).toLocaleDateString()}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className={secondaryTextClass}>Progress</span>
                        <span className={`font-semibold ${textClass}`}>
                          {pokeStats.caught} / {pokeStats.total}
                        </span>
                      </div>
                      <div className={`w-full ${isDark ? "bg-gray-800" : "bg-gray-200"} rounded-full h-2`}>
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className={`text-xs ${secondaryTextClass} mt-1`}>{percentage}% complete</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/pokedex/${pokedex.id}`}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center text-sm font-semibold transition"
                      >
                        Track
                      </Link>
                      <button
                        onClick={() => handleDeletePokedex(pokedex.id)}
                        disabled={deletingId === pokedex.id}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-sm font-semibold transition"
                      >
                        {deletingId === pokedex.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreatePokedexModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreatePokedex}
        isLoading={pokedexLoading}
      />
    </main>
  );
}
