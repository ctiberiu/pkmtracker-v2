"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PokedexProgress } from "@/components/PokedexProgress";
import { PokedexFilter } from "@/components/PokedexFilter";
import { PokemonGrid } from "@/components/PokemonGrid";
import { ScrollToTop } from "@/components/ScrollToTop";
import { genRanges, genById, typeColors } from "@/constants/pokemon";
import { usePokemonStore } from "@/store/pokemonStore";

const MAX_ID = 1025;
const BATCH_SIZE = 100;

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

  const { caughtPokemon, fetchCaughtPokemon, toggleCaughtPokemon } = usePokemonStore();

  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [pokedexName, setPokedexName] = useState("");
  const [selectedGenerations, setSelectedGenerations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [hideImages, setHideImages] = useState(false);

  const [idToName, setIdToName] = useState<Map<number, string>>(new Map());
  const [idToTypes, setIdToTypes] = useState<Map<number, string[]>>(new Map());

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

  // Initialize theme and listen for changes
  useEffect(() => {
    setMounted(true);
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

    return () => observer.disconnect();
  }, []);

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

      // Load caught pokemon from store
      await fetchCaughtPokemon(pokedexId);
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
      if (search && !name?.toLowerCase().includes(search.toLowerCase()) && !id.toString().includes(search)) continue;
      if (genFilter.size > 0 && !genFilter.has(gen)) continue;
      if (typeFilter.size > 0 && !types.some(t => typeFilter.has(t))) continue;
      if (caughtFilter === "caught" && !caughtPokemon.has(id)) continue;
      if (caughtFilter === "uncaught" && caughtPokemon.has(id)) continue;

      out.push(id);
    }

    return out;
  }, [search, genFilter, typeFilter, caughtFilter, idToName, idToTypes, selectedGenerations]);

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
        caught: caughtPokemon.has(id),
      });
    }

    setCards((prev) => [...prev, ...newCards]);
    setRenderIndex(to);
  }, [renderIndex, filteredIds, idToName, idToTypes]);

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
  const toggleCaught = useCallback(async (id: number) => {
    const isCaught = caughtPokemon.has(id);

    // Update card UI only (not the entire grid)
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, caught: !c.caught } : c))
    );

    // Update store in background (don't await to prevent re-render)
    toggleCaughtPokemon(pokedexId, id)
      .then(() => {
        setToastMessage({
          type: "success",
          text: isCaught ? "Pokémon unmarked as caught!" : "Pokémon marked as caught!",
        });
        setTimeout(() => setToastMessage(null), 3000);
      })
      .catch((err) => {
        console.error("Failed to update caught status:", err);
        // Revert card UI on error
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, caught: isCaught } : c))
        );
        // Show error toast
        setToastMessage({
          type: "error",
          text: "Failed to update Pokémon. Please try again.",
        });
        setTimeout(() => setToastMessage(null), 3000);
      });
  }, [caughtPokemon, pokedexId, toggleCaughtPokemon]);

  if (!mounted || loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${theme === "dark" ? "bg-gray-950" : "bg-white"}`}>
        <div className={`text-xl ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Loading...</div>
      </div>
    );
  }

  // Calculate total pokemon in selected generations
  const totalInGenerations = Array.from(idToName.keys()).filter((id) => {
    const gen = genById(id);
    return gen && selectedGenerations.includes(gen);
  }).length;

  const caughtCount = Array.from(caughtPokemon.keys()).filter((id) => {
    const gen = genById(id);
    return gen && selectedGenerations.includes(gen);
  }).length;

  const counterText =
    caughtFilter === "caught"
      ? `${caughtCount} / ${totalInGenerations}`
      : caughtFilter === "uncaught"
        ? `${totalInGenerations - caughtCount} / ${totalInGenerations}`
        : `${totalInGenerations}`;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-950" : "bg-gradient-to-b from-white to-gray-50";
  const toastBgClass = isDark ? "bg-red-900 border-red-700 text-red-100" : "bg-red-100 border-red-300 text-red-800";
  const toastSuccessBgClass = isDark ? "bg-green-900 border-green-700 text-green-100" : "bg-green-100 border-green-300 text-green-800";

  return (
    <main className={`min-h-screen ${bgClass} flex flex-col`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg font-semibold z-50 border ${
            toastMessage.type === "error"
              ? toastBgClass
              : toastSuccessBgClass
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      <Header title={`${counterText}`} />

      <PokedexProgress caughtCount={caughtCount} totalCount={totalInGenerations} pokedexName={pokedexName} />

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
        onBack={() => router.push("/dashboard")}
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
