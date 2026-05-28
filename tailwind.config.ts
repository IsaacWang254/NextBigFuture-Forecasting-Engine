import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-eb-garamond)", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        azure: {
          DEFAULT: "rgb(0, 136, 255)",
          50: "rgba(0, 136, 255, 0.05)",
          100: "rgba(0, 136, 255, 0.10)",
          200: "rgba(0, 136, 255, 0.30)",
          600: "rgb(0, 136, 255)",
          700: "rgb(0, 120, 230)",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(15 23 42 / 0.04), 0 1px 3px rgb(15 23 42 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
