"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const MAX_ID = 1025;
const BATCH_SIZE = 100;

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

const genById = (id: number): number | null => {
  for (const r of genRanges) {
    if (id >= r.s && id <= r.e) return r.gen;
  }
  return null;
};

const officialArtwork = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;

const typeColors: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

interface PokemonCard {
  id: number;
  name: string;
  types: string[];
  gen: number | null;
  caught: boolean;
}

export default function PokedexPage() {
  const params = useParams();
  const pokedexId = params.id as string;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [pokedexName, setPokedexName] = useState("");
  const [loading, setLoading] = useState(true);
  const [hideImages, setHideImages] = useState(false);

  const [idToName, setIdToName] = useState<Map<number, string>>(new Map());
  const [idToTypes, setIdToTypes] = useState<Map<number, string[]>>(new Map());
  const [caughtSet, setCaughtSet] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState("");
  const [genFilter, setGenFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [caughtFilter, setCaughtFilter] = useState("all");
  const [typeList, setTypeList] = useState<string[]>([]);

  const [filteredIds, setFilteredIds] = useState<number[]>([]);
  const [renderIndex, setRenderIndex] = useState(0);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const caughtSetRef = useRef<Set<number>>(caughtSet);

  // Keep ref in sync with caughtSet
  useEffect(() => {
    caughtSetRef.current = caughtSet;
  }, [caughtSet]);

  // Check auth and load pokedex
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      setUser(session.user);

      // Load pokedex name
      const { data: pokedex, error } = await supabase
        .from("pokedexes")
        .select("name")
        .eq("id", pokedexId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !pokedex) {
        router.push("/dashboard");
        return;
      }

      setPokedexName(pokedex.name);

      // Load caught pokemon
      const { data: caught } = await supabase
        .from("caught_pokemon")
        .select("pokemon_id")
        .eq("pokedex_id", pokedexId);

      setCaughtSet(new Set(caught?.map((c) => c.pokemon_id) || []));
      setLoading(false);
    };

    checkAuth();
  }, [pokedexId, router]);

  // Fetch pokemon names and types in parallel
  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      // Fetch names and types in parallel
      const [namesRes, typesRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=1100`),
        fetch("https://pokeapi.co/api/v2/type"),
      ]);

      const namesData = await namesRes.json();
      const typesData = await typesRes.json();

      // Process names
      const names = new Map<number, string>();
      for (const p of namesData.results || []) {
        const m = p.url.match(/\/pokemon\/(\d+)\/?$/);
        if (!m) continue;
        const id = parseInt(m[1], 10);
        if (id >= 1 && id <= MAX_ID) {
          let nm = p.name.replace(/-/g, " ");
          nm = nm
            .split(" ")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          names.set(id, nm);
        }
      }

      // Process types - fetch all type details in parallel
      const types = new Map<number, string[]>();
      const typesList: string[] = [];
      const typePromises = [];

      for (const t of typesData.results || []) {
        if (/(shadow|unknown)/i.test(t.name)) continue;
        typesList.push(t.name);
        typePromises.push(
          fetch(t.url)
            .then((res) => res.json())
            .then((tData) => {
              const typeName = tData.name;
              for (const rel of tData.pokemon || []) {
                const m = rel.pokemon.url.match(/\/pokemon\/(\d+)\/?$/);
                if (!m) continue;
                const id = parseInt(m[1], 10);
                if (id < 1 || id > MAX_ID) continue;
                const arr = types.get(id) || [];
                if (!arr.includes(typeName)) arr.push(typeName);
                types.set(id, arr);
              }
            })
            .catch((e) => console.warn("Type fetch failed", t.name, e))
        );
      }

      // Wait for all type requests to complete
      await Promise.all(typePromises);

      typesList.sort();

      // Update state once with all data
      setIdToName(names);
      setIdToTypes(types);
      setTypeList(typesList);
    };

    fetchData();
  }, [loading]);

  // Compute filtered IDs
  const computeFilteredIds = useCallback(() => {
    const ids = Array.from(idToName.keys()).sort((a, b) => a - b);
    const out: number[] = [];

    for (const id of ids) {
      const name = idToName.get(id);
      const types = idToTypes.get(id) || [];
      const gen = genById(id);

      if (!gen) continue;
      if (search && !name?.toLowerCase().includes(search.toLowerCase())) continue;
      if (genFilter !== "all" && gen.toString() !== genFilter) continue;
      if (typeFilter !== "all" && !types.includes(typeFilter)) continue;
      if (caughtFilter === "caught" && !caughtSet.has(id)) continue;
      if (caughtFilter === "uncaught" && caughtSet.has(id)) continue;

      out.push(id);
    }

    return out;
  }, [search, genFilter, typeFilter, caughtFilter, idToName, idToTypes, caughtSet]);

  // Update filtered IDs when filters change
  useEffect(() => {
    const ids = computeFilteredIds();
    setFilteredIds(ids);
    setRenderIndex(0);
    setCards([]);
  }, [computeFilteredIds]);

  // Render next batch
  const appendNextBatch = useCallback(() => {
    if (renderIndex >= filteredIds.length) return;

    const to = Math.min(renderIndex + BATCH_SIZE, filteredIds.length);
    const newCards: PokemonCard[] = [];

    for (let i = renderIndex; i < to; i++) {
      const id = filteredIds[i];
      newCards.push({
        id,
        name: idToName.get(id) || "",
        types: idToTypes.get(id) || [],
        gen: genById(id),
        caught: caughtSet.has(id),
      });
    }

    setCards((prev) => [...prev, ...newCards]);
    setRenderIndex(to);
  }, [renderIndex, filteredIds, idToName, idToTypes, caughtSet]);

  // Initial render
  useEffect(() => {
    if (filteredIds.length > 0 && cards.length === 0) {
      appendNextBatch();
    }
  }, [filteredIds, cards.length, appendNextBatch]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        appendNextBatch();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [appendNextBatch]);

  // Toggle caught - only update card UI, not entire grid
  const toggleCaught = async (id: number) => {
    const isCaught = caughtSetRef.current.has(id);

    // Update card UI only (not the entire grid)
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, caught: !c.caught } : c))
    );

    // Update ref immediately for next click
    if (isCaught) {
      caughtSetRef.current.delete(id);
    } else {
      caughtSetRef.current.add(id);
    }

    // Update database in background
    try {
      if (isCaught) {
        await supabase
          .from("caught_pokemon")
          .delete()
          .eq("pokedex_id", pokedexId)
          .eq("pokemon_id", id);
      } else {
        await supabase.from("caught_pokemon").insert({
          pokedex_id: pokedexId,
          pokemon_id: id,
        });
      }
    } catch (err) {
      console.error("Failed to update caught status:", err);
      // Revert card UI on error
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, caught: isCaught } : c))
      );
      // Revert ref
      if (isCaught) {
        caughtSetRef.current.add(id);
      } else {
        caughtSetRef.current.delete(id);
      }
      // Show error toast
      setToastMessage({
        type: "error",
        text: "Failed to update Pokémon. Please try again.",
      });
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const caughtCount = caughtSet.size;
  const counterText =
    caughtFilter === "caught"
      ? `${caughtCount} / ${MAX_ID}`
      : caughtFilter === "uncaught"
        ? `${MAX_ID - caughtCount} / ${MAX_ID}`
        : `${MAX_ID}`;

  return (
    <main className="min-h-screen bg-pokemon-dark">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg font-semibold z-50 ${
            toastMessage.type === "error"
              ? "bg-red-900 border border-red-700 text-red-100"
              : "bg-green-900 border border-green-700 text-green-100"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      <header className="bg-pokemon-card border-b border-pokemon-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <Link
                href="/dashboard"
                className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">
                {pokedexName} <span className="text-gray-400 text-lg">Gen 1–9</span>{" "}
                <span className="text-gray-400 text-lg">{counterText}</span>
              </h1>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Search Pokémon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Generation</label>
                <select
                  value={genFilter}
                  onChange={(e) => setGenFilter(e.target.value)}
                  className="px-3 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All</option>
                  {genRanges.map((r) => (
                    <option key={r.gen} value={r.gen}>
                      Gen {r.gen}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All</option>
                  {typeList.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-400">Caught</label>
                <select
                  value={caughtFilter}
                  onChange={(e) => setCaughtFilter(e.target.value)}
                  className="px-3 py-2 bg-pokemon-dark border border-pokemon-border rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="caught">Caught</option>
                  <option value="uncaught">Uncaught</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-gray-400">Hide images</label>
                <input
                  type="checkbox"
                  checked={hideImages}
                  onChange={(e) => setHideImages(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => toggleCaught(card.id)}
              className={`rounded-lg border-2 p-3 cursor-pointer transition ${
                card.caught
                  ? "bg-blue-900 border-blue-500"
                  : "bg-pokemon-card border-pokemon-border hover:border-blue-500"
              }`}
            >
              {!hideImages && (
                <div className="mb-2 aspect-square relative">
                  <Image
                    src={officialArtwork(card.id)}
                    alt={card.name}
                    fill
                    className="object-contain"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="text-center">
                <p className="text-xs font-semibold text-gray-300 mb-1">
                  #{String(card.id).padStart(3, "0")}
                </p>
                <p className="text-sm font-bold mb-2">{card.name}</p>

                <div className="flex flex-wrap gap-1 justify-center mb-2">
                  {card.types.map((type) => (
                    <span
                      key={type}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${typeColors[type] || "#2b3748"}22`,
                        borderColor: typeColors[type] || "#2b3748",
                        border: "1px solid",
                        color: typeColors[type] || "#2b3748",
                      }}
                    >
                      {type}
                    </span>
                  ))}
                </div>

                {card.caught && (
                  <div className="text-green-400 text-xs font-bold">✓ Caught</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {cards.length === 0 && filteredIds.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No Pokémon match your filters</p>
          </div>
        )}
      </main>
    </main>
  );
}
