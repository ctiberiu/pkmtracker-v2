import { useState } from "react";
import { X } from "lucide-react";

const genRanges = [
  { gen: 1, name: "Kanto", s: 1, e: 151 },
  { gen: 2, name: "Johto", s: 152, e: 251 },
  { gen: 3, name: "Hoenn", s: 252, e: 386 },
  { gen: 4, name: "Sinnoh", s: 387, e: 493 },
  { gen: 5, name: "Unova", s: 494, e: 649 },
  { gen: 6, name: "Kalos", s: 650, e: 721 },
  { gen: 7, name: "Alola", s: 722, e: 809 },
  { gen: 8, name: "Galar", s: 810, e: 905 },
  { gen: 9, name: "Paldea", s: 906, e: 1025 },
];

interface CreatePokedexModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, generations: number[]) => Promise<void>;
  isLoading: boolean;
}

export function CreatePokedexModal({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreatePokedexModalProps) {
  const [name, setName] = useState("");
  const [selectedGens, setSelectedGens] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]));
  const [error, setError] = useState<string>("");

  const toggleGen = (gen: number) => {
    const newSet = new Set(selectedGens);
    if (newSet.has(gen)) {
      newSet.delete(gen);
    } else {
      newSet.add(gen);
    }
    setSelectedGens(newSet);
  };

  const toggleAll = () => {
    if (selectedGens.size === genRanges.length) {
      setSelectedGens(new Set());
    } else {
      setSelectedGens(new Set(genRanges.map((r) => r.gen)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedGens.size === 0) return;

    setError("");
    try {
      await onCreate(name, Array.from(selectedGens).sort());
      setName("");
      setSelectedGens(new Set(genRanges.map((r) => r.gen)));
      onClose();
    } catch (err: any) {
      if (err.code === "23505") {
        setError("A Pokédex with this name already exists. Please choose a different name.");
      } else {
        setError("Failed to create Pokédex. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-pokemon-card border border-pokemon-border rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Pokédex</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-400 mb-6">
          Give your Pokédex a name and choose which generation of Pokémon to track.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-900 border border-red-700 rounded-lg text-red-100 text-sm">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold mb-2">Pokédex Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g., My Kanto Adventure"
              className="w-full px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded-lg focus:outline-none focus:border-pokemon-red"
            />
          </div>

          {/* Generation Selection */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold">Generations</label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-pokemon-red hover:text-red-400 transition"
              >
                {selectedGens.size === genRanges.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {genRanges.map((range) => (
                <button
                  key={range.gen}
                  type="button"
                  onClick={() => toggleGen(range.gen)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    selectedGens.has(range.gen)
                      ? "bg-pokemon-red text-white"
                      : "bg-pokemon-dark border border-pokemon-border text-gray-400 hover:border-pokemon-red"
                  }`}
                >
                  Gen {range.gen}
                </button>
              ))}
            </div>

            {selectedGens.size > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                Selected: {Array.from(selectedGens)
                  .sort()
                  .map((gen) => genRanges.find((r) => r.gen === gen)?.name)
                  .join(", ")}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-pokemon-dark border border-pokemon-border rounded-lg hover:border-pokemon-red transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim() || selectedGens.size === 0}
              className="flex-1 px-4 py-2 bg-pokemon-red hover:bg-red-600 disabled:bg-gray-600 rounded-lg text-white font-semibold transition"
            >
              {isLoading ? "Creating..." : "Create Pokédex"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
