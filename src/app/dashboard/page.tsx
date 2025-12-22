"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CreatePokedexModal } from "@/components/CreatePokedexModal";

const genRanges = [
  { gen: 1, s: 1, e: 151 },
  { gen: 2, s: 152, e: 251 },
  { gen: 3, s: 252, e: 386 },
  { gen: 4, s: 387, e: 493 },
  { gen: 5, s: 494, e: 649 },
  { gen: 6, s: 650, e: 721 },
  { gen: 7, s: 722, e: 809 },
  { gen: 8, s: 810, e: 905 },
  { gen: 9, s: 906, e: 1025 },
];

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

interface Pokedex {
  id: string;
  name: string;
  created_at: string;
  generations: number[];
}

interface PokedexStats {
  [key: string]: {
    total: number;
    caught: number;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [pokedexes, setPokedexes] = useState<Pokedex[]>([]);
  const [stats, setStats] = useState<PokedexStats>({});
  const [loading, setLoading] = useState(true);
  const [creatingPokedex, setCreatingPokedex] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      setUser(session.user);
      fetchPokedexes(session.user.id);
    };

    checkUser();
  }, [router]);

  const fetchPokedexes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("pokedexes")
        .select("id, name, created_at, generations")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPokedexes(
        (data || []).map((p) => ({
          ...p,
          generations: p.generations || [1, 2, 3, 4, 5, 6, 7, 8, 9],
        }))
      );

      // Fetch stats for each pokedex
      if (data && data.length > 0) {
        const statsMap: PokedexStats = {};
        for (const pokedex of data) {
          const { count } = await supabase
            .from("caught_pokemon")
            .select("*", { count: "exact", head: true })
            .eq("pokedex_id", pokedex.id);

          const generations = pokedex.generations || [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const total = getTotalPokemonForGenerations(generations);

          statsMap[pokedex.id] = {
            caught: count || 0,
            total,
          };
        }
        setStats(statsMap);
      }
    } catch (err) {
      console.error("Failed to fetch pokedexes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePokedex = async (name: string, generations: number[]) => {
    if (!user) return;

    setCreatingPokedex(true);
    try {
      const { data, error } = await supabase
        .from("pokedexes")
        .insert([
          {
            user_id: user.id,
            name,
            generations,
          },
        ])
        .select();

      if (error) throw error;

      const newPokedex = data?.[0];
      if (newPokedex) {
        setPokedexes([
          {
            ...newPokedex,
            generations: newPokedex.generations || generations,
          },
          ...pokedexes,
        ]);
        setStats({
          ...stats,
          [newPokedex.id]: { caught: 0, total: 1025 },
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create pokedex:", err);
    } finally {
      setCreatingPokedex(false);
    }
  };

  const handleDeletePokedex = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Pokédex?")) return;

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("pokedexes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPokedexes(pokedexes.filter((p) => p.id !== id));
      const newStats = { ...stats };
      delete newStats[id];
      setStats(newStats);
    } catch (err) {
      console.error("Failed to delete pokedex:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalCaught = Object.values(stats).reduce((sum, s) => sum + s.caught, 0);
  const totalPossible = Object.values(stats).reduce((sum, s) => sum + s.total, 0);

  return (
    <main className="min-h-screen bg-pokemon-dark">
      <header className="bg-pokemon-card border-b border-pokemon-border">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link
              href="/account"
              className="px-4 py-2 text-blue-400 hover:text-blue-300 transition"
            >
              Account
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overall Stats */}
        <div className="mb-12 bg-pokemon-card border border-pokemon-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Overall Progress</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Pokédexes</p>
              <p className="text-4xl font-bold">{pokedexes.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Pokémon Caught</p>
              <p className="text-4xl font-bold">{totalCaught}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Total Available</p>
              <p className="text-4xl font-bold">{totalPossible}</p>
            </div>
          </div>
        </div>

        {/* Create New Pokédex */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Pokédexes</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-pokemon-red hover:bg-red-600 rounded-lg font-semibold transition"
            >
              <Plus size={20} />
              Create New Pokédex
            </button>
          </div>

          {pokedexes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
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
                    className="bg-pokemon-card border border-pokemon-border rounded-lg p-6 hover:border-blue-500 transition"
                  >
                    <Link href={`/pokedex/${pokedex.id}`}>
                      <h3 className="text-xl font-bold mb-2 hover:text-blue-400">
                        {pokedex.name}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mb-4">
                      Created {new Date(pokedex.created_at).toLocaleDateString()}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-semibold">
                          {pokeStats.caught} / {pokeStats.total}
                        </span>
                      </div>
                      <div className="w-full bg-pokemon-dark rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{percentage}% complete</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/pokedex/${pokedex.id}`}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-center text-sm font-semibold transition"
                      >
                        Track
                      </Link>
                      <button
                        onClick={() => handleDeletePokedex(pokedex.id)}
                        disabled={deletingId === pokedex.id}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded text-sm font-semibold transition"
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
        isLoading={creatingPokedex}
      />
    </main>
  );
}
