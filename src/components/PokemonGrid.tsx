import { PokemonCard as PokemonCardComponent } from "./PokemonCard";

interface Card {
  id: number;
  name: string;
  types: string[];
  caught: boolean;
}

interface PokemonGridProps {
  cards: Card[];
  filteredIdsLength: number;
  hideImages: boolean;
  isBrowseMode?: boolean;
  onToggleCaught: (id: number) => Promise<void>;
  typeColors: Record<string, string>;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

export function PokemonGrid({
  cards,
  filteredIdsLength,
  hideImages,
  isBrowseMode = false,
  onToggleCaught,
  typeColors,
  gridRef,
}: PokemonGridProps) {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-sm text-gray-400 mb-4">Showing {cards.length} of {filteredIdsLength} Pokémon</p>
        <div
          ref={gridRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {cards.map((card) => (
            <PokemonCardComponent
              key={card.id}
              id={card.id}
              name={card.name}
              caught={card.caught}
              types={card.types}
              hideImages={hideImages}
              isBrowseMode={isBrowseMode}
              onToggleCaught={onToggleCaught}
              typeColors={typeColors}
            />
          ))}
        </div>

        {cards.length === 0 && filteredIdsLength === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No Pokémon match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
