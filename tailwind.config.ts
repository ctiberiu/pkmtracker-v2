import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "pokemon-dark": "#1a1a2e",
        "pokemon-card": "#16213e",
        "pokemon-border": "#0f3460",
        "light-bg": "#f5f5f5",
        "light-card": "#ffffff",
        "light-border": "#e0e0e0",
        "light-text": "#1a1a1a",
        "pokemon-red": "#ef4444",
      },
    },
  },
  plugins: [],
}
export default config;
