import Image from "next/image";
import { Check } from "lucide-react";

interface PokemonCardProps {
  id: number;
  name: string;
  caught: boolean;
  types: string[];
  hideImages?: boolean;
  isBrowseMode?: boolean;
  onToggleCaught: (id: number) => void;
  typeColors: Record<string, string>;
}

export function PokemonCard({
  id,
  name,
  caught,
  types,
  hideImages = false,
  isBrowseMode = false,
  onToggleCaught,
  typeColors,
}: PokemonCardProps) {
  const officialArtwork = (pokemonId: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  const isCaught = isBrowseMode ? caught : !caught;

  return (
    <div
      onClick={() => onToggleCaught(id)}
      className={`relative rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center bg-light-card dark:bg-pokemon-card border ${
        !caught && !isBrowseMode  
          ? "border-red-500"
          : caught && isBrowseMode
          ? "border-green-500"
          : "border-gray-900 dark:border-gray-400"
      }`}
    >
      {caught && (
        <span
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-transparent text-green-400 border-2 border-green-400 flex items-center justify-center"
        >
          <Check size={14} strokeWidth={4} />
        </span>
      )}

      {/* Pokemon Image */}
      {!hideImages && (
        <div
          className={`w-16 h-16 mb-3 transition-all ${
            isCaught ? "grayscale-0" : "grayscale opacity-35 blur-sm"
          }`}
        >
          <Image
            src={officialArtwork(id)}
            alt={name}
            width={64}
            height={64}
            className="object-contain"
            loading="lazy"
          />
        </div>
      )}

      {/* Pokemon ID */}
      <p className={`text-center text-xs font-semibold mb-1 ${
        isCaught ? "text-gray-400" : "dark:text-white text-light-text"
      }`}>
        N°{String(id).padStart(3, "0")}
      </p>

      {/* Pokemon Name */}
      <p
        className={`text-center text-sm font-bold text-light-text dark:text-white mb-3 transition-opacity ${
          isCaught ? "opacity-100" : "opacity-35"
        }`}
      >
        {name}
      </p>

      {/* Pokemon Types */}
      <div
        className={`flex flex-wrap gap-1 justify-center transition-opacity ${
          isCaught ? "opacity-100" : "opacity-35"
        }`}
      >
        {types.map((type) => (
          <span
            key={type}
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: typeColors[type] || "#2b3748",
              color: "white",
            }}
          >
            {type.toUpperCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
