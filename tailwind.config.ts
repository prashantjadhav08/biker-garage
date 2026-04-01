import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#050505",
          dark: "#0F172A",
          offwhite: "#F8F9FA",
          accent: "#F97316",
          highlight: "#10B981",
          muted: "#64748B",
          glass: "rgba(255, 255, 255, 0.03)",
          "glass-light": "rgba(255, 255, 255, 0.7)",
        },
        primary: "#164E63",
        secondary: "#22D3EE",
        cta: "#22C55E",
        accent: "#F59E0B",
      },
      fontFamily: {
        display: ["Syncopate", "sans-serif"],
        mono: ["Fira Code", "monospace"],
        sans: ["Fira Sans", "sans-serif"],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(249, 115, 22, 0.2)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
