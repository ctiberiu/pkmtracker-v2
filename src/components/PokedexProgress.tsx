interface PokedexProgressProps {
  caughtCount: number;
  totalCount: number;
}

export function PokedexProgress({ caughtCount, totalCount }: PokedexProgressProps) {
  const percentage = totalCount > 0 ? Math.round((caughtCount / totalCount) * 100) : 0;

  return (
    <div className="pt-4 bg-pokemon-dark">
      <div className="max-w-7xl mx-auto px-4">
        <div className=" px-4 py-6 bg-pokemon-card border border-pokemon-border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">{caughtCount} / {totalCount} caught</span>
            <span className="text-sm font-semibold text-green-400">{percentage}%</span>
          </div>
          <div className="w-full bg-pokemon-dark rounded-full h-2 overflow-hidden border border-pokemon-border">
            <div
              className="bg-green-500 h-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
