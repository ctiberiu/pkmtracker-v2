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
      fontFamily: {
        sans: ["'Outfit'", "sans-serif"],
      },
      colors: {
        "pokemon-dark": "#0f131a",
        "pokemon-card": "#171c26ff",
        "pokemon-border": "hsl(220 20% 18%)",
        "light-bg": "hsl(220 20% 97%)",
        "light-card": "hsl(0 0% 100%)",
        "light-border": "hsl(220 15% 90%)",
        "light-text": "#1a1a1a",
        "pokemon-red": "hsl(0 85% 55%)",
      },
      blur: {
        sm: "1px",
      },
    },
  },
  plugins: [],
}
export default config;
