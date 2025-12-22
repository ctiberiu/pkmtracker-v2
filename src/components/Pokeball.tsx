export function Pokeball({ size = "h-14 w-14" }: { size?: string }) {
  return (
    <div className="flex justify-center mb-8">
      <div className={`relative ${size}`}>
        {/* Red outer circle with rotation animation */}
        <div
          className="absolute inset-0 rounded-full bg-pokemon-red shadow-lg"
          style={{
            boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.3)",
          }}
        />
        {/* Bottom white half */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-full bg-white" />
        {/* Middle divider line */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-pokemon-dark" />
        {/* Center button */}
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-pokemon-dark bg-white" />
      </div>
    </div>
  );
}
