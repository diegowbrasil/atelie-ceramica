import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base — "argila e papel"
        paper: {
          DEFAULT: "#FBF8F3",
          dark: "#181410",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#211B15",
        },
        ink: {
          50: "#F6F3EE",
          100: "#E7E0D6",
          200: "#CFC3B2",
          300: "#A99884",
          400: "#7C6B58",
          500: "#544636",
          600: "#3A2F24",
          700: "#291F17",
          800: "#1C1410",
          900: "#120D0A",
        },
        // Acento — terracota / esmalte queimado (identidade do forno)
        clay: {
          50: "#FBEEE7",
          100: "#F5D8C6",
          200: "#EBB491",
          300: "#DE8E60",
          400: "#CE703F",
          500: "#B85A2C", // acento primário
          600: "#9A4823",
          700: "#7A381B",
          800: "#5A2A15",
          900: "#3D1C0E",
        },
        // Esmalte celadon — segunda cor, usada em confirmações e no forno "seguro"
        glaze: {
          50: "#EEF3EE",
          100: "#D6E3D6",
          300: "#9BB89B",
          500: "#5B8A6C",
          700: "#3A5C46",
        },
        // Estado
        amber: { 500: "#C08A2E" },
        rose: { 500: "#B3503F" },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,20,16,0.04), 0 8px 24px -12px rgba(28,20,16,0.10)",
        card: "0 1px 1px rgba(28,20,16,0.03), 0 2px 8px rgba(28,20,16,0.06)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-flame": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "pulse-flame": "pulse-flame 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
