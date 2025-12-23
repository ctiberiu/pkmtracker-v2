"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PokedexProgress } from "@/components/PokedexProgress";
import { PokedexFilter } from "@/components/PokedexFilter";
import { PokemonGrid } from "@/components/PokemonGrid";
import { ScrollToTop } from "@/components/ScrollToTop";

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

  const [pokedexName, setPokedexName] = useState("");
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideImages, setHideImages] = useState(false);

  const [idToName, setIdToName] = useState<Map<number, string>>(new Map());
  const [idToTypes, setIdToTypes] = useState<Map<number, string[]>>(new Map());
  const [caughtSet, setCaughtSet] = useState<Set<number>>(new Set());

  const [search, setSearch] = useState("");
  const [genFilter, setGenFilter] = useState<Set<number>>(() => new Set());
  const [typeFilter, setTypeFilter] = useState<Set<string>>(() => new Set());
  const [caughtFilter, setCaughtFilter] = useState("all");
  const [typeList, setTypeList] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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

      // Load pokedex name and generations
      const { data: pokedex, error } = await supabase
        .from("pokedexes")
        .select("name, generations")
        .eq("id", pokedexId)
        .eq("user_id", session.user.id)
        .single();

      if (error || !pokedex) {
        router.push("/dashboard");
        return;
      }

      setPokedexName(pokedex.name);
      setSelectedGenerations(pokedex.generations || [1, 2, 3, 4, 5, 6, 7, 8, 9]);

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
      // Only show pokemon from selected generations
      if (!selectedGenerations.includes(gen)) continue;
      if (search && !name?.toLowerCase().includes(search.toLowerCase())) continue;
      if (genFilter.size > 0 && !genFilter.has(gen)) continue;
      if (typeFilter.size > 0 && !types.some(t => typeFilter.has(t))) continue;
      if (caughtFilter === "caught" && !caughtSet.has(id)) continue;
      if (caughtFilter === "uncaught" && caughtSet.has(id)) continue;

      out.push(id);
    }

    return out;
  }, [search, genFilter, typeFilter, caughtFilter, idToName, idToTypes, caughtSet, selectedGenerations]);

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

  // Calculate total pokemon in selected generations
  const totalInGenerations = Array.from(idToName.keys()).filter((id) => {
    const gen = genById(id);
    return gen && selectedGenerations.includes(gen);
  }).length;

  const caughtCount = Array.from(caughtSet).filter((id) => {
    const gen = genById(id);
    return gen && selectedGenerations.includes(gen);
  }).length;

  const counterText =
    caughtFilter === "caught"
      ? `${caughtCount} / ${totalInGenerations}`
      : caughtFilter === "uncaught"
        ? `${totalInGenerations - caughtCount} / ${totalInGenerations}`
        : `${totalInGenerations}`;

  return (
    <main className="min-h-screen bg-pokemon-dark flex flex-col">
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

      <Header title={`${pokedexName} ${counterText}`}>
        <Link
          href="/dashboard"
          className="text-blue-400 hover:text-blue-300 transition"
        >
          ← Back to Dashboard
        </Link>
      </Header>

      <PokedexProgress caughtCount={caughtCount} totalCount={totalInGenerations} />

      <PokedexFilter
        search={search}
        onSearchChange={setSearch}
        genFilter={genFilter}
        onGenFilterChange={setGenFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        caughtFilter={caughtFilter}
        onCaughtFilterChange={setCaughtFilter}
        hideImages={hideImages}
        onHideImagesChange={setHideImages}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        typeList={typeList}
        genRanges={genRanges}
        selectedGenerations={selectedGenerations}
      />

      <PokemonGrid
        cards={cards}
        filteredIdsLength={filteredIds.length}
        hideImages={hideImages}
        onToggleCaught={toggleCaught}
        typeColors={typeColors}
        gridRef={gridRef}
      />

      <Footer />
      <ScrollToTop />
    </main>
  );
}
