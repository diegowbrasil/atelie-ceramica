import type { Config } from "tailwindcss";

/** Cor lida de uma CSS custom property "R G B" (space-separated), com suporte
 *  nativo a modificador de opacidade do Tailwind (`bg-accent/40` etc.) — mesmo
 *  valor que `rgbCor()` do demo resolve à mão, aqui expresso do jeito idiomático
 *  do Tailwind (ver CLAUDE.md §8, armadilha de opacidade em token hex). */
function withOpacity(variable: string) {
  return ({ opacityValue }: { opacityValue?: string }) =>
    opacityValue !== undefined ? `rgb(var(${variable}) / ${opacityValue})` : `rgb(var(${variable}))`;
}

// O tipo `Config` do pacote `tailwindcss` não modela cor como função (o
// suporte a `{opacityValue}` é documentado pelo próprio Tailwind, só não
// está refletido no @types) — `as Config["theme"]["extend"]["colors"]`
// não existe porque `extend` também não é opcional lá dentro; `any` local
// e comentado é mais direto que brigar com o tipo por algo que funciona
// de verdade em runtime (confirmado ao vivo, `bg-accent/40` etc. geram CSS
// válido).
const cores: any = {
  // Base — paleta "cru + terracota" do demo (fonte de verdade visual, CLAUDE.md §6.1)
  cream: { DEFAULT: withOpacity("--cream"), soft: withOpacity("--cream-soft") },
  line: withOpacity("--line"),
  ink: { DEFAULT: withOpacity("--ink"), soft: withOpacity("--ink-soft") },
  accent: {
    DEFAULT: withOpacity("--accent"),
    hover: withOpacity("--accent-hover"),
    soft: withOpacity("--accent-soft"),
  },
  // Identidade por turma/oficina — pigmentos de argila (nunca usar como accent/ação)
  sienna: withOpacity("--sienna"),
  ardosia: withOpacity("--ardosia"),
  musgo: withOpacity("--musgo"),
  cafe: withOpacity("--cafe"),
  carvao: withOpacity("--carvao"),
};

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: cores,
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(59,56,51,0.04), 0 8px 24px -12px rgba(59,56,51,0.10)",
        card: "0 1px 1px rgba(59,56,51,0.03), 0 2px 8px rgba(59,56,51,0.06)",
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
