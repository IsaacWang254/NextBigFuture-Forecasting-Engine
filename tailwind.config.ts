import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "oklch(var(--ink) / <alpha-value>)",
        paper: "oklch(var(--paper) / <alpha-value>)",
        field: "oklch(var(--field) / <alpha-value>)",
        line: "oklch(var(--line) / <alpha-value>)",
        signal: "oklch(var(--signal) / <alpha-value>)",
        copper: "oklch(var(--copper) / <alpha-value>)",
        moss: "oklch(var(--moss) / <alpha-value>)",
        warning: "oklch(var(--warning) / <alpha-value>)"
      },
      boxShadow: {
        panel: "0 18px 60px rgb(45 42 36 / 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
