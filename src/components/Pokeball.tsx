export function Pokeball({ size = "w-24 h-24" }: { size?: string }) {
  return (
    <div className="flex justify-center mb-8">
      <div className={`relative ${size}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
          {/* Top half (red) */}
          <circle cx="100" cy="100" r="95" fill="#ef4444" />
          {/* Bottom half (white) */}
          <path d="M 5 100 A 95 95 0 0 1 195 100 L 195 195 A 95 95 0 0 1 5 195 Z" fill="white" />
          {/* Center circle */}
          <circle cx="100" cy="100" r="25" fill="white" stroke="#333" strokeWidth="3" />
          {/* Inner dot */}
          <circle cx="100" cy="100" r="12" fill="#333" />
        </svg>
      </div>
    </div>
  );
}
