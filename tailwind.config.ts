import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: "#faf6ec",
          100: "#f5efe0",
          200: "#ece1c9",
          300: "#dfcfa9",
          400: "#cfb882",
          900: "#3d3327",
        },
        ink: {
          DEFAULT: "#2b2118",
          soft: "#5c4f40",
          faint: "#8a7a66",
        },
        vermilion: {
          DEFAULT: "#b3402a",
          dark: "#8f2f1d",
          light: "#d96a4f",
        },
        gold: {
          DEFAULT: "#c9a227",
          dark: "#a07f13",
          light: "#e3c265",
        },
        jade: {
          DEFAULT: "#2f8f6b",
          dark: "#1f6b4f",
          light: "#5cb893",
        },
      },
      fontFamily: {
        display: [
          "Georgia",
          "Songti SC",
          "Noto Serif SC",
          "SimSun",
          "serif",
        ],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(43,33,24,0.10), 0 4px 14px rgba(43,33,24,0.07)",
        pop: "0 8px 30px rgba(43,33,24,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
