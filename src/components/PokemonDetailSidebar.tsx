"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Evolution {
  id: number;
  name: string;
  minLevel?: number;
  evolvesAtLevel?: number;
  image: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  genus: string;
  types: string[];
  description: string;
  image: string;
  evolutionsBefore: Evolution[];
  evolutionsAfter: Evolution[];
  typeColors: Record<string, string>;
}

interface PokemonDetailSidebarProps {
  pokemonId: number;
  pokemonName: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onToggleCaught: (id: number) => void;
  isCaught: boolean;
  typeColors: Record<string, string>;
}

export function PokemonDetailSidebar({
  pokemonId,
  pokemonName,
  isOpen,
  onClose,
  onNavigate,
  onToggleCaught,
  isCaught,
  typeColors,
}: PokemonDetailSidebarProps) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setTheme(isDarkMode ? "dark" : "light");

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

  useEffect(() => {
    if (!isOpen || !pokemonId) return;

    const fetchPokemonDetail = async () => {
      setLoading(true);
      try {
        // Fetch main pokemon data
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const pokemonData = await pokemonRes.json();

        // Fetch species data for description and genus
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesRes.json();

        // Get genus from species data
        let genus = "Unknown";
        if (speciesData.genera) {
          const enGenus = speciesData.genera.find(
            (g: any) => g.language.name === "en"
          );
          if (enGenus) {
            genus = enGenus.genus;
          }
        }

        // Get description
        let description = "No description available";
        if (speciesData.flavor_text_entries) {
          const enEntry = speciesData.flavor_text_entries.find(
            (entry: any) => entry.language.name === "en"
          );
          if (enEntry) {
            description = enEntry.flavor_text.replace(/\f/g, " ");
          }
        }

        // Get types
        const types = pokemonData.types.map((t: any) => t.type.name);

        // Get image
        const image =
          pokemonData.sprites.other["official-artwork"].front_default ||
          pokemonData.sprites.front_default ||
          "";

        // Get evolutions
        let evolutionsBefore: Evolution[] = [];
        let evolutionsAfter: Evolution[] = [];
        if (speciesData.evolution_chain) {
          const evolutionRes = await fetch(speciesData.evolution_chain.url);
          const evolutionData = await evolutionRes.json();
          const evoChain = parseEvolutions(evolutionData.chain, pokemonId);
          evolutionsBefore = evoChain.before;
          evolutionsAfter = evoChain.after;
        }

        setDetail({
          id: pokemonId,
          name: pokemonName,
          genus,
          types,
          description,
          image,
          evolutionsBefore,
          evolutionsAfter,
          typeColors,
        });
      } catch (error) {
        console.error("Error fetching pokemon detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonDetail();
  }, [pokemonId, pokemonName, isOpen, typeColors]);

  const parseEvolutions = (chain: any, currentId: number): { before: Evolution[]; after: Evolution[] } => {
    const evolutionLine: any[] = [];

    // Flatten the evolution chain into a linear array with proper level tracking
    const traverse = (node: any) => {
      if (node.species.url) {
        const speciesId = parseInt(node.species.url.split("/").filter(Boolean).pop());
        evolutionLine.push({
          id: speciesId,
          name: node.species.name,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`,
        });
      }

      if (node.evolves_to && node.evolves_to.length > 0) {
        const nextNode = node.evolves_to[0];
        // Store the evolution level on the CURRENT Pokemon (the level at which it evolves)
        const minLevel = nextNode.evolution_details?.[0]?.min_level;
        if (evolutionLine.length > 0 && minLevel) {
          evolutionLine[evolutionLine.length - 1].evolvesAtLevel = minLevel;
        }
        traverse(nextNode);
      }
    };

    traverse(chain);

    // Split the chain into before and after the current Pokemon
    const currentIndex = evolutionLine.findIndex((p) => p.id === currentId);
    
    if (currentIndex !== -1) {
      // Create new objects with the correct evolvesAtLevel values from evolutionLine
      const before = evolutionLine.slice(0, currentIndex).map((p, i) => ({
        ...p,
        evolvesAtLevel: evolutionLine[i].evolvesAtLevel
      }));
      
      const after = evolutionLine.slice(currentIndex + 1).map((p, i) => ({
        ...p,
        evolvesAtLevel: evolutionLine[currentIndex + i].evolvesAtLevel
      }));
      
      return { before, after };
    }

    return { before: [], after: [] };
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900" : "bg-white";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const secondaryTextClass = isDark ? "text-gray-400" : "text-gray-600";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 ${bgClass} shadow-lg z-50 overflow-y-auto`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-700 ${textClass}`}
        >
          <X size={24} />
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className={`text-lg ${secondaryTextClass}`}>Loading...</div>
          </div>
        ) : detail ? (
          <div className="p-6 space-y-6">
            {/* Pokemon Image */}
            <div className="flex justify-center">
              <div className={`relative w-40 h-40 transition-all ${
                isCaught ? "grayscale-0" : "grayscale opacity-35 blur-sm"
              }`}>
                <Image
                  src={detail.image}
                  alt={detail.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Index and Name */}
            <div className="text-center">
              <p className={`text-sm font-semibold ${secondaryTextClass} mb-1`}>
                #{String(detail.id).padStart(3, "0")}
              </p>
              <h2 className={`text-3xl font-bold ${textClass} mb-2`}>
                {detail.name.charAt(0).toUpperCase() + detail.name.slice(1)}
              </h2>
              <p className={`text-lg ${secondaryTextClass}`}>{detail.genus}</p>
            </div>

            {/* Types */}
            <div className="flex flex-wrap gap-2 justify-center">
              {detail.types.map((type) => (
                <span
                  key={type}
                  className="text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{
                    backgroundColor: detail.typeColors[type] || "#2b3748",
                  }}
                >
                  {type.toUpperCase()}
                </span>
              ))}
            </div>

            {/* Description */}
            <div>
              <h3 className={`text-sm font-semibold ${textClass} mb-2`}>
                POKÉDEX ENTRY
              </h3>
              <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                {detail.description}
              </p>
            </div>

            {/* Evolutions */}
            {(detail.evolutionsBefore.length > 0 || detail.evolutionsAfter.length > 0) && (
              <div>
                <h3 className={`text-sm font-semibold ${textClass} mb-4`}>
                  EVOLUTION
                </h3>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {/* Previous Evolutions */}
                  {detail.evolutionsBefore.map((evo) => (
                    <div key={evo.id} className="flex items-center gap-2">
                      {/* Previous Pokemon */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16">
                          <Image
                            src={evo.image}
                            alt={evo.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      {/* Level indicator */}
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${isDark ? "bg-gray-800" : "bg-gray-100"} ${secondaryTextClass}`}>
                        {evo.evolvesAtLevel ? `Lvl ${evo.evolvesAtLevel}` : "→"}
                      </div>
                    </div>
                  ))}

                  {/* Current Pokemon */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-16 h-16">
                      <Image
                        src={detail.image}
                        alt={detail.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Next Evolutions */}
                  {detail.evolutionsAfter.map((evo: Evolution) => (
                    <div key={evo.id} className="flex items-center gap-2">
                      {/* Level indicator */}
                      <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${isDark ? "bg-gray-800" : "bg-gray-100"} ${secondaryTextClass}`}>
                        {evo.evolvesAtLevel ? `Lvl ${evo.evolvesAtLevel}` : "→"}
                      </div>

                      {/* Evolution Pokemon */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-16 h-16">
                          <Image
                            src={evo.image}
                            alt={evo.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Caught Status Button */}
            <button
              onClick={() => onToggleCaught(pokemonId)}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                isCaught
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : `${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"} ${textClass}`
              }`}
            >
              {isCaught ? (
                <>
                  <Check size={20} />
                  <span>Caught!</span>
                </>
              ) : (
                "Mark as Caught"
              )}
            </button>

            {/* Navigation */}
            <div className={`flex items-center justify-between pt-4 border-t ${borderClass} gap-4`}>
              {/* Previous Pokemon */}
              <button
                onClick={() => onNavigate("prev")}
                className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${textClass}`}
              >
                <ChevronLeft size={20} />
                <div className="relative w-8 h-8">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id - 1}.png`}
                    alt="previous"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">#{String(detail.id - 1).padStart(3, "0")}</p>
                </div>
              </button>

              {/* Divider */}
              <div className={`w-px h-8 ${borderClass}`} />

              {/* Next Pokemon */}
              <button
                onClick={() => onNavigate("next")}
                className={`flex-1 flex items-center justify-end gap-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition ${textClass}`}
              >
                <div className="text-right">
                  <p className="text-xs font-semibold">#{String(detail.id + 1).padStart(3, "0")}</p>
                </div>
                <div className="relative w-8 h-8">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id + 1}.png`}
                    alt="next"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
