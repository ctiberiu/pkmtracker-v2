"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";

interface AssignTcgToPokemonProps {
  pokemonId: number;
  pokemonName: string;
}

export function AssignTcgToPokemon({ pokemonId, pokemonName }: AssignTcgToPokemonProps) {
  type TcgCard = {
    id: string;
    name: string;
    imageUrl: string;
  };

  type TcgSetGroup = {
    setId: string;
    logoUrl: string;
    cards: TcgCard[];
  };

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sets, setSets] = useState<TcgSetGroup[]>([]);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [selected, setSelected] = useState<TcgCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestSeq = useRef(0);

  useEffect(() => {
    setQuery(pokemonName);
  }, [pokemonName]);

  const searchCards = async (q: string, signal: AbortSignal): Promise<TcgSetGroup[]> => {
    const url = `/api/tcg/cards?query=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal });

    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || "Failed to fetch cards");
    }

    const incomingSets = (json?.sets || []) as any[];
    return incomingSets.map((s) => ({
      setId: String(s.setId || ""),
      logoUrl: String(s.logoUrl || ""),
      cards: (s.cards || []).map((c: any) => ({
        id: String(c.id),
        name: String(c.name || ""),
        imageUrl: String(c.imageUrl || ""),
      })),
    }));
  };

  useEffect(() => {
    const q = query.trim();

    if (!q) {
      setLoading(false);
      setSets([]);
      setActiveSetId(null);
      setError(null);
      return;
    }

    const seq = ++requestSeq.current;
    setLoading(true);
    setSets([]);
    setActiveSetId(null);
    setError(null);

    const controller = new AbortController();

    const handle = window.setTimeout(() => {
      searchCards(q, controller.signal)
        .then((nextSets) => {
          if (requestSeq.current !== seq) return;
          setSets(nextSets);
          setActiveSetId(nextSets[0]?.setId || null);
        })
        .catch((e) => {
          if (requestSeq.current !== seq) return;
          if (e?.name === "AbortError") return;
          setError("Failed to search cards. Please try again.");
          console.error(e);
        })
        .finally(() => {
          if (requestSeq.current !== seq) return;
          setLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query]);

  const canAssign = Boolean(selected);

  const activeSet = sets.find((s) => s.setId === activeSetId) || null;
  const activeCards = (activeSet?.cards || []).slice(0, 9);

  const handleAssign = () => {
    if (!selected) return;
    console.log("Assign TCG card to pokemon:", {
      pokemonId,
      pokemonName,
      card: selected,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-500">ASSIGN CARD</p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} #{String(pokemonId).padStart(3, "0")}
        </h2>
      </div>

      <div className="flex justify-center">
        {selected ? (
          <div className="w-40">
            <div className="relative w-full aspect-[245/342] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
              <img
                src={selected.imageUrl}
                alt={selected.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="w-40">
            <div className="w-full aspect-[245/342] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
              <CreditCard size={22} />
              <span className="text-xs font-semibold">Select a card below</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleAssign}
        disabled={!canAssign}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 border border-solid ${
          canAssign
            ? "bg-red-600 hover:bg-red-500 text-white border-red-600"
            : "bg-red-900/40 text-white/60 border-red-900/40 cursor-not-allowed"
        }`}
      >
        <span>Assign Card</span>
      </button>

      {error && (
        <p className="text-center text-sm text-red-500">
          {error}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[245/342] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      {!loading && sets.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {sets.map((s) => {
              const isActive = s.setId === activeSetId;
              return (
                <button
                  key={s.setId}
                  onClick={() => setActiveSetId(s.setId)}
                  className={`h-12 rounded-lg border border-solid px-2 flex items-center justify-center bg-white/70 dark:bg-gray-950/40 transition ${
                    isActive
                      ? "border-red-500"
                      : "border-gray-200 dark:border-gray-800 hover:border-red-500"
                  }`}
                  title={s.setId}
                >
                  <img
                    src={s.logoUrl}
                    alt={s.setId}
                    className="max-h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>

          {activeSet && (
            <div className="grid grid-cols-3 gap-3">
              {activeCards.map((card) => {
                const isSelected = selected?.id === card.id;
                return (
                  <button
                    key={card.id}
                    onClick={() => setSelected(card)}
                    className={`relative aspect-[245/342] rounded-xl overflow-hidden border border-solid transition ${
                      isSelected
                        ? "border-red-500"
                        : "border-gray-200 dark:border-gray-800 hover:border-red-500"
                    }`}
                    title={card.name}
                  >
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
