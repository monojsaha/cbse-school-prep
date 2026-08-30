import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe",
          300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1",
          600: "#4f46e5", 700: "#4338ca", 800: "#3730a3",
          900: "#312e81", 950: "#1e1b4b",
        },
        math: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe",
          500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8",
        },
        physics: {
          50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe",
          500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9",
        },
        chemistry: {
          50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0",
          500: "#10b981", 600: "#059669", 700: "#047857",
        },
        writing: {
          50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa",
          500: "#f97316", 600: "#ea580c", 700: "#c2410c",
        },
        vocab: {
          50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8",
          500: "#ec4899", 600: "#db2777", 700: "#be185d",
        },
        success: {
          50: "#f0fdf4", 100: "#dcfce7",
          500: "#22c55e", 600: "#16a34a", 700: "#15803d",
        },
        warning: {
          50: "#fffbeb", 100: "#fef3c7",
          500: "#f59e0b", 600: "#d97706", 700: "#b45309",
        },
        error: {
          50: "#fef2f2", 100: "#fee2e2",
          500: "#ef4444", 600: "#dc2626", 700: "#b91c1c",
        },
        xp: { 400: "#fbbf24", 500: "#f59e0b" },
        neutral: {
          50: "#f8fafc", 100: "#f1f5f9", 200: "#e2e8f0",
          300: "#cbd5e1", 400: "#94a3b8", 500: "#64748b",
          600: "#475569", 700: "#334155", 800: "#1e293b",
          900: "#0f172a", 950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-md": "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
        "card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "bounce-in": "bounceIn 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.03)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
