import Image from "next/image";

interface PokemonCardProps {
  id: number;
  name: string;
  caught: boolean;
  types: string[];
  hideImages?: boolean;
  onToggleCaught: (id: number) => void;
  typeColors: Record<string, string>;
}

export function PokemonCard({
  id,
  name,
  caught,
  types,
  hideImages = false,
  onToggleCaught,
  typeColors,
}: PokemonCardProps) {
  const officialArtwork = (pokemonId: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <div
      onClick={() => onToggleCaught(id)}
      className={`rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center bg-light-card dark:bg-pokemon-card border ${
        caught
          ? "border-gray-900 dark:border-gray-400"
          : "border-gray-200 dark:border-pokemon-border"
      }`}
    >
      {/* Pokemon Image */}
      {!hideImages && (
        <div
          className={`w-16 h-16 mb-3 transition-all ${
            caught ? "grayscale-0" : "grayscale opacity-35"
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
        caught ? "text-gray-400" : "dark:text-white text-light-text"
      }`}>
        N°{String(id).padStart(3, "0")}
      </p>

      {/* Pokemon Name */}
      <p
        className={`text-center text-sm font-bold text-light-text dark:text-white mb-3 transition-opacity ${
          caught ? "opacity-100" : "opacity-35"
        }`}
      >
        {name}
      </p>

      {/* Pokemon Types */}
      <div
        className={`flex flex-wrap gap-1 justify-center transition-opacity ${
          caught ? "opacity-100" : "opacity-35"
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
