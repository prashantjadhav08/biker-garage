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
        // High-Performance Branding
        brand: {
          black: "#050505",
          dark: "#0F172A",
          offwhite: "#F8F9FA", // Sleek Off-White
          accent: "#F97316", // Chakra Orange
          highlight: "#10B981", // Success Green
          muted: "#64748B",
          glass: "rgba(255, 255, 255, 0.03)",
          "glass-light": "rgba(255, 255, 255, 0.7)",
        },
        primary: "#F97316",
        secondary: "#0F172A",
        cta: "#F97316",
        accent: "#10B981",
      },
      fontFamily: {
        display: ["Syncopate", "sans-serif"],
        mono: ["Space Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'celero-gradient': 'linear-gradient(135deg, #050505 0%, #0F172A 100%)',
        'light-gradient': 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(249, 115, 22, 0.2)',
        'neon-strong': '0 0 40px rgba(249, 115, 22, 0.4)',
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;
