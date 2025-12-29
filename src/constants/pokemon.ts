export const genRanges = [
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

export const genById = (id: number): number | null => {
  for (const r of genRanges) {
    if (id >= r.s && id <= r.e) return r.gen;
  }
  return null;
};

export const typeColors: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};
